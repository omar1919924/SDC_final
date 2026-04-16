# SDC_final — Competition Jury Guide

This repository contains three main modules:

- `webapp/` — Main platform (FastAPI backend + Next.js frontend)
- `Chat-bot/` — Conversational assistant stack
  - `Chat-bot/Kokoro-FastAPI/` — Local TTS server
  - `Chat-bot/chat_bot/` — Chat logic + widget bridge
- `ai_model/` — Federated stress-model training/inference prototype

---

## 1) Quick Demo (recommended for jury)

### Prerequisites

- Windows + PowerShell
- Python 3.11+ and Python 3.14 (if used in your local backend flow)
- Node.js 18+
- MongoDB running locally (or valid `MONGO_URI`)

Open **separate terminals**.

### Terminal A — Start Kokoro TTS server

```powershell
Set-Location "C:\SDC\Chat-bot\Kokoro-FastAPI"
.\start-cpu.ps1
```

Expected: server running on `http://127.0.0.1:8880`

### Terminal B — Start chatbot widget bridge

If your chatbot uses OpenRouter, set key first:

```powershell
$env:OPENROUTER_API_KEY="YOUR_KEY_HERE"
```

Then run:

```powershell
Set-Location "C:\SDC\Chat-bot\chat_bot\widget"
C:\SDC\Chat-bot\Kokoro-FastAPI\.venv311\Scripts\python.exe -m uvicorn api_bridge:app --host 127.0.0.1 --port 8001
```

Quick health check:

```powershell
Invoke-RestMethod "http://127.0.0.1:8001/health"
```

### Terminal C — Start backend (web platform)

```powershell
Set-Location "C:\SDC\webapp\backend"
C:\SDC\Chat-bot\Kokoro-FastAPI\.venv311\Scripts\python.exe -m pip install -r requirements.txt
C:\SDC\Chat-bot\Kokoro-FastAPI\.venv311\Scripts\python.exe -m uvicorn app.main:app --reload --app-dir C:\SDC\webapp\backend --port 8000
```

### Terminal D — Start frontend (web platform)

```powershell
Set-Location "C:\SDC\webapp\frontend"
npm install
npm run dev
```

Open:

- Main app: `http://localhost:3000`
- Student dashboard: `http://localhost:3000/dashboard/student`
- Chat widget direct: `http://127.0.0.1:8001`

---

## 2) Environment Notes

### Web backend

Create `C:\SDC\webapp\backend\.env` (or copy from `.env.example`) and set at least:

- `MONGO_URI` (example: `mongodb://localhost:27017`)
- `MONGO_DB_NAME` (example: `synstrom1`)

### Frontend

Optional `C:\SDC\webapp\frontend\.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_CHATBOT_IFRAME_URL=http://127.0.0.1:8001
```

---

## 3) Optional: AI Model Module (`ai_model`)

This module is separate from web runtime and can be demonstrated independently.

```powershell
Set-Location "C:\SDC\ai_model"
python -m pip install -r requirements.txt
python data_manager.py --init
python data_manager.py --simulate-feedback 20
python retrain_trigger.py
```

---

## 4) Common Troubleshooting

- **Port already in use**: change port (`--port 8002`, etc.) or stop existing process.
- **`ModuleNotFoundError: motor`**: install backend dependencies via `pip install -r requirements.txt`.
- **`python-multipart` missing**: run `pip install python-multipart` in backend environment.
- **Widget not loading**: verify `http://127.0.0.1:8001/health` returns `{ "status": "ok" }`.
- **No TTS audio**: ensure Kokoro server (Terminal A) is running on `8880`.

---

## 5) What to Show During Jury Demo

1. Start all 4 services.
2. Open student dashboard and show chatbot iframe integration.
3. Send a chat message and show text + audio response.
4. Show teacher/student dashboard flow in `webapp`.
5. (Optional) Run `ai_model` retraining command and explain pipeline outputs.

---

If needed, module-specific docs are in:

- `webapp/README.md`
- `webapp/backend/README.md`
- `webapp/frontend/README.md`
- `ai_model/README.md`
- `Chat-bot/Kokoro-FastAPI/README.md`
