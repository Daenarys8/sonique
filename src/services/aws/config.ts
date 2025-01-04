import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from 'aws-amplify/auth';
import { type AwsCredentialIdentity } from '@aws-sdk/types'; // Add this import

const region = 'us-east-1';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;  // You'll get this from API Gateway

export const awsConfig = {
  apiEndpoint: API_ENDPOINT
};

// Create a function to get authenticated client
const getAuthenticatedDynamoClient = async () => {
  const { credentials } = await fetchAuthSession();
  
  if (!credentials) {
    throw new Error('No credentials available');
  }

  const awsCredentials: AwsCredentialIdentity = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken
  };
  
  return DynamoDBDocumentClient.from(
    new DynamoDBClient({ 
      region,
      credentials: awsCredentials
    })
  );
};

// Export an async function to get the DynamoDB client
export const getDynamoDb = async () => {
  return await getAuthenticatedDynamoClient();
};

// For other services that need authentication
export const getS3Client = async () => {
  const { credentials } = await fetchAuthSession();
  
  if (!credentials) {
    throw new Error('No credentials available');
  }

  const awsCredentials: AwsCredentialIdentity = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken
  };
  
  return new S3Client({ 
    region,
    credentials: awsCredentials
  });
};

// Bedrock can keep its direct credentials if needed
export const bedrock = new BedrockRuntimeClient({ 
  region,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || ''
  }
});

// Lambda should also use authenticated credentials
export const getLambdaClient = async () => {
  const { credentials } = await fetchAuthSession();
  
  if (!credentials) {
    throw new Error('No credentials available');
  }

  const awsCredentials: AwsCredentialIdentity = {
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    sessionToken: credentials.sessionToken
  };
  
  return new LambdaClient({ 
    region,
    credentials: awsCredentials
  });
};
