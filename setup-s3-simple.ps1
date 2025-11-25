# Simple S3 Setup Script for MmadFitbooki Service

$BucketName = "mmadfitbooki-servive"

Write-Host "Setting up S3 bucket: $BucketName" -ForegroundColor Green

# Create bucket
Write-Host "Creating S3 bucket..." -ForegroundColor Yellow
aws s3 mb s3://$BucketName --region us-east-1

# Enable website hosting
Write-Host "Enabling static website hosting..." -ForegroundColor Yellow
aws s3 website s3://$BucketName --index-document index.html --error-document index.html

# Create bucket policy file
$policyContent = @"
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

$policyContent | Out-File -FilePath "policy.json" -Encoding UTF8

# Apply bucket policy
Write-Host "Setting bucket policy..." -ForegroundColor Yellow
aws s3api put-bucket-policy --bucket $BucketName --policy file://policy.json

# Clean up
Remove-Item "policy.json" -ErrorAction SilentlyContinue

$websiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
Write-Host "Setup complete! Website URL: $websiteUrl" -ForegroundColor Green