# Tourist Info API - Setup and Running Guide

This guide will walk you through setting up and running the Tourist Info API project.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Git (optional, for cloning the repository)

## Setup Instructions

### 1. Clone the Repository (if not already done)
```bash
git clone <repository-url>
cd julienmn-AI-python
```

### 2. Create and Activate a Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables

1. Create a `.env` file in the project root if it doesn't exist
2. Add your API keys and configurations (check the `.env.example` if available)

### 5. Run the Application

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```

The server will start at `http://127.0.0.1:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: http://127.0.0.1:8000/docs
- Alternative API docs: http://127.0.0.1:8000/redoc

## Available Endpoints

### 1. Lookup Place Information
- **Endpoint:** `POST /api/lookup`
- **Request Body:**
  ```json
  {
    "lat": 51.8646,
    "lng": -0.4236,
    "lang": "en"
  }
  ```

### 2. Text-to-Speech Conversion
- **Endpoint:** `POST /api/tts`
- **Request Body:**
  ```json
  {
    "text": "Your text here",
    "language": "en"
  }
  ```

## Troubleshooting

- If you encounter port conflicts, specify a different port:
  ```bash
  uvicorn app.main:app --reload --port 8001
  ```
- Make sure all required environment variables are set in your `.env` file
- If you get dependency errors, try:
  ```bash
  pip install --upgrade -r requirements.txt
  ```

## Stopping the Application

Press `Ctrl+C` in the terminal where the server is running to stop the application.
