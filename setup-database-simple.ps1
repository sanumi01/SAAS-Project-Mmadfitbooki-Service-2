# Simple DynamoDB Setup for MMAD FitBooki

Write-Host "Creating DynamoDB tables for MMAD FitBooki..." -ForegroundColor Green

# Create Users table
Write-Host "Creating Users table..." -ForegroundColor Yellow
aws dynamodb create-table --table-name "MMADFitBooki-Users" --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S --key-schema AttributeName=userId,KeyType=HASH --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1

# Create Bookings table  
Write-Host "Creating Bookings table..." -ForegroundColor Yellow
aws dynamodb create-table --table-name "MMADFitBooki-Bookings" --attribute-definitions AttributeName=bookingId,AttributeType=S AttributeName=userId,AttributeType=S AttributeName=trainerId,AttributeType=S AttributeName=bookingDate,AttributeType=S --key-schema AttributeName=bookingId,KeyType=HASH --global-secondary-indexes IndexName=UserBookingsIndex,KeySchema=[{AttributeName=userId,KeyType=HASH},{AttributeName=bookingDate,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} IndexName=TrainerBookingsIndex,KeySchema=[{AttributeName=trainerId,KeyType=HASH},{AttributeName=bookingDate,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1

# Create Trainers table
Write-Host "Creating Trainers table..." -ForegroundColor Yellow  
aws dynamodb create-table --table-name "MMADFitBooki-Trainers" --attribute-definitions AttributeName=trainerId,AttributeType=S --key-schema AttributeName=trainerId,KeyType=HASH --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1

# Create Schedules table
Write-Host "Creating Schedules table..." -ForegroundColor Yellow
aws dynamodb create-table --table-name "MMADFitBooki-Schedules" --attribute-definitions AttributeName=scheduleId,AttributeType=S AttributeName=trainerId,AttributeType=S AttributeName=date,AttributeType=S --key-schema AttributeName=scheduleId,KeyType=HASH --global-secondary-indexes IndexName=TrainerScheduleIndex,KeySchema=[{AttributeName=trainerId,KeyType=HASH},{AttributeName=date,KeyType=RANGE}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 --region us-east-1

Write-Host "Database tables created successfully!" -ForegroundColor Green