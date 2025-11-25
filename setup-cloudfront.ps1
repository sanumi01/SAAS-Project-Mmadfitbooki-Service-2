# CloudFront CDN Setup for MMAD FitBooki
# Enables HTTPS, global content delivery, and faster loading

param(
    [Parameter(Mandatory=$true)]
    [string]$BucketName = "mmadfitbooki-servive",
    [Parameter(Mandatory=$false)]
    [string]$DomainName = ""
)

Write-Host "Setting up CloudFront CDN for MMAD FitBooki..." -ForegroundColor Green

try {
    # Get S3 website endpoint
    $S3WebsiteEndpoint = "$BucketName.s3-website-us-east-1.amazonaws.com"
    
    # Create CloudFront distribution configuration
    $distributionConfig = @"
{
    "CallerReference": "mmad-fitbooki-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Comment": "MMAD FitBooki CDN Distribution",
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BucketName",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BucketName",
                "DomainName": "$S3WebsiteEndpoint",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100"
}
"@

    # Save configuration to file
    $distributionConfig | Out-File -FilePath "cloudfront-config.json" -Encoding UTF8

    Write-Host "Creating CloudFront distribution..." -ForegroundColor Yellow
    $result = aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --output json

    if ($LASTEXITCODE -eq 0) {
        $distribution = $result | ConvertFrom-Json
        $distributionId = $distribution.Distribution.Id
        $domainName = $distribution.Distribution.DomainName
        
        Write-Host "✓ CloudFront distribution created successfully!" -ForegroundColor Green
        Write-Host "Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "CloudFront URL: https://$domainName" -ForegroundColor Cyan
        Write-Host "Status: Deploying (this may take 10-15 minutes)" -ForegroundColor Yellow
        
        # Save distribution info
        @{
            DistributionId = $distributionId
            DomainName = $domainName
            S3Origin = $S3WebsiteEndpoint
            Status = "Deploying"
        } | ConvertTo-Json | Out-File -FilePath "cloudfront-info.json" -Encoding UTF8
        
        Write-Host "`n🎉 CloudFront Setup Complete!" -ForegroundColor Green
        Write-Host "Your MMAD FitBooki platform will be available at:" -ForegroundColor White
        Write-Host "HTTPS URL: https://$domainName" -ForegroundColor Cyan
        Write-Host "`nBenefits enabled:" -ForegroundColor Yellow
        Write-Host "✓ HTTPS encryption" -ForegroundColor White
        Write-Host "✓ Global CDN (faster loading worldwide)" -ForegroundColor White
        Write-Host "✓ Gzip compression" -ForegroundColor White
        Write-Host "✓ Caching optimization" -ForegroundColor White
        
    } else {
        Write-Error "Failed to create CloudFront distribution"
        exit 1
    }

    # Clean up
    Remove-Item "cloudfront-config.json" -ErrorAction SilentlyContinue

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}