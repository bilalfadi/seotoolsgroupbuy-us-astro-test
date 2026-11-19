# Run this file inside the extracted Astro project in Downloads\website2.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'Node.js is not installed or is not in PATH. Install Node.js 22+ first.'
  exit 1
}
Write-Host 'Step 1/3: Download and rewrite WordPress image references.' -ForegroundColor Cyan
node scripts/migrate-media.mjs
if ($LASTEXITCODE -ne 0) { Write-Error 'Image download could not complete. Check internet/DNS and rerun.'; exit $LASTEXITCODE }
Write-Host 'Step 2/3: Generate link and image audit.' -ForegroundColor Cyan
node scripts/audit-migration.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Step 3/3: Validate imported JSON.' -ForegroundColor Cyan
node scripts/verify.mjs
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Done. Review migration\media-report.json and migration\link-and-media-audit.json.' -ForegroundColor Green
Write-Host 'Do not move production DNS or push GitHub until final design and functionality checks pass.'
