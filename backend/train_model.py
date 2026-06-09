"""
Train the SkillBridge Random Forest classifier.
Run once to produce model.pkl and label_encoder.pkl.
"""
import json, joblib, numpy as np, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MultiLabelBinarizer, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# ── Synthetic skill/career dataset ──────────────────────────────────────────
CAREER_SKILLS = {
    "AI Engineer": [
        "Python","TensorFlow","PyTorch","Machine Learning","Deep Learning",
        "Docker","Kubernetes","FastAPI","NLP","Computer Vision","Git","Linux"
    ],
    "Data Analyst": [
        "Python","SQL","Excel","Power BI","Tableau","Statistics","Pandas",
        "NumPy","Data Visualization","R","Business Intelligence","Excel"
    ],
    "Data Scientist": [
        "Python","Machine Learning","Statistics","SQL","Pandas","NumPy",
        "Scikit-Learn","TensorFlow","Data Visualization","R","Jupyter","Git"
    ],
    "Frontend Developer": [
        "HTML","CSS","JavaScript","React","TypeScript","Next.js","Vue.js",
        "Figma","Responsive Design","Git","REST APIs","TailwindCSS"
    ],
    "Backend Developer": [
        "Python","Node.js","SQL","PostgreSQL","MongoDB","Docker","REST APIs",
        "FastAPI","Django","Git","Linux","Redis"
    ],
    "Full Stack Developer": [
        "JavaScript","React","Node.js","SQL","MongoDB","Docker","Git",
        "TypeScript","HTML","CSS","REST APIs","AWS"
    ],
    "DevOps Engineer": [
        "Docker","Kubernetes","CI/CD","Linux","AWS","Terraform","Ansible",
        "Jenkins","Git","Bash","Monitoring","Security"
    ],
    "Cybersecurity Analyst": [
        "Networking","Linux","Python","Security","Penetration Testing",
        "Firewalls","SIEM","Cryptography","Risk Assessment","Incident Response"
    ],
    "Cloud Engineer": [
        "AWS","Azure","GCP","Docker","Kubernetes","Terraform","Linux",
        "Networking","Python","CI/CD","Monitoring","Security"
    ],
    "Mobile Developer": [
        "Swift","Kotlin","React Native","Flutter","Java","Android","iOS",
        "REST APIs","Git","UI/UX","Firebase","Dart"
    ],
}

ALL_SKILLS = sorted(set(s for skills in CAREER_SKILLS.values() for s in skills))

def generate_samples(n_per_class=120):
    X, y = [], []
    for career, core_skills in CAREER_SKILLS.items():
        for _ in range(n_per_class):
            # always include 60-90% of core skills + random noise
            k = max(3, int(len(core_skills) * np.random.uniform(0.6, 0.95)))
            chosen = list(np.random.choice(core_skills, size=k, replace=False))
            # add 0-3 random skills from other careers
            noise_count = np.random.randint(0, 4)
            noise = list(np.random.choice(ALL_SKILLS, size=noise_count, replace=False))
            sample = list(set(chosen + noise))
            X.append(sample)
            y.append(career)
    return X, y

X_raw, y_raw = generate_samples(120)

mlb = MultiLabelBinarizer(classes=ALL_SKILLS)
X = mlb.fit_transform(X_raw)

le = LabelEncoder()
y = le.fit_transform(y_raw)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

clf = RandomForestClassifier(n_estimators=200, max_depth=None, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
metrics = {
    "accuracy":  round(accuracy_score(y_test, y_pred), 4),
    "precision": round(precision_score(y_test, y_pred, average="macro"), 4),
    "recall":    round(recall_score(y_test, y_pred, average="macro"), 4),
    "f1_score":  round(f1_score(y_test, y_pred, average="macro"), 4),
}
print("Model metrics:", metrics)

joblib.dump(clf, "model.pkl")
joblib.dump(mlb, "mlb.pkl")
joblib.dump(le,  "label_encoder.pkl")
with open("metrics.json", "w") as f:
    json.dump(metrics, f)

# Save required skills per career for gap analysis
with open("career_skills.json", "w") as f:
    json.dump(CAREER_SKILLS, f)

print("Saved model.pkl, mlb.pkl, label_encoder.pkl, metrics.json, career_skills.json")
