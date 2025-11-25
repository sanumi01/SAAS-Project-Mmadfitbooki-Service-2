# Create DynamoDB Tables for MMAD FitBooki
Write-Host "Creating DynamoDB tables..." -ForegroundColor Green

# Users table
Write-Host "Creating Users table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name "MMADFitBooki-Users" `
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

# Bookings table
Write-Host "Creating Bookings table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name "MMADFitBooki-Bookings" `
    --attribute-definitions AttributeName=bookingId,AttributeType=S AttributeName=userId,AttributeType=S `
    --key-schema AttributeName=bookingId,KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

# Trainers table
Write-Host "Creating Trainers table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name "MMADFitBooki-Trainers" `
    --attribute-definitions AttributeName=trainerId,AttributeType=S `
    --key-schema AttributeName=trainerId,KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

Write-Host "Tables created successfully!" -ForegroundColor Green