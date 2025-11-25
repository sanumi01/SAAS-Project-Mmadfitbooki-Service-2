# Populate Sample Data for MMAD FitBooki
# Adds trainers, services, and sample schedules

Write-Host "📊 Populating MMAD FitBooki with sample data..." -ForegroundColor Green

try {
    # Sample Trainers
    $trainers = @(
        @{
            trainerId = "trainer-001"
            name = "Sarah Johnson"
            email = "sarah@mmadfitbooki.com"
            specialization = @("Personal Training", "Weight Loss", "Strength Training")
            bio = "Certified personal trainer with 5+ years experience in weight loss and strength training"
            hourlyRate = 75
            rating = 4.8
            totalBookings = 150
            isActive = $true
        },
        @{
            trainerId = "trainer-002"
            name = "Mike Rodriguez"
            email = "mike@mmadfitbooki.com"
            specialization = @("CrossFit", "HIIT", "Athletic Performance")
            bio = "Former professional athlete specializing in high-intensity training"
            hourlyRate = 85
            rating = 4.9
            totalBookings = 200
            isActive = $true
        },
        @{
            trainerId = "trainer-003"
            name = "Emma Chen"
            email = "emma@mmadfitbooki.com"
            specialization = @("Yoga", "Pilates", "Flexibility")
            bio = "Certified yoga instructor with expertise in mindful movement"
            hourlyRate = 65
            rating = 4.7
            totalBookings = 120
            isActive = $true
        },
        @{
            trainerId = "trainer-004"
            name = "David Thompson"
            email = "david@mmadfitbooki.com"
            specialization = @("Bodybuilding", "Powerlifting", "Nutrition")
            bio = "Competitive bodybuilder and certified nutrition specialist"
            hourlyRate = 90
            rating = 4.9
            totalBookings = 180
            isActive = $true
        },
        @{
            trainerId = "trainer-005"
            name = "Lisa Martinez"
            email = "lisa@mmadfitbooki.com"
            specialization = @("Cardio", "Dance Fitness", "Group Classes")
            bio = "Energetic fitness instructor specializing in fun, high-energy workouts"
            hourlyRate = 70
            rating = 4.6
            totalBookings = 95
            isActive = $true
        }
    )

    Write-Host "Adding trainers to database..." -ForegroundColor Yellow
    
    foreach ($trainer in $trainers) {
        $trainerJson = @{
            trainerId = @{ S = $trainer.trainerId }
            name = @{ S = $trainer.name }
            email = @{ S = $trainer.email }
            specialization = @{ SS = $trainer.specialization }
            bio = @{ S = $trainer.bio }
            hourlyRate = @{ N = $trainer.hourlyRate.ToString() }
            rating = @{ N = $trainer.rating.ToString() }
            totalBookings = @{ N = $trainer.totalBookings.ToString() }
            isActive = @{ BOOL = $trainer.isActive }
            createdAt = @{ S = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') }
            updatedAt = @{ S = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') }
        } | ConvertTo-Json -Depth 3

        $trainerJson | Out-File -FilePath "trainer-temp.json" -Encoding UTF8
        
        aws dynamodb put-item `
            --table-name "MMADFitBooki-Trainers" `
            --item file://trainer-temp.json `
            --region us-east-1

        Write-Host "✅ Added trainer: $($trainer.name)" -ForegroundColor Green
    }

    # Sample Services/Packages
    Write-Host "`nAdding service packages..." -ForegroundColor Yellow
    
    $services = @(
        @{
            serviceId = "service-001"
            name = "Personal Training Session"
            description = "One-on-one training with certified trainer"
            duration = 60
            price = 75
            category = "Personal Training"
        },
        @{
            serviceId = "service-002"
            name = "Group Fitness Class"
            description = "High-energy group workout session"
            duration = 45
            price = 25
            category = "Group Classes"
        },
        @{
            serviceId = "service-003"
            name = "Nutrition Consultation"
            description = "Personalized nutrition planning session"
            duration = 30
            price = 50
            category = "Nutrition"
        },
        @{
            serviceId = "service-004"
            name = "Fitness Assessment"
            description = "Complete fitness evaluation and goal setting"
            duration = 90
            price = 100
            category = "Assessment"
        }
    )

    # Create Services table if it doesn't exist
    aws dynamodb create-table `
        --table-name "MMADFitBooki-Services" `
        --attribute-definitions AttributeName=serviceId,AttributeType=S `
        --key-schema AttributeName=serviceId,KeyType=HASH `
        --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
        --region us-east-1 2>$null

    Start-Sleep -Seconds 10

    foreach ($service in $services) {
        $serviceJson = @{
            serviceId = @{ S = $service.serviceId }
            name = @{ S = $service.name }
            description = @{ S = $service.description }
            duration = @{ N = $service.duration.ToString() }
            price = @{ N = $service.price.ToString() }
            category = @{ S = $service.category }
            isActive = @{ BOOL = $true }
            createdAt = @{ S = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') }
        } | ConvertTo-Json -Depth 3

        $serviceJson | Out-File -FilePath "service-temp.json" -Encoding UTF8
        
        aws dynamodb put-item `
            --table-name "MMADFitBooki-Services" `
            --item file://service-temp.json `
            --region us-east-1

        Write-Host "✅ Added service: $($service.name)" -ForegroundColor Green
    }

    # Sample Schedules (Available time slots)
    Write-Host "`nAdding trainer schedules..." -ForegroundColor Yellow
    
    $today = Get-Date
    for ($day = 0; $day -lt 7; $day++) {
        $date = $today.AddDays($day).ToString('yyyy-MM-dd')
        
        foreach ($trainer in $trainers[0..2]) { # First 3 trainers
            $scheduleId = "schedule-$($trainer.trainerId)-$date"
            
            $timeSlots = @()
            for ($hour = 9; $hour -lt 17; $hour++) {
                $timeSlots += @{
                    startTime = "$($hour.ToString('00')):00"
                    endTime = "$($hour + 1).ToString('00'):00"
                    isAvailable = $true
                }
            }
            
            $scheduleJson = @{
                scheduleId = @{ S = $scheduleId }
                trainerId = @{ S = $trainer.trainerId }
                date = @{ S = $date }
                timeSlots = @{ S = ($timeSlots | ConvertTo-Json -Compress) }
                createdAt = @{ S = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') }
                updatedAt = @{ S = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') }
            } | ConvertTo-Json -Depth 3

            $scheduleJson | Out-File -FilePath "schedule-temp.json" -Encoding UTF8
            
            aws dynamodb put-item `
                --table-name "MMADFitBooki-Schedules" `
                --item file://schedule-temp.json `
                --region us-east-1 2>$null
        }
        
        Write-Host "✅ Added schedules for $date" -ForegroundColor Green
    }

    # Clean up temporary files
    Remove-Item "*-temp.json" -ErrorAction SilentlyContinue

    Write-Host "`n🎉 Sample Data Population Complete!" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    Write-Host "`n📊 Data Added:" -ForegroundColor White
    Write-Host "• 5 Professional Trainers" -ForegroundColor Green
    Write-Host "• 4 Service Packages" -ForegroundColor Green
    Write-Host "• 7 Days of Schedules" -ForegroundColor Green
    Write-Host "• Available Time Slots (9 AM - 5 PM)" -ForegroundColor Green
    
    Write-Host "`n👥 Sample Trainers:" -ForegroundColor White
    Write-Host "• Sarah Johnson - Personal Training ($75/hr)" -ForegroundColor Cyan
    Write-Host "• Mike Rodriguez - CrossFit & HIIT ($85/hr)" -ForegroundColor Cyan
    Write-Host "• Emma Chen - Yoga & Pilates ($65/hr)" -ForegroundColor Cyan
    Write-Host "• David Thompson - Bodybuilding ($90/hr)" -ForegroundColor Cyan
    Write-Host "• Lisa Martinez - Dance Fitness ($70/hr)" -ForegroundColor Cyan
    
    Write-Host "`n💼 Service Packages:" -ForegroundColor White
    Write-Host "• Personal Training Session - $75 (60 min)" -ForegroundColor Cyan
    Write-Host "• Group Fitness Class - $25 (45 min)" -ForegroundColor Cyan
    Write-Host "• Nutrition Consultation - $50 (30 min)" -ForegroundColor Cyan
    Write-Host "• Fitness Assessment - $100 (90 min)" -ForegroundColor Cyan
    
    Write-Host "`n🚀 Your platform now has realistic sample data!" -ForegroundColor Green
    Write-Host "Users can browse trainers and book real appointments." -ForegroundColor White

} catch {
    Write-Error "Sample data population failed: $($_.Exception.Message)"
    exit 1
}