const { WAFV2Client, ListIPSetsCommand, GetIPSetCommand, UpdateIPSetCommand } = require('@aws-sdk/client-wafv2');
const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');

// Configuration
const DYNAMODB_TABLE = process.env.DYNAMODB_TABLE || 'waf-ip-tracking';
const WAF_IP_SET_NAME = process.env.WAF_IP_SET_NAME || 'DevIpSet-V3WSsqmnoVlU';
const AWS_REGION = process.env.AWS_REGION || 'us-east-2';

// Initialize AWS clients
const wafv2Client = new WAFV2Client({ region: AWS_REGION });
const dynamodbClient = new DynamoDBClient({ region: AWS_REGION });

/**
 * Lambda handler for cleaning up expired IPs from WAF and DynamoDB
 */
exports.handler = async (event) => {
    console.log('Starting WAF IP cleanup process...');
    
    try {
        // Get current timestamp
        const currentTime = Math.floor(Date.now() / 1000);
        console.log(`Current timestamp: ${currentTime}`);
        
        // Step 1: Find expired IPs in DynamoDB
        const expiredIPs = await getExpiredIPs(currentTime);
        
        if (expiredIPs.length === 0) {
            console.log('No expired IPs found');
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'No expired IPs found',
                    cleanedCount: 0
                })
            };
        }
        
        console.log(`Found ${expiredIPs.length} expired IP(s):`, expiredIPs);
        
        // Step 2: Get WAF IP Set information
        const ipSetInfo = await getWAFIPSet();
        
        // Step 3: Remove expired IPs from WAF IP Set
        const updatedAddresses = await removeIPsFromWAF(expiredIPs, ipSetInfo);
        
        // Step 4: Remove expired records from DynamoDB
        await removeExpiredRecords(expiredIPs);
        
        console.log(`Successfully cleaned up ${expiredIPs.length} expired IP(s)`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully cleaned up ${expiredIPs.length} expired IP(s)`,
                cleanedIPs: expiredIPs,
                cleanedCount: expiredIPs.length
            })
        };
        
    } catch (error) {
        console.error('Error during cleanup process:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error during cleanup process',
                error: error.message
            })
        };
    }
};

/**
 * Get expired IPs from DynamoDB
 */
async function getExpiredIPs(currentTime) {
    const command = new ScanCommand({
        TableName: DYNAMODB_TABLE,
        FilterExpression: 'expiration_time <= :currentTime',
        ExpressionAttributeValues: {
            ':currentTime': { N: currentTime.toString() }
        },
        ProjectionExpression: 'ip_address, expiration_time, developer_name'
    });
    
    try {
        const result = await dynamodbClient.send(command);
        
        return result.Items.map(item => ({
            ip: item.ip_address.S,
            expiration: parseInt(item.expiration_time.N),
            developer: item.developer_name.S
        }));
        
    } catch (error) {
        console.error('Error scanning DynamoDB for expired IPs:', error);
        throw new Error(`Failed to scan DynamoDB: ${error.message}`);
    }
}

/**
 * Get WAF IP Set information
 */
async function getWAFIPSet() {
    try {
        // First, get the IP Set ID
        const listCommand = new ListIPSetsCommand({
            Scope: 'REGIONAL',
            Limit: 100
        });
        
        const ipSets = await wafv2Client.send(listCommand);
        const targetIPSet = ipSets.IPSets.find(ipSet => ipSet.Name === WAF_IP_SET_NAME);
        
        if (!targetIPSet) {
            throw new Error(`WAF IP Set '${WAF_IP_SET_NAME}' not found`);
        }
        
        // Get detailed IP Set information
        const getCommand = new GetIPSetCommand({
            Scope: 'REGIONAL',
            Id: targetIPSet.Id,
            Name: WAF_IP_SET_NAME
        });
        
        const ipSetDetails = await wafv2Client.send(getCommand);
        
        return {
            id: targetIPSet.Id,
            lockToken: ipSetDetails.LockToken,
            addresses: ipSetDetails.IPSet.Addresses || []
        };
        
    } catch (error) {
        console.error('Error getting WAF IP Set:', error);
        throw new Error(`Failed to get WAF IP Set: ${error.message}`);
    }
}

/**
 * Remove expired IPs from WAF IP Set
 */
async function removeIPsFromWAF(expiredIPs, ipSetInfo) {
    const expiredIPsWithCIDR = expiredIPs.map(item => `${item.ip}/32`);
    
    // Filter out expired IPs from current addresses
    const updatedAddresses = ipSetInfo.addresses.filter(address => {
        return !expiredIPsWithCIDR.includes(address);
    });
    
    console.log(`Current addresses: ${ipSetInfo.addresses.length}`);
    console.log(`Updated addresses: ${updatedAddresses.length}`);
    console.log(`Removing: ${expiredIPsWithCIDR.join(', ')}`);
    
    // Only update if there are changes
    if (updatedAddresses.length !== ipSetInfo.addresses.length) {
        const updateCommand = new UpdateIPSetCommand({
            Scope: 'REGIONAL',
            Id: ipSetInfo.id,
            Name: WAF_IP_SET_NAME,
            Addresses: updatedAddresses,
            LockToken: ipSetInfo.lockToken
        });
        
        try {
            await wafv2Client.send(updateCommand);
            console.log('Successfully updated WAF IP Set');
        } catch (error) {
            console.error('Error updating WAF IP Set:', error);
            throw new Error(`Failed to update WAF IP Set: ${error.message}`);
        }
    } else {
        console.log('No changes needed for WAF IP Set');
    }
    
    return updatedAddresses;
}

/**
 * Remove expired records from DynamoDB
 */
async function removeExpiredRecords(expiredIPs) {
    const deletePromises = expiredIPs.map(async (item) => {
        const command = new DeleteItemCommand({
            TableName: DYNAMODB_TABLE,
            Key: {
                ip_address: { S: item.ip }
            }
        });
        
        try {
            await dynamodbClient.send(command);
            console.log(`Removed expired record for IP: ${item.ip} (developer: ${item.developer})`);
        } catch (error) {
            console.error(`Error removing record for IP ${item.ip}:`, error);
            throw new Error(`Failed to remove DynamoDB record for ${item.ip}: ${error.message}`);
        }
    });
    
    await Promise.all(deletePromises);
    console.log(`Removed ${expiredIPs.length} expired records from DynamoDB`);
}

/**
 * Format timestamp for logging
 */
function formatTimestamp(timestamp) {
    return new Date(timestamp * 1000).toISOString();
}
