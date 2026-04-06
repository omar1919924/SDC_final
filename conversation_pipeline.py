import os
import site
import importlib
import requests
import sounddevice as sd
import soundfile as sf
import numpy as np
from typing import Any
from pathlib import Path

# Configuration
GEMINI_MODEL = "gemini-2.5-flash"
KOKORO_API = "http://127.0.0.1:8880/v1/audio/speech"
OUTPUT_DIR = Path("C:\\SDC\\sound_output")
STT_MODEL_SIZE = "medium.en"
STT_DEVICE = "cuda"
STT_COMPUTE_TYPE = "float16"
STT_LANGUAGE = "en"
MIC_SAMPLE_RATE = 16000
MIC_CHANNELS = 1
MIC_DURATION_SECONDS = 6

_STT_MODEL: Any | None = None
_WHISPER_MODEL_CLASS: Any | None = None
_GEMINI_CLIENT: Any | None = None


def _configure_stt_runtime_paths() -> None:
    os.environ.setdefault("HF_HOME", "C:/SDC/hf_cache")

    try:
        site_packages = site.getsitepackages()
    except Exception:
        site_packages = []

    base_path = None
    for candidate in reversed(site_packages):
        if os.path.isdir(candidate):
            base_path = candidate
            break

    if base_path is None:
        return

    dll_paths = [
        os.path.join(base_path, "nvidia", "cublas", "bin"),
        os.path.join(base_path, "nvidia", "cudnn", "bin"),
    ]

    add_dll_directory = getattr(os, "add_dll_directory", None)
    if add_dll_directory is None:
        return

    for dll_path in dll_paths:
        if os.path.isdir(dll_path):
            try:
                add_dll_directory(dll_path)
            except Exception:
                continue


def _get_whisper_model_class() -> Any:
    global _WHISPER_MODEL_CLASS
    if _WHISPER_MODEL_CLASS is not None:
        return _WHISPER_MODEL_CLASS

    _configure_stt_runtime_paths()
    from faster_whisper import WhisperModel as FasterWhisperModel

    _WHISPER_MODEL_CLASS = FasterWhisperModel
    return _WHISPER_MODEL_CLASS


def _get_gemini_client() -> Any:
    global _GEMINI_CLIENT
    if _GEMINI_CLIENT is not None:
        return _GEMINI_CLIENT

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")

    try:
        from google import genai as google_genai
    except Exception:
        legacy_genai = importlib.import_module("google.generativeai")
        legacy_genai.configure(api_key=api_key)
        _GEMINI_CLIENT = legacy_genai
        return _GEMINI_CLIENT

    _GEMINI_CLIENT = google_genai.Client(api_key=api_key)
    return _GEMINI_CLIENT


def _is_cuda_runtime_error(error: Exception) -> bool:
    message = str(error).lower()
    indicators = [
        "cublas64_12.dll",
        "cublas",
        "cudnn",
        "cudart",
        "cuda",
        "onnxruntimeerror",
        "failed to load",
        "loadlibrary",
    ]
    return any(indicator in message for indicator in indicators)


def _load_stt_model(device: str, compute_type: str) -> Any:
    print(f"Loading STT model '{STT_MODEL_SIZE}' on {device} ({compute_type})...")
    whisper_model_class = _get_whisper_model_class()
    model = whisper_model_class(
        STT_MODEL_SIZE,
        device=device,
        compute_type=compute_type,
    )
    print(f"STT model ready on {device}.\n")
    return model


def _force_cpu_stt_model() -> Any:
    global _STT_MODEL
    _STT_MODEL = _load_stt_model(device="cpu", compute_type="int8")
    return _STT_MODEL


def get_stt_model() -> Any:
    """Load faster-whisper model once; prefer GPU and fall back to CPU if needed."""
    global _STT_MODEL
    if _STT_MODEL is not None:
        return _STT_MODEL

    try:
        _STT_MODEL = _load_stt_model(device=STT_DEVICE, compute_type=STT_COMPUTE_TYPE)
        return _STT_MODEL
    except Exception as gpu_error:
        print(f"GPU STT init failed: {gpu_error}")
        print("Falling back to CPU int8 for STT...")
        return _force_cpu_stt_model()


def record_microphone_clip(
    duration_seconds: int = MIC_DURATION_SECONDS,
    sample_rate: int = MIC_SAMPLE_RATE,
) -> Path | None:
    """Record a short mono clip from the microphone and save it as WAV."""
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        mic_path = (OUTPUT_DIR / "mic_input.wav").resolve()

        print(
            f"🎤 Listening for {duration_seconds}s... speak now (or type 'exit' next turn to quit)."
        )
        frames = int(duration_seconds * sample_rate)
        audio = sd.rec(
            frames,
            samplerate=sample_rate,
            channels=MIC_CHANNELS,
            dtype="float32",
        )
        sd.wait()

        if audio.size == 0:
            print("Microphone capture returned empty audio.")
            return None

        peak = float(np.max(np.abs(audio)))
        if peak < 0.003:
            print("Mic input too quiet. Please speak louder.\n")
            return None

        sf.write(str(mic_path), audio, sample_rate)
        return mic_path
    except Exception as e:
        print(f"Error recording microphone: {e}\n")
        return None


def speech_to_text_from_mic() -> str:
    """Capture microphone audio and transcribe with faster-whisper."""
    clip_path = record_microphone_clip()
    if clip_path is None:
        return ""

    try:
        model = get_stt_model()
        try:
            segments, _ = model.transcribe(
                str(clip_path),
                language=STT_LANGUAGE,
                vad_filter=True,
                beam_size=1,
                best_of=1,
                temperature=0.0,
                condition_on_previous_text=False,
            )
        except Exception as transcribe_error:
            if not _is_cuda_runtime_error(transcribe_error):
                raise

            print(f"GPU STT runtime error: {transcribe_error}")
            print("Switching STT to CPU and retrying transcription once...")
            model = _force_cpu_stt_model()
            segments, _ = model.transcribe(
                str(clip_path),
                language=STT_LANGUAGE,
                vad_filter=True,
                beam_size=1,
                best_of=1,
                temperature=0.0,
                condition_on_previous_text=False,
            )

        text = " ".join(segment.text.strip() for segment in segments if segment.text)
        text = " ".join(text.split())
        if not text:
            print("No speech recognized.\n")
            return ""

        print(f"You (voice): {text}\n")
        return text
    except Exception as e:
        print(f"Error transcribing audio: {e}\n")
        return ""

def query_llama(prompt: str) -> str:
    """Send prompt to Gemini and get response text."""
    try:
        client = _get_gemini_client()

        if hasattr(client, "models"):
            response = client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
            )
            answer = getattr(response, "text", "")
        else:
            legacy_model = client.GenerativeModel(GEMINI_MODEL)
            response = legacy_model.generate_content(prompt)
            answer = getattr(response, "text", "")

        answer = (answer or "").strip()
        if answer:
            return answer
        return "I couldn't generate a response right now. Please try again."
    except Exception as error:
        return f"Error querying Gemini: {error}"

def text_to_speech(text: str, filename: str = "response.wav") -> str:
    """Send text to Kokoro TTS and save audio."""
    try:
        payload = {
            "input": text,
            "voice": "af_heart",
            "response_format": "wav",
            "stream": False
        }
        response = requests.post(KOKORO_API, json=payload, timeout=30)
        if response.ok:
            OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
            filepath = (OUTPUT_DIR / filename).resolve()
            with open(filepath, "wb") as f:
                f.write(response.content)

            if not filepath.exists() or filepath.stat().st_size == 0:
                print(f"TTS save error: file missing or empty at {filepath}")
                return None

            return str(filepath)
        else:
            print(f"TTS Error: {response.text}")
            return None
    except Exception as e:
        print(f"Error generating speech: {e}")
        return None

def play_audio(filepath: str) -> None:
    """Play audio file with sounddevice + soundfile."""
    try:
        path_obj = Path(filepath).resolve()
        if not path_obj.exists():
            print(f"Audio file not found: {path_obj}\n")
            return
        if path_obj.stat().st_size == 0:
            print(f"Audio file is empty: {path_obj}\n")
            return

        print(f"Playing audio: {path_obj}")
        data, samplerate = sf.read(str(path_obj))
        sd.play(data, samplerate)
        sd.wait()
        print("Playback finished.\n")

    except Exception as e:
        print(f"Error playing audio: {e}\n")

def main():
    """Main conversation loop."""
    print("=" * 60)
    print("Conversation Pipeline: Voice/Text → Gemini → Kokoro TTS")
    print("=" * 60)
    print("Make sure GEMINI_API_KEY is set and Kokoro-FastAPI is running!")
    print("Type text, or press Enter for microphone input.")
    print("Type 'exit' to quit.\n")

    try:
        get_stt_model()
    except Exception as init_error:
        print(f"STT initialization error: {init_error}")
        print("Install `faster-whisper` and try again.\n")

    counter = 0
    while True:
        try:
            user_input = input("You: ").strip()

            if user_input == "":
                user_input = speech_to_text_from_mic()
                if not user_input:
                    continue

            if user_input.lower() == "exit":
                print("Goodbye!")
                break

            if not user_input:
                print("Please enter something.\n")
                continue

            # Query Gemini
            print("\n🤖 Gemini is thinking...")
            llama_response = query_llama(user_input)
            print(f"Gemini: {llama_response}\n")

            # Generate speech
            print("🔊 Generating speech...")
            
            audio_file = f"response.wav"
            audio_path = text_to_speech(llama_response, audio_file)

            if audio_path:
                play_audio(audio_path)
            else:
                print("Failed to generate speech.\n")

        except KeyboardInterrupt:
            print("\n\nInterrupted. Goodbye!")
            break
        except Exception as e:
            print(f"Error: {e}\n")

if __name__ == "__main__":
    main()