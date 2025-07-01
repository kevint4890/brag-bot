#!/usr/bin/env node

const { WAFV2Client, ListIPSetsCommand, GetIPSetCommand, UpdateIPSetCommand } = require('@aws-sdk/client-wafv2');
const { DynamoDBClient, GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const https = require('https');
const chalk = require('chalk');

// Hardcoded Configuration
const CONFIG = {
  WAF_IP_SET_NAME: 'DevIpSet-V3WSsqmnoVlU',
  AWS_REGION: 'us-east-2',
  DYNAMODB_TABLE: 'waf-ip-tracking',
  EXPIRATION_HOURS: 8,
  MAX_IPS_PER_DEVELOPER: 3
};

// Initialize AWS clients
const wafv2Client = new WAFV2Client({ region: CONFIG.AWS_REGION });
const dynamodbClient = new DynamoDBClient({ region: CONFIG.AWS_REGION });
const stsClient = new STSClient({ region: CONFIG.AWS_REGION });

// Console output helpers
const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✅'), msg),
  warning: (msg) => console.log(chalk.yellow('⚠️'), msg),
  error: (msg) => console.log(chalk.red('❌'), msg),
  title: (msg) => console.log(chalk.bold.cyan(msg))
};

/**
 * Get current public IP address
 */
async function getCurrentIP() {
  const services = [
    'https://ipinfo.io/ip',
    'https://icanhazip.com',
    'https://api.ipify.org'
  ];

  for (const service of services) {
    try {
      const ip = await new Promise((resolve, reject) => {
        https.get(service, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(data.trim()));
        }).on('error', reject);
      });

      // Validate IP format
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
        return ip;
      }
    } catch (error) {
      continue; // Try next service
    }
  }
  
  throw new Error('Could not detect public IP address');
}

/**
 * Check if IP is private/reserved
 */
function isPrivateIP(ip) {
  const parts = ip.split('.').map(Number);
  return (
    parts[0] === 10 ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168) ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254)
  );
}

/**
 * Get developer name from AWS credentials
 */
async function getDeveloperName() {
  try {
    const command = new GetCallerIdentityCommand({});
    const response = await stsClient.send(command);
    return response.Arn.split('/').pop() || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Get WAF IP Set ID
 */
async function getWAFIPSetId() {
  try {
    const command = new ListIPSetsCommand({
      Scope: 'REGIONAL',
      Limit: 100
    });
    
    const response = await wafv2Client.send(command);
    const ipSet = response.IPSets.find(set => set.Name === CONFIG.WAF_IP_SET_NAME);
    
    if (!ipSet) {
      throw new Error(`WAF IP Set '${CONFIG.WAF_IP_SET_NAME}' not found`);
    }
    
    return ipSet.Id;
  } catch (error) {
    throw new Error(`Failed to find WAF IP Set: ${error.message}`);
  }
}

/**
 * Check if IP already exists and is not expired
 */
async function checkExistingIP(ip) {
  try {
    const command = new GetItemCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      Key: { 
        ip_address: { S: ip } 
      }
    });
    
    const response = await dynamodbClient.send(command);
    
    if (response.Item) {
      const expiration = parseInt(response.Item.expiration_time.N);
      const now = Math.floor(Date.now() / 1000);
      
      if (expiration > now) {
        const hoursRemaining = Math.ceil((expiration - now) / 3600);
        const expirationTime = new Date(expiration * 1000).toLocaleTimeString();
        return {
          exists: true,
          hoursRemaining,
          expirationTime
        };
      }
    }
    
    return { exists: false };
  } catch (error) {
    // If DynamoDB check fails, continue anyway
    return { exists: false };
  }
}

/**
 * Check developer's current IP count
 */
async function checkDeveloperIPCount(developerName) {
  try {
    const command = new ScanCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      FilterExpression: 'developer_name = :dev AND expiration_time > :now',
      ExpressionAttributeValues: {
        ':dev': { S: developerName },
        ':now': { N: Math.floor(Date.now() / 1000).toString() }
      },
      Select: 'COUNT'
    });
    
    const response = await dynamodbClient.send(command);
    return response.Count || 0;
  } catch (error) {
    return 0; // If check fails, allow the operation
  }
}

/**
 * Add IP to WAF IP Set
 */
async function addIPToWAF(ip, ipSetId) {
  try {
    // Get current IP set
    const getCommand = new GetIPSetCommand({
      Scope: 'REGIONAL',
      Id: ipSetId,
      Name: CONFIG.WAF_IP_SET_NAME
    });
    
    const ipSetInfo = await wafv2Client.send(getCommand);
    const currentAddresses = ipSetInfo.IPSet.Addresses || [];
    const ipWithCIDR = `${ip}/32`;
    
    // Check if IP already in WAF
    if (currentAddresses.includes(ipWithCIDR)) {
      return { alreadyExists: true };
    }
    
    // Add IP to the list
    const newAddresses = [...currentAddresses, ipWithCIDR];
    
    // Update WAF IP set
    const updateCommand = new UpdateIPSetCommand({
      Scope: 'REGIONAL',
      Id: ipSetId,
      Name: CONFIG.WAF_IP_SET_NAME,
      Addresses: newAddresses,
      LockToken: ipSetInfo.LockToken
    });
    
    await wafv2Client.send(updateCommand);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to update WAF IP Set: ${error.message}`);
  }
}

/**
 * Remove IP from WAF IP Set
 */
async function removeIPFromWAF(ip, ipSetId) {
  try {
    // Get current IP set
    const getCommand = new GetIPSetCommand({
      Scope: 'REGIONAL',
      Id: ipSetId,
      Name: CONFIG.WAF_IP_SET_NAME
    });
    
    const ipSetInfo = await wafv2Client.send(getCommand);
    const currentAddresses = ipSetInfo.IPSet.Addresses || [];
    const ipWithCIDR = `${ip}/32`;
    
    // Check if IP is in WAF
    if (!currentAddresses.includes(ipWithCIDR)) {
      return { notFound: true };
    }
    
    // Remove IP from the list
    const newAddresses = currentAddresses.filter(addr => addr !== ipWithCIDR);
    
    // Update WAF IP set
    const updateCommand = new UpdateIPSetCommand({
      Scope: 'REGIONAL',
      Id: ipSetId,
      Name: CONFIG.WAF_IP_SET_NAME,
      Addresses: newAddresses,
      LockToken: ipSetInfo.LockToken
    });
    
    await wafv2Client.send(updateCommand);
    return { success: true };
  } catch (error) {
    throw new Error(`Failed to update WAF IP Set: ${error.message}`);
  }
}

/**
 * Add IP tracking to DynamoDB
 */
async function addIPTracking(ip, developerName, description) {
  try {
    const expirationTime = Math.floor(Date.now() / 1000) + (CONFIG.EXPIRATION_HOURS * 3600);
    
    const command = new PutItemCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      Item: {
        ip_address: { S: ip },
        expiration_time: { N: expirationTime.toString() },
        developer_name: { S: developerName },
        description: { S: description },
        added_time: { N: Math.floor(Date.now() / 1000).toString() }
      }
    });
    
    await dynamodbClient.send(command);
    
    const expirationDate = new Date(expirationTime * 1000);
    return {
      success: true,
      expirationTime: expirationDate.toLocaleTimeString(),
      expirationDate: expirationDate.toLocaleDateString()
    };
  } catch (error) {
    throw new Error(`Failed to add IP tracking: ${error.message}`);
  }
}

/**
 * Remove IP tracking from DynamoDB
 */
async function removeIPTracking(ip) {
  try {
    const command = new DeleteItemCommand({
      TableName: CONFIG.DYNAMODB_TABLE,
      Key: { 
        ip_address: { S: ip } 
      }
    });
    
    await dynamodbClient.send(command);
    return { success: true };
  } catch (error) {
    // Don't fail if DynamoDB removal fails
    return { success: false, error: error.message };
  }
}

/**
 * Add IP to allowlist
 */
async function addIP() {
  log.title('🔍 Checking IP access...');
  
  try {
    // Step 1: Get current IP
    const currentIP = await getCurrentIP();
    log.info(`Detected IP: ${currentIP}`);
    
    // Step 2: Validate IP
    if (isPrivateIP(currentIP)) {
      log.warning('Private IP detected - skipping WAF update');
      log.info('Private IPs cannot be added to WAF IP sets');
      return;
    }
    
    // Step 3: Check if IP already exists
    const existing = await checkExistingIP(currentIP);
    if (existing.exists) {
      log.success(`IP already allowed (expires at ${existing.expirationTime}, ${existing.hoursRemaining}h remaining)`);
      return;
    }
    
    // Step 4: Get developer info
    const developerName = await getDeveloperName();
    
    // Step 5: Check rate limiting
    const currentCount = await checkDeveloperIPCount(developerName);
    if (currentCount >= CONFIG.MAX_IPS_PER_DEVELOPER) {
      log.warning(`Maximum of ${CONFIG.MAX_IPS_PER_DEVELOPER} IPs already active for ${developerName}`);
      log.info('Some IPs will expire automatically, or use npm run stop to clean up');
      return;
    }
    
    // Step 6: Get WAF IP Set ID
    const ipSetId = await getWAFIPSetId();
    
    // Step 7: Add to WAF
    const wafResult = await addIPToWAF(currentIP, ipSetId);
    if (wafResult.alreadyExists) {
      log.info('IP already in WAF IP set, updating tracking...');
    } else {
      log.success(`Added IP to WAF allowlist: ${CONFIG.WAF_IP_SET_NAME}`);
    }
    
    // Step 8: Add tracking
    const description = `Added via npm start by ${developerName}`;
    const tracking = await addIPTracking(currentIP, developerName, description);
    
    log.success(`IP ${currentIP} allowed until ${tracking.expirationTime} on ${tracking.expirationDate}`);
    log.info(`Access expires in ${CONFIG.EXPIRATION_HOURS} hours`);
    
  } catch (error) {
    log.warning('Could not add IP to allowlist');
    log.error(error.message);
    
    // Provide helpful troubleshooting
    if (error.message.includes('credentials') || error.message.includes('Unable to locate credentials')) {
      log.info('💡 Run: aws configure');
    } else if (error.message.includes('permission') || error.message.includes('Access Denied') || error.message.includes('UnauthorizedOperation')) {
      log.info('💡 Contact admin to attach WAFIPManagementPolicy to your AWS user');
    } else if (error.message.includes('IP address')) {
      log.info('💡 Check your internet connection');
    } else if (error.message.includes('not found')) {
      log.info('💡 Ensure the WAF IP set exists and backend is deployed');
    }
  }
}

/**
 * Remove IP from allowlist
 */
async function removeIP() {
  log.title('🧹 Cleaning up IP access...');
  
  try {
    // Step 1: Get current IP
    const currentIP = await getCurrentIP();
    log.info(`Detected IP: ${currentIP}`);
    
    // Step 2: Get WAF IP Set ID
    const ipSetId = await getWAFIPSetId();
    
    // Step 3: Remove from WAF
    const wafResult = await removeIPFromWAF(currentIP, ipSetId);
    if (wafResult.notFound) {
      log.info('IP not found in WAF IP set');
    } else {
      log.success('Removed IP from WAF allowlist');
    }
    
    // Step 4: Remove tracking
    const trackingResult = await removeIPTracking(currentIP);
    if (trackingResult.success) {
      log.success('Removed IP tracking');
    }
    
    log.success('IP access cleanup completed');
    
  } catch (error) {
    log.warning('Could not fully clean up IP access');
    log.error(error.message);
    // Don't provide troubleshooting for cleanup - it's not critical
  }
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'add':
      await addIP();
      break;
    case 'remove':
      await removeIP();
      break;
    default:
      log.error('Usage: node manage-ip.js [add|remove]');
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log.error('Unexpected error:', error.message);
    process.exit(0); // Exit successfully to not break npm scripts
  });
}

module.exports = { addIP, removeIP };
