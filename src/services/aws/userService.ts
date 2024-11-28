import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './config';
import type { UserProfile } from '../../types/game';

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const { Item } = await dynamoDb.send(
      new GetCommand({
        TableName: 'sonique-users',
        Key: { userId },
      })
    );

    return Item as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  try {
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(profile).forEach(([key, value]) => {
      updateExpressions.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
    });

    await dynamoDb.send(
      new PutCommand({
        TableName: 'sonique-users',
        Item: {
          userId,
          ...profile,
        },
      })
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}