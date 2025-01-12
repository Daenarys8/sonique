import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from "@aws-sdk/client-lambda";
import { fetchAuthSession } from 'aws-amplify/auth';
import { type AwsCredentialIdentity } from '@aws-sdk/types';

export const AWS_REGION = 'us-east-1';
export const USERS_TABLE = 'sonique-users';
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

interface AWSClientConfig {
  region: string;
  credentials: AwsCredentialIdentity;
}

const getAuthenticatedCredentials = async (): Promise<AwsCredentialIdentity> => {
  try {
    const session = await fetchAuthSession();
    console.log('Auth session:', {
      hasCredentials: !!session.credentials,
      identityId: session.identityId
    });
    
    if (!session.credentials) {
      throw new Error('No credentials available');
    }
    
    return {
      accessKeyId: session.credentials.accessKeyId,
      secretAccessKey: session.credentials.secretAccessKey,
      sessionToken: session.credentials.sessionToken
    };
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
};

const getClientConfig = async (): Promise<AWSClientConfig> => {
  const credentials = await getAuthenticatedCredentials();
  return {
    region: AWS_REGION,
    credentials
  };
};

const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  throw new Error('Max retries exceeded');
};

export const getDynamoDb = async () => {
  return await withRetry(async () => {
    const config = await getClientConfig();
    console.log('DynamoDB config:', {
      region: config.region,
      hasCredentials: !!config.credentials
    });
    
    const client = DynamoDBDocumentClient.from(
      new DynamoDBClient(config),
      {
        marshallOptions: {
          removeUndefinedValues: true,
          convertEmptyValues: false
        }
      }
    );
    
    return client;
  });
};

export const getS3Client = async () => {
  return await withRetry(async () => {
    const config = await getClientConfig();
    return new S3Client(config);
  });
};

export const getBedrockClient = async () => {
  return await withRetry(async () => {
    const config = await getClientConfig();
    return new BedrockRuntimeClient(config);
  });
};

export const getLambdaClient = async () => {
  return await withRetry(async () => {
    const config = await getClientConfig();
    return new LambdaClient(config);
  });
};

export const awsConfig = {
  apiEndpoint: API_ENDPOINT
};
