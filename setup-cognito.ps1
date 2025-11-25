# AWS Cognito Setup for MMAD FitBooki
# Sets up user authentication, user pools, and identity pools

Write-Host "Setting up AWS Cognito authentication for MMAD FitBooki..." -ForegroundColor Green

try {
    # Create Cognito User Pool
    Write-Host "Creating Cognito User Pool..." -ForegroundColor Yellow
    $userPoolResult = aws cognito-idp create-user-pool `
        --pool-name "MMADFitBooki-UserPool" `
        --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=false}" `
        --auto-verified-attributes email `
        --username-attributes email `
        --schema Name=email,AttributeDataType=String,Required=true,Mutable=true Name=name,AttributeDataType=String,Required=true,Mutable=true Name=phone_number,AttributeDataType=String,Required=false,Mutable=true `
        --region us-east-1 `
        --output json

    $userPool = $userPoolResult | ConvertFrom-Json
    $userPoolId = $userPool.UserPool.Id

    Write-Host "✓ User Pool created: $userPoolId" -ForegroundColor Green

    # Create User Pool Client
    Write-Host "Creating User Pool Client..." -ForegroundColor Yellow
    $clientResult = aws cognito-idp create-user-pool-client `
        --user-pool-id $userPoolId `
        --client-name "MMADFitBooki-WebClient" `
        --generate-secret `
        --explicit-auth-flows ADMIN_NO_SRP_AUTH USER_PASSWORD_AUTH `
        --supported-identity-providers COGNITO `
        --callback-urls "http://mmadfitbooki-servive.s3-website-us-east-1.amazonaws.com","https://localhost:3000" `
        --logout-urls "http://mmadfitbooki-servive.s3-website-us-east-1.amazonaws.com","https://localhost:3000" `
        --region us-east-1 `
        --output json

    $client = $clientResult | ConvertFrom-Json
    $clientId = $client.UserPoolClient.ClientId
    $clientSecret = $client.UserPoolClient.ClientSecret

    Write-Host "✓ User Pool Client created: $clientId" -ForegroundColor Green

    # Create Identity Pool
    Write-Host "Creating Identity Pool..." -ForegroundColor Yellow
    $identityPoolResult = aws cognito-identity create-identity-pool `
        --identity-pool-name "MMADFitBooki_IdentityPool" `
        --allow-unauthenticated-identities `
        --cognito-identity-providers ProviderName=cognito-idp.us-east-1.amazonaws.com/$userPoolId,ClientId=$clientId `
        --region us-east-1 `
        --output json

    $identityPool = $identityPoolResult | ConvertFrom-Json
    $identityPoolId = $identityPool.IdentityPoolId

    Write-Host "✓ Identity Pool created: $identityPoolId" -ForegroundColor Green

    # Create IAM roles for authenticated and unauthenticated users
    Write-Host "Creating IAM roles..." -ForegroundColor Yellow

    # Authenticated role policy
    $authRolePolicy = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "cognito-identity.amazonaws.com"
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "cognito-identity.amazonaws.com:aud": "$identityPoolId"
                },
                "ForAnyValue:StringLike": {
                    "cognito-identity.amazonaws.com:amr": "authenticated"
                }
            }
        }
    ]
}
"@

    $authRolePolicy | Out-File -FilePath "auth-role-policy.json" -Encoding UTF8

    aws iam create-role `
        --role-name "MMADFitBooki_AuthRole" `
        --assume-role-policy-document file://auth-role-policy.json `
        --region us-east-1

    # Attach policy to authenticated role
    $authPermissions = @"
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:*:table/MMADFitBooki-*"
            ]
        }
    ]
}
"@

    $authPermissions | Out-File -FilePath "auth-permissions.json" -Encoding UTF8

    aws iam put-role-policy `
        --role-name "MMADFitBooki_AuthRole" `
        --policy-name "MMADFitBooki_AuthPolicy" `
        --policy-document file://auth-permissions.json `
        --region us-east-1

    # Get role ARN
    $authRoleArn = aws iam get-role --role-name "MMADFitBooki_AuthRole" --query "Role.Arn" --output text --region us-east-1

    # Set identity pool roles
    aws cognito-identity set-identity-pool-roles `
        --identity-pool-id $identityPoolId `
        --roles authenticated=$authRoleArn `
        --region us-east-1

    # Save configuration
    $cognitoConfig = @{
        UserPoolId = $userPoolId
        ClientId = $clientId
        ClientSecret = $clientSecret
        IdentityPoolId = $identityPoolId
        Region = "us-east-1"
    }

    $cognitoConfig | ConvertTo-Json | Out-File -FilePath "cognito-config.json" -Encoding UTF8

    # Clean up temporary files
    Remove-Item "auth-role-policy.json" -ErrorAction SilentlyContinue
    Remove-Item "auth-permissions.json" -ErrorAction SilentlyContinue

    Write-Host "`n🎉 Cognito Authentication Setup Complete!" -ForegroundColor Green
    Write-Host "Configuration saved to cognito-config.json" -ForegroundColor White
    Write-Host "User Pool ID: $userPoolId" -ForegroundColor Cyan
    Write-Host "Client ID: $clientId" -ForegroundColor Cyan
    Write-Host "Identity Pool ID: $identityPoolId" -ForegroundColor Cyan

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}