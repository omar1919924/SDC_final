import requests

# Query llama3.2 API
response = requests.post(
    "http://localhost:11434/api/generate",
    json={
        "model": "llama3.2",
        "prompt": "Your question here",
        "stream": False
    }
)

result = response.json()
print(result["response"])