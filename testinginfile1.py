import sounddevice as sd
import numpy as np
from faster_whisper import WhisperModel

whisper_model = WhisperModel("medium", device="cuda", compute_type="float16")

while True:
    print("🎤 Listening for 5 seconds...")
    audio = sd.rec(int(5 * 16000), samplerate=16000, channels=1, dtype="float32")
    sd.wait()

    segments, _ = whisper_model.transcribe(audio.flatten(), language="en")
    text = " ".join(segment.text for segment in segments).strip()

    print(f"You said: {text}\n")