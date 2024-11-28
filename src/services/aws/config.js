import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { S3Client } from '@aws-sdk/client-s3';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { LambdaClient } from "@aws-sdk/client-lambda";

const region = 'us-east-1';

export const dynamoDb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region })
);

export const s3 = new S3Client({ region });
export const bedrock = new BedrockRuntimeClient({ region });
export const lambda = new LambdaClient({ region });