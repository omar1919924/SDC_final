import soundcard as sc
import numpy as np
from faster_whisper import WhisperModel
import os

venv = r"C:\SDC\Kokoro-FastAPI\.venv311"
os.environ["PATH"] = ";".join([
    os.path.join(venv, r"Lib\site-packages\nvidia\cublas\bin"),
    os.path.join(venv, r"Lib\site-packages\nvidia\cudnn\bin"),
]) + ";" + os.environ["PATH"]
whisper_model = WhisperModel("large-v3", device="cuda", compute_type="int8")
NATIVE_SR = 48000
WHISPER_SR = 16000
DURATION = 5

mic = sc.default_microphone()
print(f"Using mic: {mic.name}")

while True:
    print("🎤 Listening for 5 seconds...")
    with mic.recorder(samplerate=NATIVE_SR, channels=2) as recorder:
        audio = recorder.record(numframes=int(NATIVE_SR * DURATION))

    # Mix stereo to mono
    audio_mono = audio.mean(axis=1)

    samples_16k = int(len(audio_mono) * WHISPER_SR / NATIVE_SR)
    audio_resampled = np.interp(
        np.linspace(0, len(audio_mono), samples_16k),
        np.arange(len(audio_mono)),
        audio_mono
    )
    # After the resampling, before transcribe()
    print(f"Audio shape: {audio_resampled.shape}, dtype: {audio_resampled.dtype}")
    print(f"Audio max amplitude: {np.max(np.abs(audio_resampled)):.4f}")

    segments, info = whisper_model.transcribe(audio_resampled, language="en")
    segments = list(segments)  # force the lazy generator NOW
    print(f"Detected language: {info.language}, segments: {len(segments)}")
    text = " ".join(s.text for s in segments).strip()
    print(f"You said: {text}\n")

    segments, _ = whisper_model.transcribe(audio_resampled, language="en")
    text = " ".join(segment.text for segment in segments).strip()
    print(f"You said: {text}\n")