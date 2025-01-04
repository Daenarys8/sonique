import { DynamoDB } from 'aws-sdk';

// Define types for DynamoDB transaction errors
interface CancellationReason {
  Code: string;
  Message?: string;
}

interface TransactionCanceledException extends Error {
  name: string;
  CancellationReasons?: CancellationReason[];
}

// Define AppSync event type for better TypeScript support
interface AppSyncEvent {
  arguments: {
    category: string;
    coins: number;
  };
  identity: {
    sub: string;
  };
}

const dynamoDB = new DynamoDB.DocumentClient();
const LEADERBOARD_TABLE = "sonique-leaderboard";
const USERS_TABLE = "sonique-users";

export const handler = async (event: AppSyncEvent) => {
  const { category, coins } = event.arguments;
  const userId = event.identity.sub;
  const timestamp = new Date().toISOString();

  try {
      // Input validation
      if (!category || !coins) {
          throw new Error('Missing required parameters');
      }

      const transactItems = [{
          Update: {
              TableName: LEADERBOARD_TABLE,
              Key: { 
                  userId,
                  category 
              },
              UpdateExpression: 'SET progress = if_not_exists(progress, :zero) + :inc, ' +
                              'coins = if_not_exists(coins, :zero) + :coins, ' +
                              'updatedAt = :timestamp',
              ExpressionAttributeValues: {
                  ':inc': 1,
                  ':coins': coins,
                  ':timestamp': timestamp,
                  ':zero': 0
              }
          }
      }];

      await dynamoDB.transactWrite({ TransactItems: transactItems }).promise();
      return true;

  } catch (error) {
      console.error('Error:', error);
      if ((error as TransactionCanceledException).name === 'TransactionCanceledException') {
          throw new Error('Transaction failed - please try again');
      }
      throw error;
  }
};

