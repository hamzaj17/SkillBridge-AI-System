#!/bin/bash
# SkillBridge AI - local development startup script
set -e

echo "========================================"
echo "   SkillBridge AI - Dev Setup"
echo "========================================"

echo ""
echo "> Setting up backend..."
cd backend

if [ ! -f model.pkl ]; then
  echo "  Training ML model (first run)..."
  python train_model.py
fi

pip install -r requirements.txt -q

echo "  Starting FastAPI on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

cd ..

echo ""
echo "> Setting up frontend..."
cd frontend

if [ ! -d node_modules ]; then
  echo "  Installing npm packages..."
  npm install
fi

echo "  Starting Next.js on http://localhost:3000"
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev &
FRONTEND_PID=$!

cd ..

echo ""
echo "========================================"
echo "  SkillBridge AI is running!"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:8000"
echo "  API Docs:  http://localhost:8000/docs"
echo "========================================"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
