$ErrorActionPreference = 'Stop'
Write-Host '=== AgentOS doctor ===' -ForegroundColor Cyan
Write-Host "Node: $(node --version)"
Write-Host "npm:  $(npm --version)"
Write-Host "Repo root: $PSScriptRoot\.."
Write-Host 'Check complete.' -ForegroundColor Green
