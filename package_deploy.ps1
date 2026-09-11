# PowerShell script to create deployment ZIP for Hostinger / cPanel
$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$outDir = Join-Path $scriptDir "out"
$zipPath = Join-Path $scriptDir "sugar_build.zip"

if (-not (Test-Path $outDir)) {
    Write-Error "Error: 'out' directory not found. Please run 'npm run build' first."
    exit 1
}

# Ensure .htaccess exists in out directory
$htaccessPublic = Join-Path $scriptDir "public\.htaccess"
$htaccessOut = Join-Path $outDir ".htaccess"
if (Test-Path $htaccessPublic) {
    Copy-Item $htaccessPublic $htaccessOut -Force
}

# Remove existing zip if present
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "Creating deployment archive at: $zipPath ..."

Add-Type -AssemblyName "System.IO.Compression"
Add-Type -AssemblyName "System.IO.Compression.FileSystem"

# Open a new ZipArchive to create entries with POSIX forward slashes
$zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
$zipArchive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create)

try {
    $files = Get-ChildItem -Path $outDir -Recurse -Force
    foreach ($file in $files) {
        if (-not $file.PSIsContainer) {
            # Standardize relative path with forward slash
            $relPath = $file.FullName.Substring($outDir.Length + 1).Replace("\", "/")
            $entry = $zipArchive.CreateEntry($relPath, [System.IO.Compression.CompressionLevel]::Optimal)
            $entryStream = $entry.Open()
            $fileStream = [System.IO.File]::OpenRead($file.FullName)
            $fileStream.CopyTo($entryStream)
            $fileStream.Dispose()
            $entryStream.Dispose()
        }
    }
}
finally {
    $zipArchive.Dispose()
    $zipStream.Dispose()
}

$zipItem = Get-Item $zipPath
$sizeMb = [math]::Round($zipItem.Length / 1MB, 2)
Write-Host "Deployment package created successfully! Size: $sizeMb MB ($($zipItem.Length) bytes)"

$readZip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
$names = $readZip.Entries | ForEach-Object { $_.FullName }
Write-Host "Verification: Total entries: $($names.Count)"
Write-Host "Verification: .htaccess present: $($names -contains '.htaccess')"
Write-Host "Verification: index.html present: $($names -contains 'index.html')"
Write-Host "Verification: api/contact.php present: $($names -contains 'api/contact.php')"
Write-Host "Verification: api/waitlist.php present: $($names -contains 'api/waitlist.php')"
Write-Host "Verification: admin/index.html present: $($names -contains 'admin/index.html')"
$readZip.Dispose()

