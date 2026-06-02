# ============================================================
# push-commits.ps1
# Pushes each unpushed commit ONE AT A TIME to avoid timeouts
# on slow internet connections.
# ============================================================

$MaxRetries = 5
$RetryDelaySeconds = 15

# Get commits from OLDEST to NEWEST (chronological order)
$commits = git log origin/main..main --format="%H" --reverse 2>&1
if ($LASTEXITCODE -ne 0 -or -not $commits) {
    Write-Host "[OK] Nothing to push - already up to date!" -ForegroundColor Green
    exit 0
}

$commitList = @($commits | Where-Object { $_ -match '^[0-9a-f]{40}$' })
$total = $commitList.Count

if ($total -eq 0) {
    Write-Host "[OK] Nothing to push - already up to date!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $total commits to push. Starting one-by-one upload..." -ForegroundColor Cyan
Write-Host ""

$index = 0
foreach ($commit in $commitList) {
    $commit = $commit.Trim()
    if (-not $commit) { continue }

    $index++
    $subject = git log -1 --format="%s" $commit

    # Get file size info for this commit
    $filePath = git diff-tree --no-commit-id -r --name-only $commit
    $fileSize = ""
    if ($filePath) {
        $fullPath = Join-Path (Get-Location) $filePath
        if (Test-Path $fullPath) {
            $sz = [math]::Round((Get-Item $fullPath).Length / 1MB, 2)
            $fileSize = " ($sz MB)"
        }
    }

    Write-Host "------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "[$index/$total] $subject$fileSize" -ForegroundColor Cyan

    $success = $false
    $attempt = 0

    while (-not $success -and $attempt -lt $MaxRetries) {
        $attempt++
        Write-Host "  -> Attempt $attempt/$MaxRetries ..." -ForegroundColor Yellow

        # Push only up to this specific commit
        git push origin "${commit}:refs/heads/main"
        $exitCode = $LASTEXITCODE

        if ($exitCode -eq 0) {
            $success = $true
            Write-Host "  [OK] Pushed successfully!" -ForegroundColor Green
        } else {
            if ($attempt -lt $MaxRetries) {
                Write-Host "  [FAIL] Push failed. Waiting ${RetryDelaySeconds}s before retry..." -ForegroundColor Red
                Start-Sleep -Seconds $RetryDelaySeconds
            }
        }
    }

    if (-not $success) {
        Write-Host ""
        Write-Host "[FATAL] FAILED after $MaxRetries attempts:" -ForegroundColor Red
        Write-Host "        $commit - $subject" -ForegroundColor Red
        Write-Host "        Re-run push-commits.ps1 to resume from here." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "[DONE] All $total commits successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "       Cloudflare Pages will now auto-build the latest." -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Green
