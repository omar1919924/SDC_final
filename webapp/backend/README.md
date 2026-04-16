# SynStrom FastAPI MongoDB Backend

This is a clean, modular, and production-ready backend built with FastAPI and MongoDB (Motor).

## Prerequisites
- Python 3.11+
- MongoDB instance running (local or Atlas)

## Setup Instructions

1. **Clone the repository and enter the directory**  
   If not already inside the project structure, navigate to it:
   ```bash
   cd path/to/SynStrom1
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On Unix/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   Copy the example `.env` file to `.env` and fill it out:
   ```bash
   cp .env.example .env
   ```
   *Make sure `MONGO_URI` points exactly to your running database (e.g., `mongodb://localhost:27017`)*.

5. **Run the Application**
   Run the app using Uvicorn:
   ```bash
   uvicorn app.main:app --reload
   ```

6. **API Documentation**
   Once running, you can access the interactive Swagger documentation here:
   - [Swagger UI](http://127.0.0.1:8000/docs)
   - [ReDoc](http://127.0.0.1:8000/redoc)

## Project Architecture
```
.
├── .env.example
├── requirements.txt
└── app/
    ├── main.py
    ├── database/     # MongoDB async client using Motor
    ├── models/       # Base PyObjectId models 
    ├── schemas/      # Pydantic payloads for requests/responses
    ├── controllers/  # FastAPI REST routes (auth, users, teachers, parents)
    ├── services/     # Business logic & Database queries
    └── utils/        # Logger, Security helpers
```
