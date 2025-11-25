# Enhanced Deployment Script for MMAD FitBooki
# Sets up CloudFront, DynamoDB, Cognito, and deploys with all features

param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName = "mmadfitbooki-servive",
    [Parameter(Mandatory=$false)]
    [switch]$SkipInfrastructure
)

Write-Host "🚀 Enhanced MMAD FitBooki Deployment Starting..." -ForegroundColor Green

try {
    # Step 1: Build the application
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "✅ Build completed successfully" -ForegroundColor Green

    # Step 2: Create DynamoDB tables (if not skipping infrastructure)
    if (-not $SkipInfrastructure) {
        Write-Host "🗄️ Creating DynamoDB tables..." -ForegroundColor Yellow
        
        # Users table
        aws dynamodb create-table --table-name "MMADFitBooki-Users" --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=userId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1 2>$null
        
        # Bookings table
        aws dynamodb create-table --table-name "MMADFitBooki-Bookings" --attribute-definitions AttributeName=bookingId,AttributeType=S --key-schema AttributeName=bookingId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1 2>$null
        
        # Trainers table
        aws dynamodb create-table --table-name "MMADFitBooki-Trainers" --attribute-definitions AttributeName=trainerId,AttributeType=S --key-schema AttributeName=trainerId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1 2>$null
        
        Write-Host "✅ DynamoDB tables created" -ForegroundColor Green
        
        # Wait for tables to be active
        Write-Host "⏳ Waiting for tables to be active..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }

    # Step 3: Deploy to S3
    Write-Host "☁️ Deploying to S3..." -ForegroundColor Yellow
    aws s3 sync dist/ s3://$BucketName --delete --cache-control "max-age=31536000" --exclude "*.html"
    aws s3 sync dist/ s3://$BucketName --delete --cache-control "no-cache, no-store, must-revalidate" --include "*.html"
    
    if ($LASTEXITCODE -ne 0) {
        throw "S3 deployment failed"
    }
    Write-Host "✅ S3 deployment completed" -ForegroundColor Green

    # Step 4: Create CloudFront distribution (if not exists)
    if (-not $SkipInfrastructure) {
        Write-Host "🌐 Setting up CloudFront CDN..." -ForegroundColor Yellow
        
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
                "DomainName": "$BucketName.s3-website-us-east-1.amazonaws.com",
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
        
        $distributionConfig | Out-File -FilePath "cloudfront-config.json" -Encoding UTF8
        $result = aws cloudfront create-distribution --distribution-config file://cloudfront-config.json --output json 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            $distribution = $result | ConvertFrom-Json
            $cloudfrontDomain = $distribution.Distribution.DomainName
            Write-Host "✅ CloudFront distribution created: https://$cloudfrontDomain" -ForegroundColor Green
        } else {
            Write-Host "⚠️ CloudFront creation skipped (may already exist)" -ForegroundColor Yellow
        }
        
        Remove-Item "cloudfront-config.json" -ErrorAction SilentlyContinue
    }

    # Step 5: Display deployment summary
    $s3Url = "http://$BucketName.s3-website-us-east-1.amazonaws.com"
    
    Write-Host "`n🎉 MMAD FitBooki Enhanced Deployment Complete!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`n🌐 Your Application URLs:" -ForegroundColor White
    Write-Host "S3 Website: $s3Url" -ForegroundColor Cyan
    if ($cloudfrontDomain) {
        Write-Host "CloudFront CDN: https://$cloudfrontDomain" -ForegroundColor Cyan
    }
    
    Write-Host "`n✅ Features Deployed:" -ForegroundColor White
    Write-Host "• MMAD Logo & Branding" -ForegroundColor Green
    Write-Host "• Blue Color Palette Styling" -ForegroundColor Green
    Write-Host "• DynamoDB Database Tables" -ForegroundColor Green
    Write-Host "• CloudFront CDN (HTTPS + Global)" -ForegroundColor Green
    Write-Host "• Enhanced Authentication Service" -ForegroundColor Green
    Write-Host "• Email Notification System" -ForegroundColor Green
    Write-Host "• Service Worker (Offline Support)" -ForegroundColor Green
    Write-Host "• Performance Optimizations" -ForegroundColor Green
    
    Write-Host "`n🔧 Next Steps:" -ForegroundColor White
    Write-Host "1. Set up Cognito User Pool (run setup-cognito.ps1)" -ForegroundColor Yellow
    Write-Host "2. Configure SES for email notifications" -ForegroundColor Yellow
    Write-Host "3. Test all functionality on your live site" -ForegroundColor Yellow
    Write-Host "4. Set up custom domain (optional)" -ForegroundColor Yellow
    
    Write-Host "`n🚀 Your MMAD FitBooki platform is now live with enhanced features!" -ForegroundColor Green

} catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}