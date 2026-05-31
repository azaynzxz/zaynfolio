$srcRoot = "D:\Portfolio\Feed"
$dstRoot = "D:\Praktek\Zaynfolio 2\public\assets\gallery"

# Map folder names to clean slugs
$folderMap = @{
    "At-Tanwir Mosque"                = "at-tanwir"
    "Fili Stuff"                      = "fili-stuff"
    "ID Card Lampung"                 = "idcard-lampung"
    "Kelasstruktur.com"               = "kelasstruktur"
    "Pusat Desain Industri Nasional"  = "pdin"
}

$counter = 1

foreach ($folder in Get-ChildItem $srcRoot -Directory) {
    $slug = $folderMap[$folder.Name]
    if (-not $slug) { $slug = $folder.Name -replace '[^a-zA-Z0-9]', '-' -replace '-+', '-' | ForEach-Object { $_.ToLower() } }
    
    Write-Host "`n=== Processing: $($folder.Name) => $slug ===" -ForegroundColor Cyan
    
    foreach ($file in Get-ChildItem $folder.FullName -File) {
        $ext = $file.Extension.ToLower()
        $paddedNum = "{0:D2}" -f $counter
        
        if ($ext -eq ".mp4") {
            # Copy mp4 as-is, also convert to webm
            $dstMp4 = Join-Path $dstRoot "g${paddedNum}-${slug}.mp4"
            Copy-Item $file.FullName $dstMp4
            Write-Host "  Copied MP4: g${paddedNum}-${slug}.mp4"
            
            $dstWebm = Join-Path $dstRoot "g${paddedNum}-${slug}.webm"
            & ffmpeg -i $file.FullName -c:v libvpx-vp9 -crf 35 -b:v 0 -row-mt 1 -speed 4 -an -y $dstWebm 2>$null
            Write-Host "  Converted WebM: g${paddedNum}-${slug}.webm"
        }
        elseif ($ext -in @(".jpg", ".jpeg", ".png", ".gif")) {
            $dstWebp = Join-Path $dstRoot "g${paddedNum}-${slug}.webp"
            & ffmpeg -i $file.FullName -quality 82 -y $dstWebp 2>$null
            Write-Host "  Converted WebP: g${paddedNum}-${slug}.webp"
        }
        else {
            Write-Host "  Skipped: $($file.Name)" -ForegroundColor Yellow
        }
        
        $counter++
    }
}

Write-Host "`n=== Done! Total files processed: $($counter - 1) ===" -ForegroundColor Green
