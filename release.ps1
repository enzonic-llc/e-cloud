$ErrorActionPreference = "Stop"
$StartTime = Get-Date

$RepoUrl = "https://github.com/enzonic-llc/e-cloud.git"
$TmpDir = "tmp"
$RepoDir = Join-Path $TmpDir "e-cloud"
$ReleaseDir = "release"

function Invoke-FrontendBuild {
    Write-Host "Cleaning compiled frontend assets..."
    $AssetsPath = Join-Path (Get-Location) "public/assets"
    if (Test-Path $AssetsPath) {
        Get-ChildItem -Path $AssetsPath -Recurse -Include '*.js','*.map','*.json' -File | Remove-Item -Force
    }

    Write-Host "Building the panel (production assets)..."
    $env:NODE_ENV = "production"
    $env:NODE_OPTIONS = "--max_old_space_size=8192 --openssl-legacy-provider"

    & yarn.cmd build:production
    $BuildExitCode = $LASTEXITCODE

    if ($BuildExitCode -ne 0) {
        throw "Frontend build failed with exit code $BuildExitCode"
    }
}

Invoke-FrontendBuild

Write-Host "Preparing temporary workspace..."
if (Test-Path $TmpDir) {
    Remove-Item -Recurse -Force $TmpDir
}
New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

Write-Host "Cloning the base panel repository..."
git clone --depth 1 $RepoUrl $RepoDir | Out-Null

Write-Host "Removing git metadata from cloned repository..."
$GitMetadata = Join-Path $RepoDir ".git"
if (Test-Path $GitMetadata) {
    Remove-Item -Recurse -Force $GitMetadata
}

Write-Host "Copying current workspace files into cloned repository..."
$ExcludeDirs = @(
    ".git",
    ".github",
    $TmpDir,
    $ReleaseDir,
    "node_modules",
    "vendor",
    "storage\logs",
    "storage\framework\cache",
    "storage\framework\sessions",
    "storage\framework\testing"
)
$ExcludeFiles = @("panel.tar.gz", "panel.zip")

$RobocopyArgs = @(
    ".",
    $RepoDir,
    "/E",
    "/COPY:DAT",
    "/R:2",
    "/W:5",
    "/NFL",
    "/NDL",
    "/NP",
    "/NS",
    "/NC"
)

if ($ExcludeDirs.Count -gt 0) {
    $RobocopyArgs += "/XD"
    $RobocopyArgs += $ExcludeDirs
}

if ($ExcludeFiles.Count -gt 0) {
    $RobocopyArgs += "/XF"
    $RobocopyArgs += $ExcludeFiles
}

robocopy @RobocopyArgs | Out-Null
$RobocopyExit = $LASTEXITCODE
if ($RobocopyExit -gt 3) {
    throw "Robocopy failed with exit code $RobocopyExit"
}

Write-Host "Preparing release directory..."
if (Test-Path $ReleaseDir) {
    Remove-Item -Recurse -Force $ReleaseDir
}
New-Item -ItemType Directory -Force -Path $ReleaseDir | Out-Null
$ReleaseFullPath = (Resolve-Path $ReleaseDir).Path

Write-Host "Creating archives..."
$TarPath = Join-Path $ReleaseFullPath "panel.tar.gz"
tar -czf $TarPath -C $RepoDir .

$ZipPath = Join-Path $ReleaseFullPath "panel.zip"
Push-Location $RepoDir
Get-ChildItem -Force | Compress-Archive -DestinationPath $ZipPath -Force
Pop-Location

Write-Host "Cleaning up temporary workspace..."
Remove-Item -Recurse -Force $TmpDir

$EndTime = Get-Date
$Duration = $EndTime - $StartTime
$Seconds = [math]::Round($Duration.TotalSeconds)

Write-Host "Build in $Seconds seconds"
