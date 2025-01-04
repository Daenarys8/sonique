// lambda/getLeaderboard/index.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient();
const LEADERBOARD_TABLE = "sonique-leaderboard";

interface LeaderboardQueryParams {
  limit?: number;
  startKey?: string;
  timeRange?: 'all' | 'daily' | 'weekly' | 'monthly';
}

interface TimeFilter {
  KeyConditionExpression?: string;
  ExpressionAttributeNames?: { [key: string]: string };
  ExpressionAttributeValues?: { [key: string]: any };
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
  };

  try {
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Parse query parameters
    const userParams: LeaderboardQueryParams = {
      limit: event.queryStringParameters?.limit ? 
        Math.min(parseInt(event.queryStringParameters.limit), 100) : 10,
      startKey: event.queryStringParameters?.startKey,
      timeRange: event.queryStringParameters?.timeRange as LeaderboardQueryParams['timeRange'] || 'all'
    };

    // Get current timestamp for time-based filtering
    const now = new Date();
    let timeFilter: TimeFilter = {};

    switch (userParams.timeRange) {
      case 'daily':
        const startOfDay = new Date(now.setHours(0,0,0,0)).toISOString();
        timeFilter = {
          KeyConditionExpression: '#timestamp >= :startTime',
          ExpressionAttributeNames: {
            '#timestamp': 'updatedAt'
          },
          ExpressionAttributeValues: {
            ':startTime': startOfDay
          }
        };
        break;
      case 'weekly':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).toISOString();
        timeFilter = {
          KeyConditionExpression: '#timestamp >= :startTime',
          ExpressionAttributeNames: {
            '#timestamp': 'updatedAt'
          },
          ExpressionAttributeValues: {
            ':startTime': startOfWeek
          }
        };
        break;
      case 'monthly':
        const startOfMonth = new Date(now.setDate(1)).toISOString();
        timeFilter = {
          KeyConditionExpression: '#timestamp >= :startTime',
          ExpressionAttributeNames: {
            '#timestamp': 'updatedAt'
          },
          ExpressionAttributeValues: {
            ':startTime': startOfMonth
          }
        };
        break;
    }

    // Query DynamoDB for top scores
    const dbQueryParams: DynamoDB.DocumentClient.QueryInput = {
      TableName: LEADERBOARD_TABLE,
      IndexName: 'score-index',
      KeyConditionExpression: 'score > :minScore',
      ExpressionAttributeValues: {
        ':minScore': 0,
        ...(timeFilter.ExpressionAttributeValues || {})
      },
      ExpressionAttributeNames: {
        ...(timeFilter.ExpressionAttributeNames || {})
      },
      Limit: userParams.limit,
      ScanIndexForward: false, // DESC order
      ...(userParams.startKey && { ExclusiveStartKey: JSON.parse(Buffer.from(userParams.startKey, 'base64').toString()) })
    };

    const result = await dynamoDB.query(dbQueryParams).promise();

    // Transform the results
    const items = result.Items?.map((item, index) => ({
      rank: index + 1,
      username: item.username,
      score: item.score,
      updatedAt: item.updatedAt,
      metadata: item.metadata || {}
    }));

    // Prepare pagination token
    const nextToken = result.LastEvaluatedKey 
      ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64')
      : null;

    // Get total count (optional - might want to cache this)
    const countParams = {
      TableName: LEADERBOARD_TABLE,
      Select: 'COUNT',
      ...(timeFilter.KeyConditionExpression && {
        KeyConditionExpression: timeFilter.KeyConditionExpression,
        ExpressionAttributeNames: timeFilter.ExpressionAttributeNames,
        ExpressionAttributeValues: timeFilter.ExpressionAttributeValues
      })
    };
    const { Count: totalPlayers } = await dynamoDB.scan(countParams).promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        items,
        pagination: {
          nextToken,
          limit: userParams.limit
        },
        metadata: {
          totalPlayers,
          timeRange: userParams.timeRange,
          lastUpdated: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    };
  }
};
