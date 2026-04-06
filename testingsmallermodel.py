# chat_gemini.py
import os
import importlib
try:
    from google import genai
    _USE_NEW_SDK = True
except Exception:
    genai = importlib.import_module("google.generativeai")
    _USE_NEW_SDK = False

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("Set GEMINI_API_KEY first.")

model = "gemini-2.5-flash"

if _USE_NEW_SDK:
    client = genai.Client(api_key=API_KEY)
else:
    genai.configure(api_key=API_KEY)

print("Gemini CLI Chat (type 'exit' to quit)")
print("-" * 40)

while True:
    user = input("You: ").strip()
    if user.lower() in {"exit", "quit"}:
        print("Bye!")
        break
    if not user:
        continue

    try:
        if _USE_NEW_SDK:
            resp = client.models.generate_content(
                model=model,
                contents=user
            )
            answer = resp.text
        else:
            legacy_model = genai.GenerativeModel(model)
            resp = legacy_model.generate_content(user)
            answer = resp.text

        print(f"Gemini: {answer}\n")
    except Exception as e:
        print(f"Error: {e}\n")