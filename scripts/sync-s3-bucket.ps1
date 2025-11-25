<#
.SYNOPSIS
    Safely copy contents from an existing S3 bucket to a new bucket named from the GitHub repo name and preview local replacements.

.DESCRIPTION
    This script helps you "rename" an S3 bucket by creating a new bucket (name derived from your repo name), performing
    an `aws s3 sync` (dry-run by default), and previewing any local file replacements where the old bucket name appears.

.NOTES
    - Requires AWS CLI v2 and git in PATH and an authenticated AWS profile.
    - Does not delete the old bucket automatically.
    - Runs in dry-run mode by default. Use -ConfirmAndRun to perform the actual sync and commit replacements.
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$OldBucket = 'mmad-fitbooki-service',

    [Parameter(Mandatory=$false)]
    [string]$RepoName = 'SAAS-Project-Mmadfitbooki-Service',

    [Parameter(Mandatory=$false)]
    [string]$Region = '',

    [switch]$ConfirmAndRun,

    [switch]$Force
)

function To-S3BucketName {
    param([string]$name)
    # Normalize: lowercase, replace non-alphanumeric with '-', collapse repeats, trim '-'
    $s = $name.ToLower()
    $s = -join ($s.ToCharArray() | ForEach-Object { if ($_ -match '[a-z0-9-]') { $_ } elseif ($_ -match '\s') { '-' } else { '-' } })
    # collapse multiple '-'
    $s = $s -replace '-{2,}','-'
    # trim leading/trailing '-'
    $s = $s.Trim('-')
    if ($s.Length -gt 63) { $s = $s.Substring(0,63).TrimEnd('-') }
    return $s
}

Write-Host "Old bucket:" $OldBucket
$NewBucket = To-S3BucketName -name $RepoName
Write-Host "Proposed new bucket (derived from repo name):" $NewBucket

# Get AWS region if not provided
if (-not $Region -or $Region -eq '') {
    try {
        $cfgRegion = & aws configure get region 2>$null
        if ($cfgRegion) { $Region = $cfgRegion }
        else { $Region = 'us-east-1' }
    } catch { $Region = 'us-east-1' }
}

Write-Host "Using AWS region:" $Region

# Quick checks
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI not found in PATH. Install and configure the AWS CLI before running this script."
    exit 1
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "git not found in PATH. Install git before running this script."
    exit 1
}

try {
    $who = & aws sts get-caller-identity 2>$null | Out-String
    if (-not $who) { throw 'no-aws' }
} catch {
    Write-Error "AWS CLI not configured / cannot call STS. Configure AWS credentials (aws configure) before running."
    exit 1
}

# Ensure we're in a git repo and working tree is clean
$gitStatus = & git status --porcelain
if ($gitStatus) {
    Write-Warning "Working tree is not clean. Please commit or stash changes before running this script."
    if (-not $Force) { Write-Host "Use -Force to continue anyway."; exit 1 }
}

Write-Host "--- S3 Dry-run preview ---"
Write-Host "Counting objects in old bucket (this may take a moment):"
try {
    & aws s3 ls "s3://$OldBucket" --recursive | Measure-Object -Line | ForEach-Object { Write-Host "Objects found:" $_.Lines }
} catch {
    Write-Warning "Could not list objects in s3://$OldBucket — ensure the bucket exists and your credentials have s3:ListBucket.";
}

Write-Host "Running aws s3 sync --dryrun from s3://$OldBucket to s3://$NewBucket"
& aws s3 sync "s3://$OldBucket" "s3://$NewBucket" --region $Region --dryrun | ForEach-Object { Write-Host $_ }

Write-Host "--- Local repository preview: searching for occurrences of the old bucket name ---"
$repoRoot = (git rev-parse --show-toplevel) 2>$null
if (-not $repoRoot) { $repoRoot = Get-Location }
Write-Host "Repository root: $repoRoot"

# Search for exact bucket name and also a more permissive pattern
$exactMatches = & git grep -n --line-number --heading --unmatched -- "${OldBucket}" 2>$null
$partialMatches = & git grep -n --line-number --heading --unmatched -- "mmad-fitbooki" 2>$null

if ($exactMatches) {
    Write-Host "Files with exact bucket name occurrences:"
    $exactMatches | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "No exact occurrences of '$OldBucket' found in the repo (good)."
}

if ($partialMatches) {
    Write-Host "Files with 'mmad-fitbooki' occurrences (may be unrelated):"
    $partialMatches | ForEach-Object { Write-Host $_ }
} else {
    Write-Host "No partial 'mmad-fitbooki' occurrences found."
}

Write-Host "--- Preview local replacement that would be made (dry-run) ---"
if ($exactMatches) {
    # Create a preview branch and show diffs
    $previewBranch = 's3-bucket-rename-preview'
    Write-Host "Creating temporary preview branch: $previewBranch"
    & git checkout -b $previewBranch 2>$null | Out-Null

    $files = ($exactMatches | ForEach-Object { ($_ -split ':',2)[0] } | Sort-Object -Unique)
    foreach ($f in $files) {
        Write-Host "Previewing replacement in file: $f"
        $content = Get-Content $f -Raw
        $newcontent = $content -replace [Regex]::Escape($OldBucket), $NewBucket
        if ($content -ne $newcontent) { Set-Content -Path $f -Value $newcontent -Force }
    }

    & git add -A
    Write-Host "Staged diff (preview):"
    & git --no-pager diff --staged | ForEach-Object { Write-Host $_ }

    Write-Host "Resetting preview changes and returning to original branch. No changes committed in dry-run."
    & git reset --hard HEAD 2>$null | Out-Null
    & git checkout - 2>$null | Out-Null
    & git branch -D $previewBranch 2>$null | Out-Null
} else {
    Write-Host "No replacements to preview."
}

Write-Host "--- Next steps / Actions available ---"
Write-Host "1) To perform the actual S3 sync, re-run this script with the -ConfirmAndRun switch."
Write-Host "   Example: .\scripts\sync-s3-bucket.ps1 -OldBucket 'mmad-fitbooki-service' -RepoName 'SAAS-Project-Mmadfitbooki-Service' -ConfirmAndRun"
Write-Host "2) If you want the script to also apply and commit local replacements, add -ConfirmAndRun -Force (force bypasses clean-worktree check)."
Write-Host "3) After successful sync, consider verifying website/app and then manually delete the old bucket if desired."

if ($ConfirmAndRun) {
    Write-Host "User requested confirm-and-run. Creating new bucket if it doesn't exist..."
    # Check if bucket exists
    $exists = & aws s3api head-bucket --bucket $NewBucket 2>$null; $code=$LASTEXITCODE
    if ($code -ne 0) {
        Write-Host "Creating bucket: $NewBucket"
        if ($Region -eq 'us-east-1') {
            & aws s3api create-bucket --bucket $NewBucket --region $Region | ForEach-Object { Write-Host $_ }
        } else {
            & aws s3api create-bucket --bucket $NewBucket --region $Region --create-bucket-configuration LocationConstraint=$Region | ForEach-Object { Write-Host $_ }
        }
    } else {
        Write-Host "Bucket $NewBucket already exists. Proceeding to sync."
    }

    Write-Host "Starting actual sync (this will copy objects to the new bucket):"
    & aws s3 sync "s3://$OldBucket" "s3://$NewBucket" --region $Region --exact-timestamps | ForEach-Object { Write-Host $_ }

    # Optionally update files and commit
    if ($exactMatches) {
        Write-Host "Applying local file replacements and committing to a new branch 's3-bucket-rename'"
        $branch = 's3-bucket-rename'
        & git checkout -b $branch
        $files = ($exactMatches | ForEach-Object { ($_ -split ':',2)[0] } | Sort-Object -Unique)
        foreach ($f in $files) {
            (Get-Content $f -Raw) -replace [Regex]::Escape($OldBucket), $NewBucket | Set-Content -Path $f -Force
            & git add $f
        }
        & git commit -m "Replace S3 bucket name $OldBucket -> $NewBucket" | ForEach-Object { Write-Host $_ }
        Write-Host "Created branch '$branch' with replacements. Push and open a PR when ready."
    } else {
        Write-Host "No local file replacements were required."
    }

    Write-Host "Done. Verify the new bucket and your app before removing the original bucket."
}

Write-Host "Script finished. Dry-run mode used unless -ConfirmAndRun was specified."
