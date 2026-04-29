$ErrorActionPreference = 'Stop'
$repoRoot = Resolve-Path "$PSScriptRoot\.."
$statusFile = Join-Path $repoRoot 'status_bundle.txt'
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

$content = @"
PROJECT: AgentOS
PHASE: Phase-1 starter repo scaffold
LAST_UPDATED: $timestamp

CURRENT_STATE:
- Product definition exists.
- Codex-ready onboarding exists.
- Phase-1 monorepo scaffold exists.
- Dependency install/build verification has not been performed in this environment.

NEXT_ACTIONS:
- Run scripts/setup-dev.ps1
- Run scripts/validate.ps1
- Launch desktop shell with scripts/dev.ps1
- Complete the first vertical slice from docs/03_execution/PHASE_1_BUILD_ORDER.md
"@

Set-Content -Path $statusFile -Value $content -Encoding UTF8
Write-Host "Updated $statusFile" -ForegroundColor Green
