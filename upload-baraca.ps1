# ============================================================
# upload-baraca.ps1
# Commits Baraca Capital project files to git and pushes
# each commit one at a time - safe for slow internet.
# ============================================================

$MaxRetries = 5
$RetryDelay = 20

function Push-OneCommit {
    param([string]$CommitHash, [string]$Label)
    $attempt = 0
    $success = $false
    while (-not $success -and $attempt -lt $MaxRetries) {
        $attempt++
        Write-Host "  -> Attempt $attempt/$MaxRetries for: $Label" -ForegroundColor Yellow
        git push origin "${CommitHash}:refs/heads/main"
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "  [OK] Pushed: $Label" -ForegroundColor Green
        } else {
            if ($attempt -lt $MaxRetries) {
                Write-Host "  [FAIL] Waiting ${RetryDelay}s before retry..." -ForegroundColor Red
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    if (-not $success) {
        Write-Host "[FATAL] Failed to push: $Label" -ForegroundColor Red
        Write-Host "        Run this script again to resume." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Baraca Capital - Upload Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# -- Step 1: Commit project and code files (small - no video) ----------
Write-Host "[1/4] Committing project data and site updates..." -ForegroundColor Cyan

git add src/data/projects.json
git add src/layouts/Base.astro
git add src/pages/about.astro
git add src/pages/contact.astro
git add src/pages/work/[slug].astro
git add src/styles/pages/contact.css
git add upload-baraca.ps1
git add push-commits.ps1
git add "public/assets/work/project-12/poster.jpg"

git commit -m "feat: add Baraca Capital CEO Interview as selected work #2" `
           -m "- Replaced Cultural Heritage Animation with Baraca Capital project" `
           -m "- Client: Baraca Capital (Dubai real estate)" `
           -m "- Multi-camera edit, text animation, VFX, 3D renders" `
           -m "- Year: 2025" `
           -m "- Added education history to about page" `
           -m "- Updated contact details with copy email and WhatsApp links"

$c1 = (git log -1 --format="%H").Trim()
Write-Host "  Commit: $($c1.Substring(0,7)) - project data and code" -ForegroundColor DarkGray

# -- Step 2: Commit preview MP4 ------------------------------
Write-Host ""
Write-Host "[2/4] Committing preview.mp4..." -ForegroundColor Cyan

git add "public/assets/work/project-12/preview.mp4"
$sz = [math]::Round((Get-Item "public/assets/work/project-12/preview.mp4").Length / 1MB, 2)
git commit -m "feat(assets): add Baraca preview.mp4 ($sz MB)"
$c2 = (git log -1 --format="%H").Trim()
Write-Host "  Commit: $($c2.Substring(0,7)) - preview.mp4 ($sz MB)" -ForegroundColor DarkGray

# -- Step 3: Commit preview WebM -----------------------------
Write-Host ""
Write-Host "[3/4] Committing preview.webm..." -ForegroundColor Cyan

git add "public/assets/work/project-12/preview.webm"
$sz3 = [math]::Round((Get-Item "public/assets/work/project-12/preview.webm").Length / 1MB, 2)
git commit -m "feat(assets): add Baraca preview.webm ($sz3 MB)"
$c3 = (git log -1 --format="%H").Trim()
Write-Host "  Commit: $($c3.Substring(0,7)) - preview.webm ($sz3 MB)" -ForegroundColor DarkGray

# -- Step 4: Commit full video -------------------------------
$fullVideoPath = "public/assets/work/project-12/baraca-full.mp4"
Write-Host ""
Write-Host "[4/4] Committing baraca-full.mp4 (full video)..." -ForegroundColor Cyan

if (Test-Path $fullVideoPath) {
    git add $fullVideoPath
    $sz4 = [math]::Round((Get-Item $fullVideoPath).Length / 1MB, 2)
    git commit -m "feat(assets): add Baraca full video baraca-full.mp4 ($sz4 MB)"
    $c4 = (git log -1 --format="%H").Trim()
    Write-Host "  Commit: $($c4.Substring(0,7)) - baraca-full.mp4 ($sz4 MB)" -ForegroundColor DarkGray
} else {
    Write-Host "  [SKIP] baraca-full.mp4 not ready yet. Run again after compression finishes." -ForegroundColor Yellow
    $c4 = $null
}

# -- Now push each commit --------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Pushing commits one by one..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

Push-OneCommit -CommitHash $c1 -Label "Project data, code updates, and poster"
Push-OneCommit -CommitHash $c2 -Label "preview.mp4"
Push-OneCommit -CommitHash $c3 -Label "preview.webm"
if ($c4) {
    Push-OneCommit -CommitHash $c4 -Label "baraca-full.mp4 (full video)"
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  [DONE] All files uploaded to GitHub!" -ForegroundColor Green
Write-Host "  Cloudflare will auto-build the site." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
