// src/services/aws/puzzleService.js
import { DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from './config';

const docClient = DynamoDBDocumentClient.from(dynamoDb);

export const puzzleService = {
    async getPuzzle(puzzleId) {
        const command = new GetCommand({
            TableName: "sonique-puzzles",
            Key: { puzzleId }
        });
        
        const response = await docClient.send(command);
        return response.Item;
    },

    async getPuzzlesByTopic(topic) {
        const command = new QueryCommand({
            TableName: "sonique-puzzles",
            IndexName: "topic-index",
            KeyConditionExpression: "topic = :topic",
            ExpressionAttributeValues: {
                ":topic": topic
            }
        });

        const response = await docClient.send(command);
        return response.Items;
    }
};
