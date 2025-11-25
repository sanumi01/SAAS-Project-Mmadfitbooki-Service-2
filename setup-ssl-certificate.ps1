# SSL Certificate Setup for MMAD FitBooki Custom Domain
# Requests and validates SSL certificate via AWS Certificate Manager

param(
    [Parameter(Mandatory=$true)]
    [string]$CustomDomain,
    [Parameter(Mandatory=$false)]
    [string]$ValidationMethod = "DNS"
)

Write-Host "🔒 Setting up SSL certificate for $CustomDomain" -ForegroundColor Green

try {
    # Step 1: Request SSL certificate
    Write-Host "📋 Requesting SSL certificate..." -ForegroundColor Yellow
    
    $certResult = aws acm request-certificate `
        --domain-name $CustomDomain `
        --subject-alternative-names "www.$CustomDomain" `
        --validation-method $ValidationMethod `
        --region us-east-1 `
        --output json

    if ($LASTEXITCODE -eq 0) {
        $cert = $certResult | ConvertFrom-Json
        $certificateArn = $cert.CertificateArn
        
        Write-Host "✅ SSL certificate requested successfully!" -ForegroundColor Green
        Write-Host "Certificate ARN: $certificateArn" -ForegroundColor Cyan
        
        # Step 2: Get validation details
        Write-Host "📋 Getting validation details..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5  # Wait for certificate to be processed
        
        $certDetails = aws acm describe-certificate --certificate-arn $certificateArn --region us-east-1 --output json
        $certInfo = $certDetails | ConvertFrom-Json
        
        Write-Host "`n🔧 Certificate Validation Required!" -ForegroundColor Red
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        
        if ($ValidationMethod -eq "DNS") {
            Write-Host "`n📋 DNS Validation Records:" -ForegroundColor White
            
            foreach ($domainValidation in $certInfo.Certificate.DomainValidationOptions) {
                if ($domainValidation.ResourceRecord) {
                    Write-Host "`nDomain: $($domainValidation.DomainName)" -ForegroundColor Cyan
                    Write-Host "Record Type: $($domainValidation.ResourceRecord.Type)" -ForegroundColor Yellow
                    Write-Host "Record Name: $($domainValidation.ResourceRecord.Name)" -ForegroundColor Yellow
                    Write-Host "Record Value: $($domainValidation.ResourceRecord.Value)" -ForegroundColor Yellow
                    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
                }
            }
            
            Write-Host "`n🔧 DNS Configuration Steps:" -ForegroundColor White
            Write-Host "1. Log into your domain registrar's DNS management" -ForegroundColor Yellow
            Write-Host "2. Add the CNAME records shown above" -ForegroundColor Yellow
            Write-Host "3. Wait for DNS propagation (5-30 minutes)" -ForegroundColor Yellow
            Write-Host "4. Certificate will be automatically validated" -ForegroundColor Yellow
            
        } else {
            Write-Host "`n📧 Email Validation:" -ForegroundColor White
            Write-Host "Validation emails sent to:" -ForegroundColor Yellow
            Write-Host "• admin@$CustomDomain" -ForegroundColor Cyan
            Write-Host "• administrator@$CustomDomain" -ForegroundColor Cyan
            Write-Host "• hostmaster@$CustomDomain" -ForegroundColor Cyan
            Write-Host "• postmaster@$CustomDomain" -ForegroundColor Cyan
            Write-Host "• webmaster@$CustomDomain" -ForegroundColor Cyan
        }
        
        # Step 3: Save certificate info
        $certInfo = @{
            CertificateArn = $certificateArn
            Domain = $CustomDomain
            ValidationMethod = $ValidationMethod
            Status = "PENDING_VALIDATION"
            RequestedAt = (Get-Date).ToString()
        }
        
        $certInfo | ConvertTo-Json | Out-File -FilePath "ssl-certificate-info.json" -Encoding UTF8
        
        Write-Host "`n💾 Certificate information saved to ssl-certificate-info.json" -ForegroundColor Green
        
        # Step 4: Monitor validation status
        Write-Host "`n⏳ Monitoring certificate validation..." -ForegroundColor Yellow
        Write-Host "This may take a few minutes..." -ForegroundColor Gray
        
        $maxAttempts = 20
        $attempt = 0
        
        do {
            Start-Sleep -Seconds 30
            $attempt++
            
            $statusResult = aws acm describe-certificate --certificate-arn $certificateArn --region us-east-1 --output json
            $statusInfo = $statusResult | ConvertFrom-Json
            $status = $statusInfo.Certificate.Status
            
            Write-Host "Attempt $attempt/$maxAttempts - Status: $status" -ForegroundColor Gray
            
            if ($status -eq "ISSUED") {
                Write-Host "✅ Certificate validated and issued successfully!" -ForegroundColor Green
                break
            } elseif ($status -eq "FAILED") {
                Write-Error "Certificate validation failed"
                exit 1
            }
            
        } while ($attempt -lt $maxAttempts -and $status -eq "PENDING_VALIDATION")
        
        if ($status -eq "ISSUED") {
            Write-Host "`n🎉 SSL Certificate Setup Complete!" -ForegroundColor Green
            Write-Host "Certificate ARN: $certificateArn" -ForegroundColor Cyan
            Write-Host "`nYou can now use this certificate with CloudFront:" -ForegroundColor White
            Write-Host ".\setup-cloudfront-custom.ps1 -CustomDomain $CustomDomain -CertificateArn $certificateArn" -ForegroundColor Yellow
        } else {
            Write-Host "`n⏳ Certificate is still validating..." -ForegroundColor Yellow
            Write-Host "You can check status later with:" -ForegroundColor White
            Write-Host "aws acm describe-certificate --certificate-arn $certificateArn --region us-east-1" -ForegroundColor Gray
        }
        
    } else {
        Write-Error "Failed to request SSL certificate"
        exit 1
    }

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}