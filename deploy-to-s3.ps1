# Deploy MmadFitbooki Service to S3
# Uploads the built dist/ folder to S3 bucket

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName = "mmadfitbooki-servive"
)

Write-Host "Deploying MmadFitbooki Service to S3..." -ForegroundColor Green
Write-Host "Bucket Name: $BucketName" -ForegroundColor Yellow

try {
    # Check if dist folder exists
    if (-not (Test-Path "dist")) {
        Write-Error "dist folder not found. Please run 'npm run build' first."
        exit 1
    }

    # Check if AWS CLI is installed
    $awsVersion = aws --version 2>$null
    if (-not $awsVersion) {
        Write-Error "AWS CLI is not installed or not in PATH. Please install AWS CLI first."
        exit 1
    }

    Write-Host "AWS CLI Version: $awsVersion" -ForegroundColor Cyan

    # Sync the dist folder to S3
    Write-Host "Uploading files to S3..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$BucketName --delete --cache-control "max-age=31536000" --exclude "*.html"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to sync assets to S3"
        exit 1
    }

    # Upload HTML files with no cache
    Write-Host "Uploading HTML files with no-cache headers..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$BucketName --delete --cache-control "no-cache, no-store, must-revalidate" --include "*.html"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to upload HTML files to S3"
        exit 1
    }

    # Set correct content types
    Write-Host "Setting content types..." -ForegroundColor Yellow
    aws s3 cp s3://$BucketName/index.html s3://$BucketName/index.html --metadata-directive REPLACE --content-type "text/html" --cache-control "no-cache, no-store, must-revalidate"

    # Get the website URL
    $websiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
    
    Write-Host "`n🎉 Deployment Complete!" -ForegroundColor Green
    Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
    Write-Host "`nYour MmadFitbooki Service is now live!" -ForegroundColor Yellow
    Write-Host "Visit: $websiteUrl" -ForegroundColor White

    # Optional: Open the website in default browser
    $openBrowser = Read-Host "`nWould you like to open the website in your browser? (y/n)"
    if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
        Start-Process $websiteUrl
    }

} catch {
    Write-Error "An error occurred during deployment: $($_.Exception.Message)"
    exit 1
}