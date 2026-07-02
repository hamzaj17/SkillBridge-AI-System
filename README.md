# 🌉 SkillBridge AI

> AI-powered Skill Gap Analyser & Personalised Learning Roadmap Generator

A full-stack web application that helps students identify the gap between their current skills and the requirements of their desired career path.

---

## 🏗️ Architecture

```
Next.js Frontend (port 3000)
        ↓  Axios + JWT
FastAPI Backend (port 8000)
        ↓  joblib
Random Forest ML Model
        ↓  pymongo
MongoDB Database (port 27017)
```

---

## ✨ Features

| Feature | Tech |
|---|---|
| Career Prediction | Random Forest Classifier |
| Skill Gap Analysis | Set difference on required vs user skills |
| Learning Roadmap | Month-by-month personalised plan |
| Interactive Dashboard | Chart.js Pie, Bar & Line charts |
| Secure Auth | JWT + bcrypt/passlib |
| SSG Pages | Next.js `getStaticProps` (Home, Docs) |
| CSR Dashboard | React hooks (`useState`, `useEffect`) |
| In-memory fallback | Works without MongoDB |

---

## 🚀 Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8000
- API Docs: http://localhost:8000/docs

---

### Option 2 — Manual (Local Dev)

**Prerequisites:** Python 3.10+, Node.js 18+, MongoDB (optional)

```bash
# Clone / enter project
cd skillbridge

# Start everything
chmod +x start.sh
./start.sh
```

Or manually:

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python train_model.py        # only needed once
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

---

## 📁 Project Structure

```
skillbridge/
├── backend/
│   ├── main.py              # FastAPI app + all endpoints
│   ├── train_model.py       # ML training script
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── model.pkl            # Trained RF model (auto-generated)
│   ├── mlb.pkl              # MultiLabelBinarizer
│   ├── label_encoder.pkl    # LabelEncoder
│   ├── metrics.json         # Evaluation results
│   └── career_skills.json   # Required skills per career
│
├── frontend/
│   ├── pages/
│   │   ├── index.js         # Home (SSG)
│   │   ├── docs.js          # Model docs (SSG)
│   │   ├── login.js         # Login (CSR)
│   │   ├── register.js      # Register (CSR)
│   │   └── dashboard.js     # Dashboard (CSR)
│   ├── components/
│   │   └── Navbar.js
│   ├── utils/
│   │   └── api.js           # Axios API client
│   ├── styles/
│   │   └── globals.css
│   ├── next.config.js
│   └── package.json
│
├── docker-compose.yml
├── start.sh
└── README.md
```

---

## 🤖 ML Pipeline

### Stage 1 — Data Gathering
- LinkedIn Job Postings, O\*NET Database, Custom Skill Matrix
- 10 career classes, 60+ skills, 1,200 training samples
- Pydantic models for schema validation

### Stage 2 — Data Cleaning
- `drop_duplicates()` — remove duplicates
- `fillna()` — handle missing values
- Skill name standardisation (Python / python / PYTHON → Python)
- Special character stripping

### Stage 3 — Feature Engineering
- `MultiLabelBinarizer` transforms skill lists into binary vectors
- Each column = one skill (0 or 1)

### Stage 4 — Model Training
- `RandomForestClassifier(n_estimators=200)`
- Stratified 80/20 train/test split
- Model saved with `joblib.dump` and loaded globally at API startup

### Stage 5 — Evaluation
- Accuracy, Precision, Recall, F1-score (macro)
- Results stored in `metrics.json` and displayed on dashboard

---

## 🔒 Security

- Passwords hashed with **bcrypt** via `passlib`
- **JWT tokens** (24-hour expiry) signed with HS256
- Protected routes use `Depends(get_current_user)`
- CORS configured for development (restrict origins in production)

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register new user |
| POST | `/token` | No | Login → returns JWT |
| POST | `/predict` | Yes | Predict career + skill gap |
| GET | `/roadmap` | Yes | Get learning roadmap |
| GET | `/reports` | Yes | User report history |
| GET | `/metrics` | Yes | Model evaluation metrics |
| GET | `/careers` | No | List all career options |
| GET | `/skills` | No | List all known skills |
| GET | `/health` | No | Health check |

Interactive API docs: **http://localhost:8000/docs**

---

> **Note:** The app works fully without MongoDB using an in-memory fallback store. Data is lost on restart but all features remain functional.

---

## 📊 Supported Careers

AI Engineer · Data Analyst · Data Scientist · Frontend Developer · Backend Developer · Full Stack Developer · DevOps Engineer · Cybersecurity Analyst · Cloud Engineer · Mobile Developer

