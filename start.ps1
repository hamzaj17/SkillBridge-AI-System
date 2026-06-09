$ErrorActionPreference = "Stop"

Write-Host "========================================"
Write-Host "   SkillBridge AI - Dev Setup"
Write-Host "========================================"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$python = Join-Path $root "venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  $python = "python"
}

Write-Host ""
Write-Host "> Setting up backend..."
Push-Location $backend
try {
  if (-not (Test-Path "model.pkl")) {
    Write-Host "  Training ML model (first run)..."
    & $python train_model.py
  }

  & $python -m pip install -r requirements.txt -q

  Write-Host "  Starting FastAPI on http://localhost:8000"
  $backendProcess = Start-Process -FilePath $python -ArgumentList @(
    "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"
  ) -PassThru -WindowStyle Hidden
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "> Setting up frontend..."
Push-Location $frontend
try {
  if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing npm packages..."
    npm install
  }

  Write-Host "  Starting Next.js on http://localhost:3000"
  $env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
  $frontendProcess = Start-Process -FilePath "npm" -ArgumentList @("run", "dev") -PassThru -WindowStyle Hidden
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "========================================"
Write-Host "  SkillBridge AI is running!"
Write-Host ""
Write-Host "  Frontend:  http://localhost:3000"
Write-Host "  Backend:   http://localhost:8000"
Write-Host "  API Docs:  http://localhost:8000/docs"
Write-Host "========================================"
Write-Host ""
Write-Host "Press Ctrl+C to stop all services."

try {
  while (-not $backendProcess.HasExited -and -not $frontendProcess.HasExited) {
    Start-Sleep -Seconds 1
  }
}
finally {
  if ($backendProcess -and -not $backendProcess.HasExited) { Stop-Process -Id $backendProcess.Id -Force }
  if ($frontendProcess -and -not $frontendProcess.HasExited) { Stop-Process -Id $frontendProcess.Id -Force }
}
