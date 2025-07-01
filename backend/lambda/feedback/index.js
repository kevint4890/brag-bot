const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const FEEDBACK_TABLE_NAME = process.env.DYNAMODB_TABLE;
const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS || "30");

// Simple rate limiting (resets with Lambda cold starts)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Max requests per minute

const headers = {
    "content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
};

function validateFeedback(feedback) {
    // Check required fields
    const requiredFields = ["messageIndex", "question", "response", "feedbackType"];
    for (const field of requiredFields) {
        if (feedback[field] === undefined || feedback[field] === null) {
            return { valid: false, error: `Missing required field: ${field}` };
        }
    }

    // Validate feedbackType
    const validTypes = ["up", "down"];
    if (!validTypes.includes(feedback.feedbackType)) {
        return { valid: false, error: `Invalid feedbackType: ${feedback.feedbackType}. Must be one of ${validTypes.join(", ")}` };
    }

    // Validate data types and lengths
    if (typeof feedback.messageIndex !== "number" || feedback.messageIndex < 0) {
        return { valid: false, error: "messageIndex must be a non-negative number" };
    }
    if (typeof feedback.question !== "string" || feedback.question.length > 5000) {
        return { valid: false, error: "question must be a string with a maximum length of 5000 characters" };
    }
    if (typeof feedback.response !== "string" || feedback.response.length > 10000) {
        return { valid: false, error: "response must be a string with a maximum length of 10000 characters" };
    }
    if (feedback.category && (typeof feedback.category !== "string")) {
        return { valid: false, error: "category must be a string" };
    }
    if (feedback.comment && (typeof feedback.comment !== "string" || feedback.comment.length > 500)) {
        return { valid: false, error: "comment must be a string with max 500 characters" };
    }

    return null; // Valid feedback

}

function checkRateLimit(clientIp) {
    const currentTime = Date.now();

    if (!rateLimitCache.has(clientIp)) {
        rateLimitCache.set(clientIp, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    const clientData = rateLimitCache.get(clientIp);

    if (currentTime > clientData.resetTime) {
        // Reset the count after the window expires
        rateLimitCache.set(clientIp, { count: 1, resetTime: currentTime + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
        return false; // Rate limit exceeded
    }

    clientData.count++;
    return true; // Within rate limit
}

exports.handler = async (event) => {
    console.log("Feedback request received:", JSON.stringify(event, null, 2));

    // Handle CORS preflight requests
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ message: "CORS preflight OK" }),
        };
    }

    try {
        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            console.error("JSON parse error:", parseError);
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ error: "Invalid JSON in request body" })
            };
        }

        // Validate input data
        const validationError = validateFeedback(requestBody);
        if (validationError) {
            console.error("Validation error:", validationError.error);
            return {
                statusCode: 400,
                headers: headers,
                body: JSON.stringify({ 
                    success: false,
                    error: validationError.error })
            };
        }

        // Get client IP and check rate limit
        const clientIp = event.requestContext.identity.sourceIp || "unknown-ip";
        if (!checkRateLimit(clientIp)) {
            console.warn(`Rate limit exceeded for IP: ${clientIp}`);
            return {
                statusCode: 429,
                headers: headers,
                body: JSON.stringify({ 
                    success: false,
                    error: "Rate limit exceeded. Please try again later." })
            };
        }

        // Create feedback record
        const feedbackId = uuidv4();
        const timestamp = new Date().toISOString();
        const ttl = Math.floor(Date.now() / 1000) + (RETENTION_DAYS * 24 * 60 * 60); // TTL in seconds

        const feedbackRecord = {
            feedbackId: feedbackId,
            timestamp: timestamp,
            messageIndex: requestBody.messageIndex,
            question: requestBody.question.substring(0, 5000), // Limit length
            response: requestBody.response.substring(0, 10000), // Limit length
            feedbackType: requestBody.feedbackType,
            category: requestBody.category ? requestBody.category.substring(0, 100) : null,
            comment: requestBody.comment ? requestBody.comment.substring(0, 500) : null,
            session_id: event.requestContext.requestId || null,
            user_ip: clientIp,
            created_at: timestamp,
            ttl: ttl,
        };

        // Store feedback in DynamoDB
        const command = new PutCommand({
            TableName: FEEDBACK_TABLE_NAME,
            Item: feedbackRecord,
        });
        await docClient.send(command);
        console.log("Feedback stored successfully:", feedbackId);

        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify({ 
                success: true, 
                message: "Feedback stored successfully", 
                feedbackId: feedbackId 
            })
        };
    } catch (error) {
        console.error("Error processing feedback request:", error);
        return {
            statusCode: 500,
            headers: headers,
            body: JSON.stringify({ 
                success: false, 
                error: "Internal server error" 
            })
        };
    }
};