import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { dynamoDb, bedrock } from './config';
import type { Puzzle } from '../../types/puzzle';
import { scrambleWords, scrambleEquation } from '../../utils/puzzleUtils';

export async function getPuzzle(category: string): Promise<Puzzle> {
  try {
    // First try to get from DynamoDB
    const { Item } = await dynamoDb.send(
      new GetCommand({
        TableName: 'sonique-puzzles',
        Key: {
          category,
          id: Math.floor(Math.random() * 100).toString(),
        },
      })
    );

    if (Item) {
      const puzzle = Item as Puzzle;
      puzzle.scrambled = category === 'math' 
        ? scrambleEquation(puzzle.content)
        : scrambleWords(puzzle.content);
      return puzzle;
    }

    // If no puzzle found, generate one using Bedrock
    const prompt = `Generate a ${category} puzzle suitable for an educational game.`;
    
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: 'anthropic.claude-v2',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt,
          max_tokens: 100,
        }),
      })
    );

    const generatedPuzzle: Puzzle = {
      id: Date.now().toString(),
      category,
      content: JSON.parse(new TextDecoder().decode(response.body)).completion,
      scrambled: '',
      hint: 'AI-generated puzzle',
      difficulty: 2,
      timeLimit: 60,
    };

    generatedPuzzle.scrambled = category === 'math'
      ? scrambleEquation(generatedPuzzle.content)
      : scrambleWords(generatedPuzzle.content);

    // Store the generated puzzle in DynamoDB for future use
    await dynamoDb.send(
      new PutCommand({
        TableName: 'sonique-puzzles',
        Item: generatedPuzzle,
      })
    );

    return generatedPuzzle;
  } catch (error) {
    console.error('Error getting puzzle:', error);
    throw error;
  }
}