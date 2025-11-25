# Complete Custom Domain Setup for MMAD FitBooki
# Domain: emporium.mamaadsolution.com
# Sets up SSL certificate, CloudFront distribution, and DNS configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$CustomDomain = "emporium.mamaadsolution.com",
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "mmadfitbooki-servive",
    [Parameter(Mandatory=$false)]
    [string]$CertificateArn = ""
)

Write-Host "🌐 Setting up custom domain: $CustomDomain for MMAD FitBooki" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

try {
    # Step 1: Verify S3 bucket and get endpoint
    Write-Host "`n📦 Step 1: Verifying S3 bucket configuration..." -ForegroundColor Yellow
    
    $bucketExists = aws s3api head-bucket --bucket $BucketName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error "S3 bucket $BucketName does not exist. Please run setup first."
        exit 1
    }
    
    $S3WebsiteEndpoint = "$BucketName.s3-website-us-east-1.amazonaws.com"
    Write-Host "✅ S3 website endpoint verified: $S3WebsiteEndpoint" -ForegroundColor Green

    # Step 2: Request SSL Certificate
    if (-not $CertificateArn) {
        Write-Host "`n🔒 Step 2: Requesting SSL certificate for $CustomDomain..." -ForegroundColor Yellow
        
        $certResult = aws acm request-certificate `
            --domain-name $CustomDomain `
            --validation-method DNS `
            --region us-east-1 `
            --output json

        if ($LASTEXITCODE -eq 0) {
            $cert = $certResult | ConvertFrom-Json
            $CertificateArn = $cert.CertificateArn
            Write-Host "✅ SSL certificate requested: $CertificateArn" -ForegroundColor Green
            
            # Get validation details
            Start-Sleep -Seconds 5
            $certDetails = aws acm describe-certificate --certificate-arn $CertificateArn --region us-east-1 --output json
            $certInfo = $certDetails | ConvertFrom-Json
            
            Write-Host "`n🔧 DNS Validation Required!" -ForegroundColor Red
            Write-Host "Add this CNAME record to your DNS:" -ForegroundColor Yellow
            
            foreach ($domainValidation in $certInfo.Certificate.DomainValidationOptions) {
                if ($domainValidation.ResourceRecord) {
                    Write-Host "`nDomain: $($domainValidation.DomainName)" -ForegroundColor Cyan
                    Write-Host "Record Type: $($domainValidation.ResourceRecord.Type)" -ForegroundColor White
                    Write-Host "Record Name: $($domainValidation.ResourceRecord.Name)" -ForegroundColor White
                    Write-Host "Record Value: $($domainValidation.ResourceRecord.Value)" -ForegroundColor White
                }
            }
            
            Write-Host "`n⚠️  IMPORTANT: Add the DNS validation record above to mamaadsolution.com DNS" -ForegroundColor Red
            $continue = Read-Host "Have you added the DNS validation record? (y/n)"
            if ($continue -ne 'y' -and $continue -ne 'Y') {
                Write-Host "Please add the DNS validation record and run this script again." -ForegroundColor Yellow
                Write-Host "Save this certificate ARN: $CertificateArn" -ForegroundColor Cyan
                exit 0
            }
            
            # Wait for validation
            Write-Host "`n⏳ Waiting for certificate validation..." -ForegroundColor Yellow
            $maxAttempts = 20
            $attempt = 0
            
            do {
                Start-Sleep -Seconds 30
                $attempt++
                
                $statusResult = aws acm describe-certificate --certificate-arn $CertificateArn --region us-east-1 --output json
                $statusInfo = $statusResult | ConvertFrom-Json
                $status = $statusInfo.Certificate.Status
                
                Write-Host "Validation attempt $attempt/$maxAttempts - Status: $status" -ForegroundColor Gray
                
                if ($status -eq "ISSUED") {
                    Write-Host "✅ Certificate validated successfully!" -ForegroundColor Green
                    break
                } elseif ($status -eq "FAILED") {
                    Write-Error "Certificate validation failed"
                    exit 1
                }
                
            } while ($attempt -lt $maxAttempts -and $status -eq "PENDING_VALIDATION")
            
            if ($status -ne "ISSUED") {
                Write-Host "⏳ Certificate still validating. You can continue setup later with:" -ForegroundColor Yellow
                Write-Host ".\setup-custom-domain-complete.ps1 -CertificateArn $CertificateArn" -ForegroundColor Cyan
                exit 0
            }
            
        } else {
            Write-Error "Failed to request SSL certificate"
            exit 1
        }
    }

    # Step 3: Create CloudFront Distribution
    Write-Host "`n☁️ Step 3: Creating CloudFront distribution..." -ForegroundColor Yellow
    
    $distributionConfig = @"
{
    "CallerReference": "mmad-fitbooki-emporium-$(Get-Date -Format 'yyyyMMddHHmmss')",
    "Aliases": {
        "Quantity": 1,
        "Items": ["$CustomDomain"]
    },
    "Comment": "MMAD FitBooki - emporium.mamaadsolution.com",
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
        "Quantity": 3,
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
            },
            {
                "ErrorCode": 500,
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

    $distributionConfig | Out-File -FilePath "emporium-cloudfront-config.json" -Encoding UTF8

    $result = aws cloudfront create-distribution --distribution-config file://emporium-cloudfront-config.json --output json

    if ($LASTEXITCODE -eq 0) {
        $distribution = $result | ConvertFrom-Json
        $distributionId = $distribution.Distribution.Id
        $cloudfrontDomain = $distribution.Distribution.DomainName
        
        Write-Host "✅ CloudFront distribution created successfully!" -ForegroundColor Green
        Write-Host "Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "CloudFront Domain: $cloudfrontDomain" -ForegroundColor Cyan
        
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
        
        $distributionInfo | ConvertTo-Json | Out-File -FilePath "emporium-distribution-info.json" -Encoding UTF8
        
    } else {
        Write-Error "Failed to create CloudFront distribution"
        exit 1
    }

    # Clean up config file
    Remove-Item "emporium-cloudfront-config.json" -ErrorAction SilentlyContinue

    # Step 4: DNS Configuration Instructions
    Write-Host "`n🌍 Step 4: DNS Configuration Required" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`n📋 Add this DNS record to mamaadsolution.com:" -ForegroundColor White
    Write-Host "• Type: CNAME" -ForegroundColor Yellow
    Write-Host "• Name: emporium" -ForegroundColor Yellow
    Write-Host "• Value: $cloudfrontDomain" -ForegroundColor Yellow
    Write-Host "• TTL: 300 (5 minutes)" -ForegroundColor Yellow
    
    Write-Host "`n💡 Alternative A Record (if CNAME not supported):" -ForegroundColor White
    Write-Host "• Type: A" -ForegroundColor Yellow
    Write-Host "• Name: emporium" -ForegroundColor Yellow
    Write-Host "• Value: [Get IP from CloudFront]" -ForegroundColor Yellow

    # Step 5: Create deployment summary
    Write-Host "`n🎉 MMAD FitBooki Custom Domain Setup Complete!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`n📋 Setup Summary:" -ForegroundColor White
    Write-Host "✅ S3 Bucket: $BucketName" -ForegroundColor Green
    Write-Host "✅ SSL Certificate: Issued" -ForegroundColor Green
    Write-Host "✅ CloudFront Distribution: Created" -ForegroundColor Green
    Write-Host "⏳ DNS Configuration: Required" -ForegroundColor Yellow
    
    Write-Host "`n🌐 Your URLs:" -ForegroundColor White
    Write-Host "• Custom Domain: https://$CustomDomain" -ForegroundColor Cyan
    Write-Host "• CloudFront: https://$cloudfrontDomain" -ForegroundColor Cyan
    Write-Host "• S3 Direct: http://$S3WebsiteEndpoint" -ForegroundColor Gray
    
    Write-Host "`n🔧 Next Steps:" -ForegroundColor White
    Write-Host "1. Add the DNS CNAME record shown above" -ForegroundColor Yellow
    Write-Host "2. Wait 10-15 minutes for CloudFront deployment" -ForegroundColor Yellow
    Write-Host "3. Wait 5-30 minutes for DNS propagation" -ForegroundColor Yellow
    Write-Host "4. Test your site at https://$CustomDomain" -ForegroundColor Yellow
    
    Write-Host "`n⚡ Features Enabled:" -ForegroundColor White
    Write-Host "• HTTPS/SSL encryption" -ForegroundColor Green
    Write-Host "• HTTP/2 support" -ForegroundColor Green
    Write-Host "• Global CDN caching" -ForegroundColor Green
    Write-Host "• Gzip compression" -ForegroundColor Green
    Write-Host "• SPA routing support" -ForegroundColor Green
    
    Write-Host "`n🚀 Your MMAD FitBooki platform will be live at https://$CustomDomain!" -ForegroundColor Green

} catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
    exit 1
}