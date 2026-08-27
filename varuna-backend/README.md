# VARUNA Backend — Marine Intelligence API

FastAPI backend architecture foundation for Project VARUNA, supporting Firebase Authentication, Cloud Firestore, GCP Cloud Run, and real-time oceanographic telemetry.

---

## 🚀 Quick Start

### 1. Create and Activate Virtual Environment

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

### 4. Run the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📡 API Endpoints

- **Root Status**: `GET /`
- **Health Check**: `GET /health`
- **Interactive Swagger Docs**: `http://localhost:8000/api/v1/docs`
- **Interactive ReDoc**: `http://localhost:8000/api/v1/redoc`

### Map Intelligence Contract

`POST /api/v1/map/intelligence`

```json
{
  "latitude": 17.38,
  "longitude": 83.25,
  "radius_km": 50
}
```

---

## 🧪 Running Tests

```bash
pytest tests/
```
