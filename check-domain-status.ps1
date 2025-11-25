# Check Custom Domain Setup Status for MMAD FitBooki
# Verifies CloudFront, SSL, and DNS configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$CustomDomain = "fitness.mamaadsolution.com"
)

Write-Host "🔍 Checking status for $CustomDomain" -ForegroundColor Green

try {
    # Check if distribution info exists
    if (Test-Path "cloudfront-info.json") {
        $info = Get-Content "cloudfront-info.json" | ConvertFrom-Json
        $distributionId = $info.DistributionId
        $certificateArn = $info.CertificateArn
        
        Write-Host "`n📋 Configuration Found:" -ForegroundColor White
        Write-Host "Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "Certificate ARN: $certificateArn" -ForegroundColor Cyan
        
        # Check CloudFront status
        Write-Host "`n☁️ CloudFront Status:" -ForegroundColor Yellow
        $distStatus = aws cloudfront get-distribution --id $distributionId --output json
        if ($LASTEXITCODE -eq 0) {
            $dist = $distStatus | ConvertFrom-Json
            $status = $dist.Distribution.Status
            $domainName = $dist.Distribution.DomainName
            
            Write-Host "Status: $status" -ForegroundColor $(if ($status -eq "Deployed") { "Green" } else { "Yellow" })
            Write-Host "Domain: $domainName" -ForegroundColor Cyan
        }
        
        # Check SSL Certificate status
        Write-Host "`n🔒 SSL Certificate Status:" -ForegroundColor Yellow
        $certStatus = aws acm describe-certificate --certificate-arn $certificateArn --region us-east-1 --output json
        if ($LASTEXITCODE -eq 0) {
            $cert = $certStatus | ConvertFrom-Json
            $certState = $cert.Certificate.Status
            
            Write-Host "Status: $certState" -ForegroundColor $(if ($certState -eq "ISSUED") { "Green" } else { "Yellow" })
        }
        
        # Check DNS resolution
        Write-Host "`n🌍 DNS Status:" -ForegroundColor Yellow
        try {
            $dnsResult = nslookup $CustomDomain 2>$null
            if ($dnsResult -match $domainName) {
                Write-Host "DNS: Configured ✅" -ForegroundColor Green
            } else {
                Write-Host "DNS: Not configured ❌" -ForegroundColor Red
                Write-Host "Add CNAME: fitness → $domainName" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "DNS: Not configured ❌" -ForegroundColor Red
        }
        
        # Test HTTPS connectivity
        Write-Host "`n🌐 Connectivity Test:" -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "https://$CustomDomain" -Method Head -TimeoutSec 10 -ErrorAction Stop
            Write-Host "HTTPS: Working ✅ (Status: $($response.StatusCode))" -ForegroundColor Green
        } catch {
            Write-Host "HTTPS: Not accessible ❌" -ForegroundColor Red
            Write-Host "Reason: $($_.Exception.Message)" -ForegroundColor Gray
        }
        
        # Overall status
        Write-Host "`n📊 Overall Status:" -ForegroundColor White
        if ($status -eq "Deployed" -and $certState -eq "ISSUED") {
            Write-Host "✅ Setup Complete - Ready for DNS configuration" -ForegroundColor Green
        } elseif ($status -eq "InProgress") {
            Write-Host "⏳ CloudFront still deploying (10-15 minutes)" -ForegroundColor Yellow
        } elseif ($certState -eq "PENDING_VALIDATION") {
            Write-Host "⏳ Certificate validation pending" -ForegroundColor Yellow
        } else {
            Write-Host "🔧 Setup in progress" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ No configuration found. Run setup-custom-domain-complete.ps1 first" -ForegroundColor Red
    }

} catch {
    Write-Error "Status check failed: $($_.Exception.Message)"
}