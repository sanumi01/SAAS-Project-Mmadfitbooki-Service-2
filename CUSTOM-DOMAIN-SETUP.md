# MMAD FitBooki - Custom Domain Setup Guide
## Setting up fitness.mamaadsolution.com

### 🎯 **Overview**
This guide will help you set up your MMAD FitBooki platform on the custom domain `fitness.mamaadsolution.com` with:
- ✅ CloudFront CDN distribution
- ✅ SSL/TLS certificate (HTTPS)
- ✅ Custom domain configuration
- ✅ DNS setup instructions

---

## 🚀 **Quick Setup (Automated)**

### **Step 1: Run the Complete Setup Script**
```powershell
.\setup-custom-domain-complete.ps1
```

This script will:
1. ✅ Build and deploy your application to S3
2. ✅ Request SSL certificate for fitness.mamaadsolution.com
3. ✅ Create CloudFront distribution with custom domain
4. ✅ Configure HTTPS redirect and caching
5. ✅ Provide DNS configuration instructions

### **Step 2: Add DNS Record**
After the script completes, add this CNAME record to your `mamaadsolution.com` DNS:

```
Record Type: CNAME
Name: fitness
Value: [CloudFront-Domain-From-Script]
TTL: 300
```

### **Step 3: Verify Setup**
```powershell
.\check-domain-status.ps1
```

---

## 🔧 **Manual Setup (Step by Step)**

### **1. SSL Certificate Setup**
```powershell
.\setup-ssl-certificate.ps1 -CustomDomain "fitness.mamaadsolution.com"
```

### **2. CloudFront Distribution**
```powershell
.\setup-cloudfront-custom.ps1 -CustomDomain "fitness.mamaadsolution.com" -CertificateArn "arn:aws:acm:..."
```

### **3. DNS Configuration**
```powershell
.\setup-dns.ps1 -CustomDomain "fitness.mamaadsolution.com" -CloudFrontDomain "d123456789.cloudfront.net"
```

---

## 📋 **DNS Configuration Details**

### **Required DNS Record**
Add this record to your `mamaadsolution.com` domain:

| Type  | Name    | Value                    | TTL |
|-------|---------|--------------------------|-----|
| CNAME | fitness | d123456789.cloudfront.net | 300 |

### **DNS Providers**
- **Cloudflare**: DNS → Records → Add Record
- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record
- **Route 53**: Hosted Zones → Create Record

---

## ⏱️ **Timeline**

| Step | Duration | Status |
|------|----------|--------|
| SSL Certificate Request | 2-5 minutes | ⏳ |
| SSL Certificate Validation | 5-30 minutes | ⏳ |
| CloudFront Distribution | 10-15 minutes | ⏳ |
| DNS Propagation | 5-30 minutes | ⏳ |
| **Total Setup Time** | **20-80 minutes** | ⏳ |

---

## 🔍 **Verification Steps**

### **1. Check CloudFront Status**
```powershell
aws cloudfront get-distribution --id E123456789ABCD
```

### **2. Test SSL Certificate**
```powershell
curl -I https://fitness.mamaadsolution.com
```

### **3. DNS Lookup**
```powershell
nslookup fitness.mamaadsolution.com
```

### **4. Full Connectivity Test**
```powershell
.\verify-custom-domain.ps1
```

---

## 🌐 **Final URLs**

After setup completion, your MMAD FitBooki platform will be available at:

- **🎯 Primary URL**: https://fitness.mamaadsolution.com
- **🔄 Fallback URL**: https://d123456789.cloudfront.net
- **📦 S3 Direct**: http://mmadfitbooki-servive.s3-website-us-east-1.amazonaws.com

---

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **SSL Certificate Validation Failed**
- ✅ Verify DNS validation record is added correctly
- ✅ Wait 5-30 minutes for DNS propagation
- ✅ Check AWS Certificate Manager console

#### **CloudFront Distribution Not Working**
- ✅ Ensure distribution status is "Deployed"
- ✅ Check origin configuration points to S3 website endpoint
- ✅ Verify SSL certificate is attached

#### **DNS Not Resolving**
- ✅ Confirm CNAME record is added to mamaadsolution.com
- ✅ Use correct CloudFront domain name
- ✅ Wait for DNS propagation (up to 48 hours)

#### **HTTPS Not Working**
- ✅ SSL certificate must be in us-east-1 region
- ✅ Certificate status must be "ISSUED"
- ✅ CloudFront viewer protocol policy set to "Redirect HTTP to HTTPS"

### **Support Commands**
```powershell
# Check all statuses
.\check-domain-status.ps1

# Verify domain connectivity
.\verify-custom-domain.ps1

# Get CloudFront distribution details
aws cloudfront get-distribution --id [DISTRIBUTION-ID]

# Check SSL certificate status
aws acm describe-certificate --certificate-arn [CERTIFICATE-ARN] --region us-east-1
```

---

## 📞 **Support**

If you encounter issues:
1. Run `.\check-domain-status.ps1` for diagnostics
2. Check AWS Console for detailed error messages
3. Verify DNS records in your domain registrar
4. Ensure AWS CLI has proper permissions

---

## 🎉 **Success Indicators**

Your setup is complete when:
- ✅ `https://fitness.mamaadsolution.com` loads your MMAD FitBooki app
- ✅ SSL certificate shows as valid (green lock icon)
- ✅ HTTP automatically redirects to HTTPS
- ✅ Page loads quickly (CloudFront caching working)

**🚀 Your MMAD FitBooki platform is now live on your custom domain!**