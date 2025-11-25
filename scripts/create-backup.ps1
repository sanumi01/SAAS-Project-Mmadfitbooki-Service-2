param(
  [string]$OutDir = "backup-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
)

Write-Host "Creating backup folder: $OutDir"

$root = Get-Location
$exclude = @('.git','node_modules','dist','build')

New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

Get-ChildItem -Path $root -Force | ForEach-Object {
    if ($exclude -contains $_.Name) { return }
    $dest = Join-Path -Path $OutDir -ChildPath $_.Name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force -ErrorAction SilentlyContinue
    } else {
        Copy-Item -Path $_.FullName -Destination $dest -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Backup completed: $OutDir"
