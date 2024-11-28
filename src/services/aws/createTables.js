// Importing necessary AWS SDK modules
import { CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { dynamoDb } from './config.js'; // Assumed config file with DynamoDB client setup

// Create sonique-leaderboard table
const createLeaderboardTable = new CreateTableCommand({
    TableName: "sonique-leaderboard",
    AttributeDefinitions: [
        { AttributeName: "username", AttributeType: "S" },
        { AttributeName: "score", AttributeType: "N" }
    ],
    KeySchema: [
        { AttributeName: "username", KeyType: "HASH" }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: "score-index",
            KeySchema: [
                { AttributeName: "score", KeyType: "HASH" }
            ],
            Projection: {
                ProjectionType: "ALL"
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
});

// Create sonique-users table
const createUsersTable = new CreateTableCommand({
    TableName: "sonique-users",
    AttributeDefinitions: [
        { AttributeName: "username", AttributeType: "S" }
    ],
    KeySchema: [
        { AttributeName: "username", KeyType: "HASH" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
});

// Create sonique-puzzles table
const createPuzzlesTable = new CreateTableCommand({
    TableName: "sonique-puzzles",
    AttributeDefinitions: [
        { AttributeName: "puzzleId", AttributeType: "S" }
    ],
    KeySchema: [
        { AttributeName: "puzzleId", KeyType: "HASH" }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    }
});

// Function to create all tables
async function createTables() {
    try {
        await dynamoDb.send(createLeaderboardTable);
        console.log("Leaderboard table created successfully.");
        await dynamoDb.send(createUsersTable);
        console.log("Users table created successfully.");
        await dynamoDb.send(createPuzzlesTable);
        console.log("Puzzles table created successfully.");
    } catch (error) {
        console.error("Error creating tables:", error);
        throw error;
    }
}

createTables();
