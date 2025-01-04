"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
var config_1 = require("./config");
// Create sonique-leaderboard table
var createLeaderboardTable = new client_dynamodb_1.CreateTableCommand({
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
var createUsersTable = new client_dynamodb_1.CreateTableCommand({
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
var createPuzzlesTable = new client_dynamodb_1.CreateTableCommand({
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
var createUserProgressTable = new client_dynamodb_1.CreateTableCommand({
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
function createTables() {
    return __awaiter(this, void 0, void 0, function () {
        var dynamoDb, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, (0, config_1.getDynamoDb)()];
                case 1:
                    dynamoDb = _a.sent();
                    return [4 /*yield*/, dynamoDb.send(createLeaderboardTable)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, dynamoDb.send(createUsersTable)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, dynamoDb.send(createPuzzlesTable)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, dynamoDb.send(createUserProgressTable)];
                case 5:
                    _a.sent();
                    console.log("Tables created successfully");
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error("Error creating tables:", error_1);
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
createTables();
