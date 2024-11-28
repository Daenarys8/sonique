// src/services/aws/leaderboardService.js
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from './config';

const docClient = DynamoDBDocumentClient.from(dynamoDb);

export const leaderboardService = {
    async submitScore(username, score) {
        const command = new PutCommand({
            TableName: "sonique-leaderboard",
            Item: {
                username,
                score,
                timestamp: new Date().toISOString()
            }
        });
        
        await docClient.send(command);
    },

    async getTopScores(limit = 10) {
        const command = new QueryCommand({
            TableName: "sonique-leaderboard",
            IndexName: "score-index",
            ScanIndexForward: false, // descending order
            Limit: limit
        });

        const response = await docClient.send(command);
        return response.Items;
    }
};
