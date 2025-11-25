# DynamoDB Database Setup for MMAD FitBooki
# Creates tables for users, bookings, trainers, and schedules

Write-Host "Setting up DynamoDB database for MMAD FitBooki..." -ForegroundColor Green

try {
    # Create Users table
    Write-Host "Creating Users table..." -ForegroundColor Yellow
    aws dynamodb create-table `
        --table-name "MMADFitBooki-Users" `
        --attribute-definitions `
            AttributeName=userId,AttributeType=S `
            AttributeName=email,AttributeType=S `
        --key-schema `
            AttributeName=userId,KeyType=HASH `
        --global-secondary-indexes `
            IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} `
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region us-east-1

    # Create Bookings table
    Write-Host "Creating Bookings table..." -ForegroundColor Yellow
    aws dynamodb create-table `
        --table-name "MMADFitBooki-Bookings" `
        --attribute-definitions `
            AttributeName=bookingId,AttributeType=S `
            AttributeName=userId,AttributeType=S `
            AttributeName=trainerId,AttributeType=S `
            AttributeName=bookingDate,AttributeType=S `
        --key-schema `
            AttributeName=bookingId,KeyType=HASH `
        --global-secondary-indexes `
            IndexName=UserBookingsIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=bookingDate,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} `
            IndexName=TrainerBookingsIndex,KeySchema=[{AttributeName=trainerId,KeyType=HASH},{AttributeName=bookingDate,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} `
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region us-east-1

    # Create Trainers table
    Write-Host "Creating Trainers table..." -ForegroundColor Yellow
    aws dynamodb create-table `
        --table-name "MMADFitBooki-Trainers" `
        --attribute-definitions `
            AttributeName=trainerId,AttributeType=S `
            AttributeName=specialization,AttributeType=S `
        --key-schema `
            AttributeName=trainerId,KeyType=HASH `
        --global-secondary-indexes `
            IndexName=SpecializationIndex,KeySchema=[{AttributeName=specialization,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} `
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region us-east-1

    # Create Schedules table
    Write-Host "Creating Schedules table..." -ForegroundColor Yellow
    aws dynamodb create-table `
        --table-name "MMADFitBooki-Schedules" `
        --attribute-definitions `
            AttributeName=scheduleId,AttributeType=S `
            AttributeName=trainerId,AttributeType=S `
            AttributeName=date,AttributeType=S `
        --key-schema `
            AttributeName=scheduleId,KeyType=HASH `
        --global-secondary-indexes `
            IndexName=TrainerScheduleIndex,KeySchema=[{AttributeName=trainerId,KeyType=HASH},{AttributeName=date,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} `
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region us-east-1

    # Wait for tables to be created
    Write-Host "Waiting for tables to be created..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30

    # Verify tables
    $tables = @("MMADFitBooki-Users", "MMADFitBooki-Bookings", "MMADFitBooki-Trainers", "MMADFitBooki-Schedules")
    foreach ($table in $tables) {
        $status = aws dynamodb describe-table --table-name $table --query "Table.TableStatus" --output text --region us-east-1
        Write-Host "✓ $table status: $status" -ForegroundColor Green
    }

    Write-Host "`n🎉 Database Setup Complete!" -ForegroundColor Green
    Write-Host "Created DynamoDB tables:" -ForegroundColor White
    Write-Host "✓ MMADFitBooki-Users (user management)" -ForegroundColor Cyan
    Write-Host "✓ MMADFitBooki-Bookings (appointment bookings)" -ForegroundColor Cyan
    Write-Host "✓ MMADFitBooki-Trainers (trainer profiles)" -ForegroundColor Cyan
    Write-Host "✓ MMADFitBooki-Schedules (availability management)" -ForegroundColor Cyan

} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}