# Bedrock RAG Application: Developer Technical Reference

## System Overview

This document provides an in-depth technical reference for the Bedrock Retrieval Augmented Generation (RAG) application, detailing the system's architecture, components, and internal mechanisms.

## Architectural Components

### Backend Infrastructure
- **Framework**: AWS Cloud Development Kit (CDK)
- **Compute**: Serverless AWS Lambda functions
- **AI Service**: Amazon Bedrock Knowledge Base
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **Security**: AWS Web Application Firewall (WAF)

## Detailed Component Breakdown

### Lambda Functions

#### 1. Query Lambda (`backend/lambda/query/index.js`)
- **Purpose**: Handle AI-powered document retrieval and generation
- **Key Responsibilities**:
  - Process user queries
  - Interact with Bedrock Agent Runtime
  - Retrieve and generate responses
- **Configuration**:
  - Supports multiple inference profiles
  - Default model: Anthropic Claude Instant
  - Configurable model selection via `inferenceProfileId`

#### 2. Feedback Lambda (`backend/lambda/feedback/index.js`)
- **Purpose**: Manage user feedback collection and storage
- **Feedback API Specification**:
  - **Endpoint**: `/feedback`
  - **Method**: POST
  - **Request Body Schema**:
    ```json
    {
      "messageIndex": number,
      "question": string,
      "response": string,
      "feedbackType": "up" | "down",
      "category": string,
      "comment": string (optional),
      "sessionId": string
    }
    ```
- **Validation Checks**:
  - Required field validation
  - Length restrictions
  - Rate limiting (10 requests per minute per IP)
- **Storage**:
  - DynamoDB table: `user-feedback`
  - Automatic TTL (30 days)
  - Global Secondary Index for feedback type and timestamp

#### 3. Web URL Management Lambdas
- **GetUrls Lambda** (`backend/lambda/getUrls/index.js`):
  - Retrieve current web crawl configuration
  - Return seed URLs, inclusion/exclusion filters
- **UpdateWebUrls Lambda** (`backend/lambda/webUrlSources/index.js`):
  - Dynamically update web crawler data source
  - Manage seed URLs and crawling parameters

#### 4. WAF Cleanup Lambda (`backend/lambda/waf-cleanup/index.js`)
- **Purpose**: Manage IP access tracking and cleanup
- **Key Mechanisms**:
  - Scan DynamoDB for expired IP entries
  - Remove expired IPs from WAF IP set
  - Delete expired tracking records

### DynamoDB Tables

#### 1. WAF IP Tracking Table (`waf-ip-tracking`)
- **Primary Key**: `ip_address` (String)
- **Attributes**:
  - `ip_address`: Tracked IP
  - `expiration_time`: Unix timestamp for IP expiration
  - `developer_name`: Associated developer
  - `description`: Access context
  - `added_time`: Timestamp of IP addition

#### 2. User Feedback Table (`user-feedback`)
- **Primary Key**: `feedbackId`
- **Sort Key**: `timestamp`
- **Attributes**:
  - Feedback details (question, response, type)
  - Metadata (session ID, user IP)
  - Automatic 30-day retention

### Web Application Firewall (WAF) Configuration
- **IP Set Name**: `DevIpSet-V3WSsqmnoVlU`
- **Scope**: Regional
- **Access Control**:
  - Whitelist-based access
  - 8-hour temporary access tokens
  - Maximum 3 active IPs per developer

## Developer Workflow

### IP Management
- Automatic IP detection
- 8-hour access token generation
- Prevents adding private/internal IPs
- Rate-limited to 2 concurrent IPs per developer

### Deployment Considerations
- Requires AWS CLI configuration
- Needs `WAFIPManagementPolicy` for developers
- Uses CDK for infrastructure deployment

## Security Mechanisms
- SSL-enforced data transfers
- Comprehensive input validation
- Rate limiting
- Temporary access tokens
- Automatic IP cleanup

## Monitoring and Logging
- CloudWatch logs for Lambda functions
- DynamoDB tracking
- WAF activity monitoring

## Troubleshooting

### Common Scenarios
- IP already in allowlist
- Rate limit reached
- Private IP detection
- AWS credential issues

### Debugging Tools
- CloudWatch logs
- DynamoDB table scans
- WAF IP set inspection

## Advanced Configuration

### Customization Points
- Inference profile selection
- Crawling parameters
- Expiration duration
- Rate limiting thresholds

## Development Best Practices
- Use `npm start` for automatic IP management
- Regularly review CloudWatch logs
- Maintain AWS credential security
- Follow least-privilege access principles

## Version and Compatibility
- **Version**: 2.0
- **Last Updated**: July 1, 2025
- **Compatibility**:
  - Node.js 16+
  - AWS CLI v2
  - npm 8+

## Legal and Contributions
- Refer to LICENSE for licensing details
- Review CONTRIBUTING.md for contribution guidelines
