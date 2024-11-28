# Puzzle Game Project

## Setup Instructions

1. AWS Configuration
   - Create a Cognito User Pool and note the Pool ID
   - Create a Cognito App Client and note the Client ID
   - Create a Cognito Identity Pool and note the Identity Pool ID
   - Set up Bedrock access permissions for the Identity Pool role

2. Environment Variables
   Update the following environment variables in Amplify Console:
   - VITE_AWS_REGION
   - VITE_COGNITO_USER_POOL_ID
   - VITE_COGNITO_CLIENT_ID
   - VITE_IDENTITY_POOL_ID

3. Deployment
   - Connect your repository to AWS Amplify
   - The amplify.yml configuration will handle the build and deployment
   - Ensure environment variables are set in Amplify Console

## Features

- User authentication with Cognito (including guest mode)
- Dynamic puzzle generation using Amazon Bedrock
- Futuristic UI design with responsive components
- Secure API integration with AWS services
- Leaderboard and progress tracking

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm run test
```

## Building

```bash
npm run build
```