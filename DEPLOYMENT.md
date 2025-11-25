# MmadFitbooki Service - AWS S3 Deployment Guide

## Overview
This guide will help you deploy your MmadFitbooki Service to AWS S3 for static website hosting.

## Prerequisites

### 1. AWS CLI Installation
- Download and install AWS CLI from: https://aws.amazon.com/cli/
- Verify installation: `aws --version`

### 2. AWS Credentials Configuration
Configure your AWS credentials using one of these methods:

**Option A: AWS Configure**
```bash
aws configure
```
Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region: `us-east-1`
- Default output format: `json`

**Option B: Environment Variables**
```powershell
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### 3. Node.js and npm
- Ensure Node.js is installed
- Dependencies are already installed (`node_modules` exists)

## Deployment Steps

### Step 1: Build the Project
```powershell
npm run build
```
This creates the `dist/` folder with production-ready files.

### Step 2: Set Up S3 Bucket (One-time setup)
```powershell
.\setup-s3-website.ps1 -BucketName "mmadfitbooki-servive"
```

This script will:
- Create the S3 bucket
- Enable static website hosting
- Set public read permissions
- Configure index.html as the default document

### Step 3: Deploy to S3
```powershell
.\deploy-to-s3.ps1 -BucketName "mmadfitbooki-servive"
```

This script will:
- Upload all files from `dist/` to S3
- Set appropriate cache headers
- Provide the website URL

## Website URL
After deployment, your website will be available at:
```
http://mmadfitbooki-servive.s3-website-us-east-1.amazonaws.com
```

## Project Features

### ✅ Completed
- **Build System**: Vite + TypeScript + React
- **Styling**: Custom blue color palette matching app.mamaadsolution.com
- **Components**: Full component library with icons and common elements
- **Views**: Complete application views (Booking, Dashboard, Admin, etc.)
- **Services**: Authentication, booking, and API services
- **Responsive Design**: Mobile-friendly layout
- **Error Handling**: Proper error boundaries and validation

### 🎨 Applied Styling
The application now uses your requested blue color palette:
```css
:root {
  --primary-blue: #086ADD;
  --secondary-blue: #0A4F9E;
  --neutral-white: #FFFFFF;
  --neutral-gray: #F5F5F5;
}
```

## Troubleshooting

### Build Issues
If the build fails:
1. Check for TypeScript errors: `npm run build`
2. Verify all imports are correct
3. Ensure all required components exist

### AWS Issues
If deployment fails:
1. Verify AWS credentials: `aws sts get-caller-identity`
2. Check bucket permissions
3. Ensure bucket name is unique globally

### Website Not Loading
1. Check S3 bucket policy allows public read
2. Verify static website hosting is enabled
3. Check the website URL format

## File Structure
```
SAAS For Mmadfitbooki service/
├── dist/                     # Built files (generated)
├── components/               # React components
├── contexts/                 # React contexts
├── services/                 # API services
├── views/                    # Application views
├── App.tsx                   # Main app component
├── index.tsx                 # Entry point
├── index.html                # HTML template
├── index.css                 # Global styles
├── package.json              # Dependencies
├── vite.config.ts           # Build configuration
├── setup-s3-website.ps1    # S3 setup script
├── deploy-to-s3.ps1         # Deployment script
└── DEPLOYMENT.md            # This guide
```

## Next Steps
1. Test the website functionality
2. Set up a custom domain (optional)
3. Configure CloudFront for better performance (optional)
4. Set up CI/CD pipeline for automatic deployments (optional)

## Support
If you encounter issues:
1. Check the console for JavaScript errors
2. Verify all environment variables are set
3. Test the API endpoints
4. Review AWS CloudWatch logs if needed