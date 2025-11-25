# DNS Configuration for MMAD FitBooki Custom Domain
# Sets up Route 53 hosted zone and DNS records

param(
    [Parameter(Mandatory=$true)]
    [string]$CustomDomain,
    [Parameter(Mandatory=$false)]
    [string]$CloudFrontDomain = "",
    [Parameter(Mandatory=$false)]
    [switch]$UseRoute53
)

Write-Host "🌍 Setting up DNS for $CustomDomain" -ForegroundColor Green

try {
    # Step 1: Get CloudFront domain if not provided
    if (-not $CloudFrontDomain) {
        if (Test-Path "cloudfront-distribution-info.json") {
            $distributionInfo = Get-Content "cloudfront-distribution-info.json" | ConvertFrom-Json
            $CloudFrontDomain = $distributionInfo.CloudFrontDomain
            Write-Host "📋 Found CloudFront domain: $CloudFrontDomain" -ForegroundColor Cyan
        } else {
            Write-Error "CloudFront domain not found. Please provide -CloudFrontDomain parameter or run setup-cloudfront-custom.ps1 first"
            exit 1
        }
    }

    if ($UseRoute53) {
        # Step 2: Create Route 53 hosted zone
        Write-Host "🌐 Creating Route 53 hosted zone..." -ForegroundColor Yellow
        
        $hostedZoneResult = aws route53 create-hosted-zone `
            --name $CustomDomain `
            --caller-reference "mmad-fitbooki-$(Get-Date -Format 'yyyyMMddHHmmss')" `
            --hosted-zone-config Comment="MMAD FitBooki DNS Zone" `
            --output json

        if ($LASTEXITCODE -eq 0) {
            $hostedZone = $hostedZoneResult | ConvertFrom-Json
            $hostedZoneId = $hostedZone.HostedZone.Id
            $nameServers = $hostedZone.DelegationSet.NameServers
            
            Write-Host "✅ Hosted zone created: $hostedZoneId" -ForegroundColor Green
            
            # Step 3: Create DNS records
            Write-Host "📋 Creating DNS records..." -ForegroundColor Yellow
            
            $changeSet = @"
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "$CustomDomain",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CloudFrontDomain",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        },
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "www.$CustomDomain",
                "Type": "A",
                "AliasTarget": {
                    "DNSName": "$CloudFrontDomain",
                    "EvaluateTargetHealth": false,
                    "HostedZoneId": "Z2FDTNDATAQYW2"
                }
            }
        }
    ]
}
"@

            $changeSet | Out-File -FilePath "dns-changeset.json" -Encoding UTF8
            
            $changeResult = aws route53 change-resource-record-sets `
                --hosted-zone-id $hostedZoneId `
                --change-batch file://dns-changeset.json `
                --output json

            if ($LASTEXITCODE -eq 0) {
                $change = $changeResult | ConvertFrom-Json
                $changeId = $change.ChangeInfo.Id
                
                Write-Host "✅ DNS records created successfully!" -ForegroundColor Green
                Write-Host "Change ID: $changeId" -ForegroundColor Cyan
                
                Write-Host "`n🔧 Name Servers Configuration Required:" -ForegroundColor Red
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
                Write-Host "Update your domain registrar with these name servers:" -ForegroundColor White
                foreach ($ns in $nameServers) {
                    Write-Host "• $ns" -ForegroundColor Cyan
                }
                Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
                
            } else {
                Write-Error "Failed to create DNS records"
                exit 1
            }
            
            # Clean up
            Remove-Item "dns-changeset.json" -ErrorAction SilentlyContinue
            
        } else {
            Write-Error "Failed to create hosted zone"
            exit 1
        }
        
    } else {
        # Manual DNS configuration instructions
        Write-Host "`n🔧 Manual DNS Configuration Required:" -ForegroundColor Red
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host "`n📋 Add these DNS records in your domain registrar:" -ForegroundColor White
        Write-Host "`nRecord 1:" -ForegroundColor Cyan
        Write-Host "• Type: CNAME" -ForegroundColor Yellow
        Write-Host "• Name: $CustomDomain (or @)" -ForegroundColor Yellow
        Write-Host "• Value: $CloudFrontDomain" -ForegroundColor Yellow
        Write-Host "• TTL: 300" -ForegroundColor Yellow
        
        Write-Host "`nRecord 2:" -ForegroundColor Cyan
        Write-Host "• Type: CNAME" -ForegroundColor Yellow
        Write-Host "• Name: www.$CustomDomain (or www)" -ForegroundColor Yellow
        Write-Host "• Value: $CloudFrontDomain" -ForegroundColor Yellow
        Write-Host "• TTL: 300" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        
        Write-Host "`n💡 Alternative A Record Configuration:" -ForegroundColor White
        Write-Host "If your registrar supports ALIAS records:" -ForegroundColor Gray
        Write-Host "• Type: A (ALIAS)" -ForegroundColor Yellow
        Write-Host "• Name: $CustomDomain" -ForegroundColor Yellow
        Write-Host "• Value: $CloudFrontDomain" -ForegroundColor Yellow
    }

    # Step 4: Test DNS propagation
    Write-Host "`n🔍 Testing DNS propagation..." -ForegroundColor Yellow
    Write-Host "This may take 5-30 minutes for full propagation" -ForegroundColor Gray
    
    $maxAttempts = 10
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 30
        $attempt++
        
        try {
            $dnsResult = nslookup $CustomDomain 2>$null
            if ($dnsResult -match $CloudFrontDomain) {
                Write-Host "✅ DNS propagation successful!" -ForegroundColor Green
                break
            }
        } catch {
            # DNS not yet propagated
        }
        
        Write-Host "Attempt $attempt/$maxAttempts - DNS still propagating..." -ForegroundColor Gray
        
    } while ($attempt -lt $maxAttempts)
    
    # Step 5: Save DNS configuration
    $dnsInfo = @{
        CustomDomain = $CustomDomain
        CloudFrontDomain = $CloudFrontDomain
        UseRoute53 = $UseRoute53.IsPresent
        ConfiguredAt = (Get-Date).ToString()
    }
    
    if ($UseRoute53) {
        $dnsInfo.HostedZoneId = $hostedZoneId
        $dnsInfo.NameServers = $nameServers
    }
    
    $dnsInfo | ConvertTo-Json | Out-File -FilePath "dns-configuration.json" -Encoding UTF8
    
    Write-Host "`n🎉 DNS Configuration Complete!" -ForegroundColor Green
    Write-Host "Configuration saved to dns-configuration.json" -ForegroundColor Cyan
    
    Write-Host "`n🌐 Your MMAD FitBooki platform will be available at:" -ForegroundColor White
    Write-Host "• https://$CustomDomain" -ForegroundColor Cyan
    Write-Host "• https://www.$CustomDomain" -ForegroundColor Cyan
    
    Write-Host "`n⏳ Please allow 5-30 minutes for full DNS propagation" -ForegroundColor Yellow

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}