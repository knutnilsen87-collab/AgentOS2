$ErrorActionPreference = 'Stop'

Write-Host '=== AgentOS setup-dev ===' -ForegroundColor Cyan
Write-Host 'Checking Node and npm...' -ForegroundColor Yellow
node --version
npm --version

Write-Host 'Installing workspace dependencies...' -ForegroundColor Yellow
npm install

Write-Host 'Updating status bundle...' -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File "$PSScriptRoot\update-status-bundle.ps1"

Write-Host 'Setup complete.' -ForegroundColor Green
