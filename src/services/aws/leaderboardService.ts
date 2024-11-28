import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from './config';
import type { LeaderboardEntry } from '../../types/game';

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const { Items } = await dynamoDb.send(
      new QueryCommand({
        TableName: 'sonique-leaderboard',
        IndexName: 'score-index',
        KeyConditionExpression: 'score > :minScore',
        ExpressionAttributeValues: {
          ':minScore': 0,
        },
        Limit: 10,
        ScanIndexForward: false,
      })
    );

    return (Items as LeaderboardEntry[]).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

export async function updateScore(username: string, score: number, coins: number): Promise<void> {
  try {
    await dynamoDb.send(
      new UpdateCommand({
        TableName: 'sonique-leaderboard',
        Key: { username },
        UpdateExpression: 'SET score = :score, coins = :coins',
        ExpressionAttributeValues: {
          ':score': score,
          ':coins': coins,
        },
      })
    );
  } catch (error) {
    console.error('Error updating score:', error);
    throw error;
  }
}