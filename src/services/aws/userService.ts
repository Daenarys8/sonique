import { GetCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getDynamoDb } from './config.ts';
import type { UserProfile } from '../../types/game';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

const USERS_TABLE = 'sonique-users';

export async function getUserProfile(userId: string): Promise<UserProfile> {
  try {
    const dynamoDb = await getDynamoDb();
    const response = await dynamoDb.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: {
          username: userId
        }
      })
    );

    if (!response.Item) {
      // If user doesn't exist, create default profile
      const defaultProfile: UserProfile = getDefaultProfile(userId, userId);

      await dynamoDb.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: defaultProfile,
          ConditionExpression: 'attribute_not_exists(username)'
        })
      );

      return defaultProfile;
    }

    return response.Item as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const dynamoDb = await getDynamoDb();
    
    const updateExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    const expressionAttributeNames: Record<string, string> = {};

    // Handle nested updates for stats
    if (updates.stats) {
      Object.entries(updates.stats).forEach(([key, value]) => {
        updateExpressions.push(`stats.#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      });
    }

    // Handle nested updates for preferences
    if (updates.preferences) {
      Object.entries(updates.preferences).forEach(([key, value]) => {
        updateExpressions.push(`preferences.#pref_${key} = :pref_${key}`);
        expressionAttributeValues[`:pref_${key}`] = value;
        expressionAttributeNames[`#pref_${key}`] = key;
      });
    }

    // Handle other top-level updates
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'stats' && key !== 'preferences') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    // Add updatedAt timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    await dynamoDb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
          username: userId
        },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames
      })
    );
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
}

export async function createUserProfile(
  userId: string, 
  initialProfile: Partial<UserProfile> = {}
): Promise<void> {
  try {
    const dynamoDb = await getDynamoDb();
    const defaultProfile = {
      ...getDefaultProfile(userId, initialProfile.username || userId),
      ...initialProfile,
      userId,
      updatedAt: new Date().toISOString()
    };

    // Add this detailed logging
    console.log('Profile data to save:', JSON.stringify(defaultProfile, null, 2));
    console.log('Command parameters:', JSON.stringify({
      TableName: USERS_TABLE,
      Item: defaultProfile
    }, null, 2));

    await dynamoDb.send(
      new PutCommand({
        TableName: USERS_TABLE,
        Item: defaultProfile
      })
    );
  } catch (error: any) {
    // Enhance error logging
    console.error('DynamoDB error details:', {
      message: error.message,
      name: error.name,
      code: error.$metadata?.httpStatusCode,
      requestId: error.$metadata?.requestId,
      error: JSON.stringify(error, null, 2)
    });
    throw error;
  }
}


export function getDefaultProfile(userId: string, username: string): UserProfile {
  return {
    userId,
    username,
    stats: {
      totalGames: 0,
      totalScore: 0,
      totalCoins: 1000,
      completedCategories: []
    },
    preferences: {
      theme: 'light',
      soundEnabled: true
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
