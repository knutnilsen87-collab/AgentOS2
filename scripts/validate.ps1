$ErrorActionPreference = 'Stop'
Write-Host '=== AgentOS validation ===' -ForegroundColor Cyan
npm run typecheck
npm run build
Write-Host 'Validation complete.' -ForegroundColor Green
