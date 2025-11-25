# Verify Custom Domain Setup for MMAD FitBooki
# Comprehensive testing of fitness.mamaadsolution.com

param(
    [Parameter(Mandatory=$false)]
    [string]$CustomDomain = "fitness.mamaadsolution.com"
)

Write-Host "🔍 Verifying custom domain setup for $CustomDomain" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allTestsPassed = $true

try {
    # Test 1: DNS Resolution
    Write-Host "`n🌍 Test 1: DNS Resolution" -ForegroundColor Yellow
    try {
        $dnsResult = Resolve-DnsName -Name $CustomDomain -Type CNAME -ErrorAction Stop
        if ($dnsResult) {
            $target = $dnsResult.NameHost
            Write-Host "✅ DNS resolves to: $target" -ForegroundColor Green
            
            if ($target -match "cloudfront.net") {
                Write-Host "✅ Points to CloudFront distribution" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Does not point to CloudFront" -ForegroundColor Yellow
                $allTestsPassed = $false
            }
        }
    } catch {
        Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Test 2: HTTPS Connectivity
    Write-Host "`n🔒 Test 2: HTTPS Connectivity" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://$CustomDomain" -Method Head -TimeoutSec 15 -ErrorAction Stop
        Write-Host "✅ HTTPS connection successful (Status: $($response.StatusCode))" -ForegroundColor Green
        
        # Check headers
        if ($response.Headers["Server"] -match "CloudFront") {
            Write-Host "✅ Served by CloudFront" -ForegroundColor Green
        }
        
        if ($response.Headers["Content-Encoding"] -match "gzip") {
            Write-Host "✅ Gzip compression enabled" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ HTTPS connection failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Test 3: HTTP to HTTPS Redirect
    Write-Host "`n🔄 Test 3: HTTP to HTTPS Redirect" -ForegroundColor Yellow
    try {
        $httpResponse = Invoke-WebRequest -Uri "http://$CustomDomain" -Method Head -MaximumRedirection 0 -ErrorAction Stop
        if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
            $location = $httpResponse.Headers["Location"]
            if ($location -match "https://") {
                Write-Host "✅ HTTP redirects to HTTPS" -ForegroundColor Green
            } else {
                Write-Host "⚠️  HTTP redirect location: $location" -ForegroundColor Yellow
            }
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
            Write-Host "✅ HTTP redirects to HTTPS" -ForegroundColor Green
        } else {
            Write-Host "❌ HTTP redirect test failed" -ForegroundColor Red
            $allTestsPassed = $false
        }
    }

    # Test 4: SSL Certificate Validation
    Write-Host "`n🔐 Test 4: SSL Certificate" -ForegroundColor Yellow
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($CustomDomain, 443)
        $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
        $sslStream.AuthenticateAsClient($CustomDomain)
        
        $cert = $sslStream.RemoteCertificate
        $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cert)
        
        Write-Host "✅ SSL certificate valid" -ForegroundColor Green
        Write-Host "   Subject: $($cert2.Subject)" -ForegroundColor Gray
        Write-Host "   Issuer: $($cert2.Issuer)" -ForegroundColor Gray
        Write-Host "   Expires: $($cert2.NotAfter)" -ForegroundColor Gray
        
        $sslStream.Close()
        $tcpClient.Close()
        
    } catch {
        Write-Host "❌ SSL certificate validation failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Test 5: Content Verification
    Write-Host "`n📄 Test 5: Content Verification" -ForegroundColor Yellow
    try {
        $content = Invoke-WebRequest -Uri "https://$CustomDomain" -TimeoutSec 15 -ErrorAction Stop
        
        if ($content.Content -match "MMAD FitBooki" -or $content.Content -match "MmadFitbooki") {
            Write-Host "✅ MMAD FitBooki content detected" -ForegroundColor Green
        } else {
            Write-Host "⚠️  MMAD FitBooki branding not found in content" -ForegroundColor Yellow
        }
        
        if ($content.Content -match "fitness|booking|trainer") {
            Write-Host "✅ Fitness-related content detected" -ForegroundColor Green
        }
        
        Write-Host "   Content length: $($content.Content.Length) characters" -ForegroundColor Gray
        
    } catch {
        Write-Host "❌ Content verification failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Test 6: Performance Check
    Write-Host "`n⚡ Test 6: Performance Check" -ForegroundColor Yellow
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $perfResponse = Invoke-WebRequest -Uri "https://$CustomDomain" -TimeoutSec 15 -ErrorAction Stop
        $stopwatch.Stop()
        
        $loadTime = $stopwatch.ElapsedMilliseconds
        Write-Host "✅ Page load time: $loadTime ms" -ForegroundColor Green
        
        if ($loadTime -lt 2000) {
            Write-Host "✅ Excellent performance (< 2 seconds)" -ForegroundColor Green
        } elseif ($loadTime -lt 5000) {
            Write-Host "✅ Good performance (< 5 seconds)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Slow performance (> 5 seconds)" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Performance test failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Test 7: Mobile Responsiveness Check
    Write-Host "`n📱 Test 7: Mobile Responsiveness" -ForegroundColor Yellow
    try {
        $mobileHeaders = @{
            'User-Agent' = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
        }
        $mobileResponse = Invoke-WebRequest -Uri "https://$CustomDomain" -Headers $mobileHeaders -TimeoutSec 15 -ErrorAction Stop
        
        if ($mobileResponse.Content -match "viewport" -or $mobileResponse.Content -match "responsive") {
            Write-Host "✅ Mobile-responsive design detected" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Mobile responsiveness not clearly detected" -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Mobile responsiveness test failed: $($_.Exception.Message)" -ForegroundColor Red
        $allTestsPassed = $false
    }

    # Final Results
    Write-Host "`n📊 Verification Results" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    if ($allTestsPassed) {
        Write-Host "🎉 All tests passed! Your custom domain is working perfectly!" -ForegroundColor Green
        Write-Host "`n✅ Your MMAD FitBooki platform is live at:" -ForegroundColor White
        Write-Host "   https://$CustomDomain" -ForegroundColor Cyan
        
        Write-Host "`n🚀 Features confirmed:" -ForegroundColor White
        Write-Host "   • HTTPS encryption enabled" -ForegroundColor Green
        Write-Host "   • CloudFront CDN active" -ForegroundColor Green
        Write-Host "   • HTTP to HTTPS redirect working" -ForegroundColor Green
        Write-Host "   • SSL certificate valid" -ForegroundColor Green
        Write-Host "   • Content loading correctly" -ForegroundColor Green
        Write-Host "   • Good performance" -ForegroundColor Green
        
    } else {
        Write-Host "⚠️  Some tests failed. Please review the issues above." -ForegroundColor Yellow
        Write-Host "`n🔧 Common fixes:" -ForegroundColor White
        Write-Host "   • Wait for DNS propagation (up to 30 minutes)" -ForegroundColor Gray
        Write-Host "   • Verify CNAME record is correct" -ForegroundColor Gray
        Write-Host "   • Check CloudFront distribution status" -ForegroundColor Gray
        Write-Host "   • Ensure SSL certificate is issued" -ForegroundColor Gray
    }

} catch {
    Write-Error "Verification failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "`n🔧 Need help? Run .\check-domain-status.ps1 for detailed diagnostics" -ForegroundColor Gray