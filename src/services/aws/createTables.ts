import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { getDynamoDb } from './config';

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

// Enhanced sonique-users table with additional attributes
const createUsersTable = new CreateTableCommand({
  TableName: "sonique-users",
  AttributeDefinitions: [
    { AttributeName: "username", AttributeType: "S" },
    { AttributeName: "email", AttributeType: "S" }
  ],
  KeySchema: [
    { AttributeName: "username", KeyType: "HASH" }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "email-index",
      KeySchema: [
        { AttributeName: "email", KeyType: "HASH" }
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

// Enhanced sonique-puzzles table with additional attributes
const createPuzzlesTable = new CreateTableCommand({
  TableName: "sonique-puzzles",
  AttributeDefinitions: [
    { AttributeName: "puzzleId", AttributeType: "S" },
    { AttributeName: "category", AttributeType: "S" },
    { AttributeName: "difficulty", AttributeType: "N" }
  ],
  KeySchema: [
    { AttributeName: "puzzleId", KeyType: "HASH" }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "category-index",
      KeySchema: [
        { AttributeName: "category", KeyType: "HASH" },
        { AttributeName: "difficulty", KeyType: "RANGE" }
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

// Create user-progress table (new)
const createUserProgressTable = new CreateTableCommand({
  TableName: "sonique-user-progress",
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

// Function to create all tables
async function createTables() {
  try {
    const dynamoDb = await getDynamoDb(); // Get authenticated client
    await dynamoDb.send(createLeaderboardTable);
    await dynamoDb.send(createUsersTable);
    await dynamoDb.send(createPuzzlesTable);
    await dynamoDb.send(createUserProgressTable);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

createTables();
