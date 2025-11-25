# Check fitness.mamaadsolution.com Setup Status

$CertificateArn = "arn:aws:acm:us-east-1:376467672970:certificate/ae5ae9ca-45b9-45f7-b430-bb2fa9ab81c7"

Write-Host "🔍 Checking fitness.mamaadsolution.com setup status..." -ForegroundColor Green

# Check certificate status
Write-Host "`n🔒 SSL Certificate Status:" -ForegroundColor Yellow
$certStatus = aws acm describe-certificate --certificate-arn $CertificateArn --region us-east-1 --query "Certificate.Status" --output text

Write-Host "Status: $certStatus" -ForegroundColor $(if ($certStatus -eq "ISSUED") { "Green" } else { "Yellow" })

if ($certStatus -eq "PENDING_VALIDATION") {
    Write-Host "`n⚠️  Certificate validation required!" -ForegroundColor Red
    Write-Host "Add this DNS record to mamaadsolution.com:" -ForegroundColor White
    Write-Host "Type: CNAME" -ForegroundColor Yellow
    Write-Host "Name: _c9bf6f18b3f62443a17619662ed7c889.fitness" -ForegroundColor Yellow
    Write-Host "Value: _f9dfc815b3cc72af2cdbd347538b2acd.xlfgrmvvlj.acm-validations.aws." -ForegroundColor Yellow
} elseif ($certStatus -eq "ISSUED") {
    Write-Host "✅ Certificate is ready! Creating CloudFront distribution..." -ForegroundColor Green
    
    # Create CloudFront distribution
    $result = aws cloudfront create-distribution --distribution-config file://fitness-cloudfront-config.json --output json
    
    if ($LASTEXITCODE -eq 0) {
        $distribution = $result | ConvertFrom-Json
        $distributionId = $distribution.Distribution.Id
        $cloudfrontDomain = $distribution.Distribution.DomainName
        
        Write-Host "✅ CloudFront distribution created!" -ForegroundColor Green
        Write-Host "Distribution ID: $distributionId" -ForegroundColor Cyan
        Write-Host "CloudFront Domain: $cloudfrontDomain" -ForegroundColor Cyan
        
        Write-Host "`n🌍 Final DNS Configuration Required:" -ForegroundColor Red
        Write-Host "Add this CNAME record to mamaadsolution.com:" -ForegroundColor White
        Write-Host "Type: CNAME" -ForegroundColor Yellow
        Write-Host "Name: fitness" -ForegroundColor Yellow
        Write-Host "Value: $cloudfrontDomain" -ForegroundColor Yellow
        
        Write-Host "`n🎉 Setup will be complete once DNS is configured!" -ForegroundColor Green
        Write-Host "Your site will be live at: https://fitness.mamaadsolution.com" -ForegroundColor Cyan
    }
}

Write-Host "`n💡 Run this script again to check progress: .\check-fitness-setup.ps1" -ForegroundColor Gray