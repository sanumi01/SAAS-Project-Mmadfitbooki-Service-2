# Setup S3 Bucket for Static Website Hosting
# MmadFitbooki Service Deployment Script

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName = "mmadfitbooki-servive"
)

Write-Host "Setting up S3 bucket for static website hosting..." -ForegroundColor Green
Write-Host "Bucket Name: $BucketName" -ForegroundColor Yellow

try {
    # Check if AWS CLI is installed
    $awsVersion = aws --version 2>$null
    if (-not $awsVersion) {
        Write-Error "AWS CLI is not installed or not in PATH. Please install AWS CLI first."
        exit 1
    }
    
    Write-Host "AWS CLI Version: $awsVersion" -ForegroundColor Cyan

    # Create the bucket (if it doesn't exist)
    Write-Host "Creating S3 bucket..." -ForegroundColor Yellow
    aws s3 mb s3://$BucketName --region us-east-1 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bucket created successfully" -ForegroundColor Green
    } else {
        Write-Host "ℹ Bucket already exists or creation failed - continuing..." -ForegroundColor Yellow
    }

    # Enable static website hosting
    Write-Host "Configuring static website hosting..." -ForegroundColor Yellow
    $websiteConfig = @"
{
    "IndexDocument": {
        "Suffix": "index.html"
    },
    "ErrorDocument": {
        "Key": "index.html"
    }
}
"@
    
    $websiteConfig | Out-File -FilePath "website-config.json" -Encoding UTF8
    aws s3api put-bucket-website --bucket $BucketName --website-configuration file://website-config.json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Static website hosting enabled" -ForegroundColor Green
    } else {
        Write-Error "Failed to enable static website hosting"
        exit 1
    }

    # Set bucket policy for public read access
    Write-Host "Setting bucket policy for public access..." -ForegroundColor Yellow
    $bucketPolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BucketName/*"
        }
    ]
}
"@
    
    $bucketPolicy | Out-File -FilePath "bucket-policy.json" -Encoding UTF8
    aws s3api put-bucket-policy --bucket $BucketName --policy file://bucket-policy.json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bucket policy set for public access" -ForegroundColor Green
    } else {
        Write-Error "Failed to set bucket policy"
        exit 1
    }

    # Clean up temporary files
    Remove-Item "website-config.json" -ErrorAction SilentlyContinue
    Remove-Item "bucket-policy.json" -ErrorAction SilentlyContinue

    # Get the website URL
    $websiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
    
    Write-Host "`n🎉 S3 Static Website Setup Complete!" -ForegroundColor Green
    Write-Host "Website URL: $websiteUrl" -ForegroundColor Cyan
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Run the deployment script: .\deploy-to-s3.ps1" -ForegroundColor White
    Write-Host "2. Visit your website at: $websiteUrl" -ForegroundColor White

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}