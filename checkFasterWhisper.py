import os
import site

os.environ["HF_HOME"] = "C:/SDC/hf_cache"

sp = site.getsitepackages()[1]
os.add_dll_directory(os.path.join(sp, "nvidia", "cublas", "bin"))
os.add_dll_directory(os.path.join(sp, "nvidia", "cudnn", "bin"))

from faster_whisper import WhisperModel

model = WhisperModel("base", device="cuda", compute_type="float16")
segments, info = model.transcribe("C:\SDC\Recording.mp3")

for s in segments:
    print(s.text)