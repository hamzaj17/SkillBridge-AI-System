from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import joblib, json, os
from pymongo import MongoClient
from bson import ObjectId
import numpy as np

# ── Config ───────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "skillbridge-secret-key-change-in-prod-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24h
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

# ── Load ML artifacts ────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)
clf       = joblib.load(os.path.join(BASE, "model.pkl"))
mlb       = joblib.load(os.path.join(BASE, "mlb.pkl"))
le        = joblib.load(os.path.join(BASE, "label_encoder.pkl"))
with open(os.path.join(BASE, "metrics.json"))        as f: MODEL_METRICS   = json.load(f)
with open(os.path.join(BASE, "career_skills.json"))  as f: CAREER_SKILLS   = json.load(f)

ROADMAP_TEMPLATES = {
    "AI Engineer":         [["Python basics","NumPy","Pandas"],["Scikit-Learn","ML concepts"],["TensorFlow or PyTorch"],["FastAPI","Docker"],["Cloud deployment (AWS/GCP)"]],
    "Data Analyst":        [["Excel","SQL basics"],["Python","Pandas"],["Matplotlib","Seaborn"],["Power BI or Tableau"],["Statistics & storytelling"]],
    "Data Scientist":      [["Python","Statistics"],["Pandas","NumPy","Scikit-Learn"],["Machine Learning algorithms"],["Deep Learning intro"],["End-to-end project + deployment"]],
    "Frontend Developer":  [["HTML","CSS","JavaScript basics"],["React or Vue.js"],["TypeScript","Git"],["TailwindCSS","UI/UX principles"],["Next.js","REST API integration"]],
    "Backend Developer":   [["Python or Node.js","SQL"],["REST API design","FastAPI/Django"],["MongoDB","Redis"],["Docker","Authentication"],["CI/CD","Testing"]],
    "Full Stack Developer":[["HTML","CSS","JavaScript"],["React","Node.js","SQL"],["REST APIs","MongoDB"],["Docker","Git","TypeScript"],["AWS / deployment pipelines"]],
    "DevOps Engineer":     [["Linux basics","Bash scripting"],["Docker","CI/CD (GitHub Actions)"],["Kubernetes fundamentals"],["Terraform","Ansible"],["AWS / Monitoring & alerting"]],
    "Cybersecurity Analyst":[["Networking basics","Linux"],["Security fundamentals","Cryptography"],["Penetration testing tools"],["SIEM","Incident response"],["Certifications: CEH / CompTIA"]],
    "Cloud Engineer":      [["Linux","Networking"],["AWS / Azure fundamentals"],["Docker","Kubernetes"],["Terraform","CI/CD"],["Cost optimisation & security"]],
    "Mobile Developer":    [["Swift (iOS) or Kotlin (Android)"],["React Native or Flutter"],["Firebase","REST APIs"],["UI/UX for mobile","Git"],["App Store deployment"]],
}

# ── DB ───────────────────────────────────────────────────────────────────────
try:
    client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=3000)
    client.admin.command("ping")
    db = client["skillbridge"]
    MONGO_OK = True
except Exception:
    MONGO_OK = False
    db = None

def get_col(name):
    if not MONGO_OK:
        return None
    return db[name]

# In-memory fallback stores
_users_store: dict = {}
_skills_store: dict = {}
_reports_store: list = []

# ── Auth ─────────────────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if MONGO_OK:
        user = db["users"].find_one({"username": username})
    else:
        user = _users_store.get(username)
    if user is None:
        raise credentials_exception
    return user

# ── Pydantic schemas ─────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class SkillInput(BaseModel):
    skills: List[str]
    desired_career: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="SkillBridge AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "mongo": MONGO_OK}

@app.post("/register", status_code=201)
def register(data: UserRegister):
    if MONGO_OK:
        if db["users"].find_one({"username": data.username}):
            raise HTTPException(400, "Username already exists")
        if db["users"].find_one({"email": data.email}):
            raise HTTPException(400, "Email already registered")
        db["users"].insert_one({
            "username": data.username,
            "email": data.email,
            "password": hash_password(data.password),
            "created_at": datetime.utcnow(),
        })
    else:
        if data.username in _users_store:
            raise HTTPException(400, "Username already exists")
        _users_store[data.username] = {
            "username": data.username,
            "email": data.email,
            "password": hash_password(data.password),
        }
    return {"message": "User registered successfully"}

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if MONGO_OK:
        user = db["users"].find_one({"username": form_data.username})
    else:
        user = _users_store.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user["username"]},
                                timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": token, "token_type": "bearer"}

@app.post("/predict")
def predict(data: SkillInput, current_user=Depends(get_current_user)):
    user_skills = [s.strip() for s in data.skills if s.strip()]
    if not user_skills:
        raise HTTPException(400, "Provide at least one skill")

    # Binarize
    X = mlb.transform([user_skills])
    pred_label = clf.predict(X)[0]
    predicted_career = le.inverse_transform([pred_label])[0]

    # Probability for top careers
    proba = clf.predict_proba(X)[0]
    top_idx = np.argsort(proba)[::-1][:5]
    top_careers = [
        {"career": le.inverse_transform([i])[0], "probability": round(float(proba[i]) * 100, 1)}
        for i in top_idx
    ]

    # Skill gap
    required = CAREER_SKILLS.get(predicted_career, [])
    missing = [s for s in required if s not in user_skills]
    matched = [s for s in required if s in user_skills]
    match_pct = round(len(matched) / len(required) * 100) if required else 0

    # Save report
    report = {
        "user_id": str(current_user.get("_id", current_user.get("username"))),
        "username": current_user["username"],
        "predicted_career": predicted_career,
        "user_skills": user_skills,
        "missing_skills": missing,
        "matched_skills": matched,
        "match_percentage": match_pct,
        "top_careers": top_careers,
        "created_at": datetime.utcnow().isoformat(),
    }
    if MONGO_OK:
        db["reports"].insert_one(report)
    else:
        _reports_store.append(report)

    return {
        "predicted_career": predicted_career,
        "match_percentage": match_pct,
        "missing_skills": missing,
        "matched_skills": matched,
        "top_careers": top_careers,
        "user_skills": user_skills,
    }

@app.get("/roadmap")
def roadmap(career: str = None, current_user=Depends(get_current_user)):
    if not career:
        # get last prediction
        if MONGO_OK:
            rep = db["reports"].find_one(
                {"username": current_user["username"]}, sort=[("created_at", -1)]
            )
            career = rep["predicted_career"] if rep else list(ROADMAP_TEMPLATES.keys())[0]
        else:
            career = list(ROADMAP_TEMPLATES.keys())[0]

    phases = ROADMAP_TEMPLATES.get(career, ROADMAP_TEMPLATES["Data Scientist"])
    return {
        "career": career,
        "phases": [{"month": i + 1, "topics": p} for i, p in enumerate(phases)],
    }

@app.get("/reports")
def get_reports(current_user=Depends(get_current_user)):
    if MONGO_OK:
        reps = list(db["reports"].find(
            {"username": current_user["username"]}, {"_id": 0}
        ).sort("created_at", -1).limit(10))
    else:
        reps = [r for r in reversed(_reports_store) if r["username"] == current_user["username"]][:10]
    return {"reports": reps}

@app.get("/metrics")
def get_metrics(current_user=Depends(get_current_user)):
    return MODEL_METRICS

@app.get("/careers")
def list_careers():
    return {"careers": list(CAREER_SKILLS.keys())}

@app.get("/skills")
def list_skills():
    return {"skills": sorted(set(s for skills in CAREER_SKILLS.values() for s in skills))}
