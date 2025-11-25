# CloudFront Setup with Custom Domain for MMAD FitBooki
# Creates CloudFront distribution with SSL certificate support

param(
    [Parameter(Mandatory=$true)]
    [string]$CustomDomain,
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "mmadfitbooki-servive",
    [Parameter(Mandatory=$false)]
    [string]$CertificateArn = ""
)

Write-Host "🌐 Setting up CloudFront with custom domain: $CustomDomain" -ForegroundColor Green

try {
    # Step 1: Verify S3 bucket exists and is configured for website hosting
    Write-Host "📦 Verifying S3 bucket configuration..." -ForegroundColor Yellow
    $bucketExists = aws s3api head-bucket --bucket $BucketName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "S3 bucket $BucketName does not exist or is not accessible"
        exit 1
    }

    # Get S3 website endpoint
    $S3WebsiteEndpoint = "$BucketName.s3-website-us-east-1.amazonaws.com"
    Write-Host "✅ S3 website endpoint: $S3WebsiteEndpoint" -ForegroundColor Green

    # Step 2: Request SSL certificate if not provided
    if (-not $CertificateArn) {
        Write-Host "🔒 Requesting SSL certificate for $CustomDomain..." -ForegroundColor Yellow
        
        $certResult = aws acm request-certificate `
            --domain-name $CustomDomain `
            --subject-alternative-names "www.$CustomDomain" `
            --validation-method DNS `
            --region us-east-1 `
            --output json

        if ($LASTEXITCODE -eq 0) {
            $cert = $certResult | ConvertFrom-Json
            $CertificateArn = $cert.CertificateArn
            Write-Host "✅ SSL certificate requested: $CertificateArn" -ForegroundColor Green
            Write-Host "⚠️  IMPORTANT: You must validate the certificate via DNS before proceeding!" -ForegroundColor Red
            Write-Host "   Check your email or AWS Console for validation instructions." -ForegroundColor Yellow
            
            # Wait for user confirmation
            $continue = Read-Host "Have you completed DNS validation? (y/n)"
            if ($continue -ne 'y' -and $continue -ne 'Y') {
                Write-Host "Please complete DNS validation and run this script again with -CertificateArn parameter" -ForegroundColor Yellow
                exit 0
            }
        } else {
            Write-Error "Failed to request SSL certificate"
            exit 1
        }
    }

    # Step 3: Create CloudFront distribution configuration
    Write-Host "☁️ Creating CloudFront distribution..." -ForegroundColor Yellow
    
    $distributionConfig = @"
{
    "CallerReference": "mmad-fitbooki-custom-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Aliases": {
        "Quantity": 2,
        "Items": ["$CustomDomain", "www.$CustomDomain"]
    },
    "Comment": "MMAD FitBooki - Custom Domain Distribution",
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
            },
            "Headers": {
                "Quantity": 1,
                "Items": ["Origin"]
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true,
        "SmoothStreaming": false
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
                    "OriginProtocolPolicy": "http-only",
                    "OriginSslProtocols": {
                        "Quantity": 1,
                        "Items": ["TLSv1.2"]
                    }
                }
            }
        ]
    },
    "Enabled": true,
    "DefaultRootObject": "index.html",
    "CustomErrorResponses": {
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "ViewerCertificate": {
        "ACMCertificateArn": "$CertificateArn",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    },
    "PriceClass": "PriceClass_100",
    "HttpVersion": "http2",
    "IsIPV6Enabled": true
}
"@

    # Save configuration to file
    $distributionConfig | Out-File -FilePath "cloudfront-custom-config.json" -Encoding UTF8

    # Create the distribution
    $result = aws cloudfront create-distribution --distribution-config file://cloudfront-custom-config.json --output json

    if ($LASTEXITCODE -eq 0) {
        $distribution = $result | ConvertFrom-Json
        $distributionId = $distribution.Distribution.Id
        $cloudfrontDomain = $distribution.Distribution.DomainName
        
        Write-Host "✅ CloudFront distribution created successfully!" -ForegroundColor Green
        Write-Host "Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "CloudFront Domain: $cloudfrontDomain" -ForegroundColor Cyan
        Write-Host "Custom Domain: https://$CustomDomain" -ForegroundColor Cyan
        
        # Save distribution info
        $distributionInfo = @{
            DistributionId = $distributionId
            CloudFrontDomain = $cloudfrontDomain
            CustomDomain = $CustomDomain
            CertificateArn = $CertificateArn
            S3Origin = $S3WebsiteEndpoint
            Status = "Deploying"
            CreatedAt = (Get-Date).ToString()
        }
        
        $distributionInfo | ConvertTo-Json | Out-File -FilePath "cloudfront-distribution-info.json" -Encoding UTF8
        
        Write-Host "`n🎉 CloudFront Distribution Setup Complete!" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "`n📋 Distribution Details:" -ForegroundColor White
        Write-Host "• Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "• CloudFront URL: https://$cloudfrontDomain" -ForegroundColor Cyan
        Write-Host "• Custom Domain: https://$CustomDomain" -ForegroundColor Cyan
        Write-Host "• SSL Certificate: Enabled" -ForegroundColor Green
        Write-Host "• HTTP/2: Enabled" -ForegroundColor Green
        Write-Host "• Compression: Enabled" -ForegroundColor Green
        
        Write-Host "`n⏳ Status: Deploying (10-15 minutes)" -ForegroundColor Yellow
        Write-Host "`n🔧 Next Steps:" -ForegroundColor White
        Write-Host "1. Wait for distribution to deploy" -ForegroundColor Yellow
        Write-Host "2. Configure DNS records (run setup-dns.ps1)" -ForegroundColor Yellow
        Write-Host "3. Test your custom domain" -ForegroundColor Yellow
        
        Write-Host "`n💡 DNS Configuration Required:" -ForegroundColor White
        Write-Host "Create these DNS records in your domain registrar:" -ForegroundColor Yellow
        Write-Host "• $CustomDomain → CNAME → $cloudfrontDomain" -ForegroundColor Cyan
        Write-Host "• www.$CustomDomain → CNAME → $cloudfrontDomain" -ForegroundColor Cyan
        
    } else {
        Write-Error "Failed to create CloudFront distribution"
        exit 1
    }

    # Clean up
    Remove-Item "cloudfront-custom-config.json" -ErrorAction SilentlyContinue

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n🚀 Your MMAD FitBooki platform will be available at https://$CustomDomain once DNS is configured!" -ForegroundColor Green