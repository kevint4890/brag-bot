# WAF IP Management - Integrated with npm

Automatic IP allowlist management for AWS WAF, seamlessly integrated into your development workflow. No more manual commands - just use `npm run start` and your IP is automatically added to the WAF allowlist!

## 🚀 How It Works

When you start the frontend development server, your IP is automatically:
- ✅ Detected from your current public IP
- ✅ Added to the AWS WAF IP allowlist  
- ✅ Tracked with 8-hour expiration
- ✅ Cleaned up when you run `npm run stop`

## 📋 Prerequisites

### 1. AWS CLI Setup
```bash
# Install AWS CLI (if not already installed)
# macOS: brew install awscli
# Or download from: https://aws.amazon.com/cli/

# Configure your AWS credentials
aws configure
```

### 2. IAM Permissions
Your AWS user needs the `WAFIPManagementPolicy` attached. Contact your admin to attach this policy:

```bash
# Admin runs this for each developer:
aws iam attach-user-policy \
  --user-name DEVELOPER_USERNAME \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/WAFIPManagementPolicy
```

### 3. Install Dependencies
```bash
cd frontend
npm install
```

## 🎯 Usage

### Starting Development
```bash
cd frontend
npm run start
```

**What happens:**
```
🔍 Checking IP access...
ℹ Detected IP: 98.46.115.123
✅ Added IP to WAF allowlist: DevIpSet-V3WSsqmnoVlU
✅ IP 98.46.115.123 allowed until 5:10:17 PM on 6/30/2025
ℹ Access expires in 8 hours

> frontend@0.1.0 start
> react-scripts start
Starting the development server...
```

### Finishing Development
```bash
npm run stop
```

**What happens:**
```
🧹 Cleaning up IP access...
ℹ Detected IP: 98.46.115.123
✅ Removed IP from WAF allowlist
✅ Removed IP tracking
✅ IP access cleanup completed
```

## 🔧 Configuration

The system is pre-configured, here is the current configurement:

```javascript
// frontend/scripts/manage-ip.js
const CONFIG = {
  WAF_IP_SET_NAME: 'DevIpSet-V3WSsqmnoVlU',
  AWS_REGION: 'us-east-2',
  DYNAMODB_TABLE: 'waf-ip-tracking',
  EXPIRATION_HOURS: 8,
  MAX_IPS_PER_DEVELOPER: 2
};
```

## 🛡️ Security Features

- **8-hour auto-expiration** - IPs automatically removed after 8 hours
- **Individual IP tracking** - Only your specific IP is added (no subnets)
- **Rate limiting** - Maximum 2 active IPs per developer
- **Private IP blocking** - Won't add internal/private IP addresses
- **Automatic cleanup** - Hourly Lambda removes expired IPs

## 🚨 Error Handling

The system shows **warnings but continues** - it won't break your development workflow:

### AWS Not Configured
```
🔍 Checking IP access...
⚠️ Could not add IP to allowlist
❌ The config profile could not be found
💡 Run: aws configure

> frontend@0.1.0 start
> react-scripts start
Starting the development server...
```

### Permission Denied
```
🔍 Checking IP access...
⚠️ Could not add IP to allowlist
❌ Access Denied: User not authorized
💡 Contact admin to attach WAFIPManagementPolicy to your AWS user

> frontend@0.1.0 start
> react-scripts start
Starting the development server...
```

### Network Issues
```
🔍 Checking IP access...
⚠️ Could not add IP to allowlist
❌ Could not detect public IP address
💡 Check your internet connection

> frontend@0.1.0 start
> react-scripts start
Starting the development server...
```

## 🔄 Common Scenarios

### IP Already Added
```
🔍 Checking IP access...
ℹ Detected IP: 98.46.115.123
✅ IP already allowed (expires at 3:45:22 PM, 5h remaining)
```

### Rate Limit Reached
```
🔍 Checking IP access...
⚠️ Maximum of 2 IPs already active for john-developer
ℹ Some IPs will expire automatically, or use npm run stop to clean up
```

### Private IP Detected
```
🔍 Checking IP access...
ℹ Detected IP: 192.168.1.100
⚠️ Private IP detected - skipping WAF update
ℹ Private IPs cannot be added to WAF IP sets
```

## 🏗️ Architecture

### Components
1. **`frontend/scripts/manage-ip.js`** - Main IP management script
2. **`frontend/package.json`** - npm script integration
3. **DynamoDB Table** - `waf-ip-tracking` for expiration tracking
4. **Lambda Function** - `waf-ip-cleanup` for hourly cleanup
5. **WAF IP Set** - `DevIpSet-V3WSsqmnoVlU` for access control

### Data Flow
```
npm start → manage-ip.js add → AWS WAF + DynamoDB → react-scripts start
npm run stop → manage-ip.js remove → AWS WAF + DynamoDB cleanup
```

## 🛠️ Troubleshooting

### Script Not Running
```bash
# Check if the script exists
ls -la frontend/scripts/manage-ip.js

# Check npm scripts
cat frontend/package.json | grep -A 10 '"scripts"'
```

### AWS Connection Issues
```bash
# Test AWS credentials
aws sts get-caller-identity

# Test WAF access
aws wafv2 list-ip-sets --scope REGIONAL --region us-east-2
```

### DynamoDB Issues
```bash
# Check if table exists
aws dynamodb describe-table --table-name waf-ip-tracking --region us-east-2
```

### Manual IP Management
If you need to manually manage IPs:
```bash
# Add current IP
cd frontend
node scripts/manage-ip.js add

# Remove current IP  
node scripts/manage-ip.js remove
```

## 👥 Team Workflow

### For New Developers
1. Get AWS credentials from admin
2. Run `aws configure` to set up credentials
3. Ask admin to attach `WAFIPManagementPolicy` to your AWS user
4. Clone the repo and run `cd frontend && npm install`
5. Start developing with `npm start` - IP management is automatic!

### For Admins
1. Deploy the backend infrastructure: `cd backend && cdk deploy`
2. Create the IAM policy (done automatically by CDK)
3. Attach policy to each developer's AWS user
4. Monitor the cleanup Lambda in CloudWatch

### Best Practices
- **Use `npm start`** for development (automatic IP management)
- **Use `npm run stop`** when done for the day (optional - IPs expire automatically)
- **Check console output** for any warnings or issues
- **Contact admin** if you see permission errors

## 📊 Monitoring

### CloudWatch Logs
- **Cleanup Lambda**: `/aws/lambda/waf-ip-cleanup`
- **WAF Logs**: `aws-waf-logs-backend`

### Manual Checks
```bash
# See current WAF IP set contents
aws wafv2 get-ip-set \
  --scope REGIONAL \
  --id $(aws wafv2 list-ip-sets --scope REGIONAL --query 'IPSets[?Name==`DevIpSet-V3WSsqmnoVlU`].Id' --output text) \
  --region us-east-2

# Check DynamoDB tracking table
aws dynamodb scan --table-name waf-ip-tracking --region us-east-2
```

## 🔧 Advanced Usage

### Custom Expiration (Admins Only)
To change the 8-hour default, modify `frontend/scripts/manage-ip.js`:
```javascript
const CONFIG = {
  // ... other settings
  EXPIRATION_HOURS: 4,  // Change to 4 hours
};
```

### Different WAF IP Set
To use a different IP set, update the configuration:
```javascript
const CONFIG = {
  WAF_IP_SET_NAME: 'YourCustomIPSet',
  // ... other settings
};
```

---

**Version**: 2.0 (npm-integrated)  
**Last Updated**: June 30, 2025  
**Compatibility**: Node.js 16+, AWS CLI v2, npm 8+
