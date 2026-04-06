import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel

whisper_model = WhisperModel("medium", device="cuda", compute_type="float16")

sd.default.device = (1, 3)
NATIVE_SR = 48000
WHISPER_SR = 16000

while True:
    print("🎤 Listening for 5 seconds...")
    audio = sd.rec(int(5 * NATIVE_SR), samplerate=NATIVE_SR, channels=1, dtype="float32")
    sd.wait()

    samples_16k = int(len(audio) * WHISPER_SR / NATIVE_SR)
    audio_resampled = np.interp(
        np.linspace(0, len(audio), samples_16k),
        np.arange(len(audio)),
        audio.flatten()
    )

    segments, _ = whisper_model.transcribe(audio_resampled, language="en")
    text = " ".join(segment.text for segment in segments).strip()

    print(f"You said: {text}\n")