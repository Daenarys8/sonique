import { DynamoDB } from 'aws-sdk';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const dynamoDB = new DynamoDB.DocumentClient();
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });
const PUZZLES_TABLE = "sonique-puzzles";

interface PuzzleQuestion {
  content: string;
  options: string[];
  hint?: string;
  difficulty: number;
  correctAnswer: string;
  explanation: string;
}

interface PuzzleResponse {
  generatePuzzles: {
    questions: PuzzleQuestion[];
  }
}

class PuzzleGenerationError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'PuzzleGenerationError';
  }
}

class PuzzleValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PuzzleValidationError';
  }
}

class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

exports.handler = async (event: any): Promise<PuzzleResponse> => {
  try {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const category = event.arguments?.category;
    
    if (!category) {
      throw new PuzzleGenerationError('Category is required');
    }
    
    console.log('Category:', category);
    
    const prompt = `Generate 5 trivia questions in the category: ${category}.
    Requirements:
    - Questions should increase in difficulty from 1 (easiest) to 5 (hardest)
    - Each question must have exactly 4 options labeled A, B, C, D
    - Ensure only ONE option is correct for each question
    - Make incorrect options plausible and interesting
    - Include fascinating facts in the questions
    - Add a brief explanation for each correct answer
    - Earlier questions (1) should be basic knowledge
    - Middle questions (2-3) should require good subject knowledge
    - Later questions (4-5) should challenge even experts
    
    Return ONLY a JSON array with 5 objects, each having these exact fields:
    {
      "content": "question text here",
      "options": [
        "A) first option",
        "B) second option",
        "C) third option",
        "D) fourth option"
      ],
      "hint": "helpful hint",
      "difficulty": number matching the question's position (1-5),
      "correctAnswer": "exact text of correct option including letter prefix",
      "explanation": "why this is the correct answer"
    }

    Ensure questions are properly ordered by difficulty from 1 to 5.`;

    console.log('Sending request to Bedrock');
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 2000, // Increased for multiple questions
        temperature: 0.8,
        top_p: 1
      })
    })).catch(error => {
      throw new PuzzleGenerationError('Failed to generate puzzles from AI', error);
    });

    console.log('Bedrock response received');
    let responseBody;
    try {
      responseBody = JSON.parse(new TextDecoder().decode(response.body));
      console.log('Response body:', responseBody);
    } catch (error) {
      throw new PuzzleGenerationError('Failed to decode AI response', error);
    }

    let generatedPuzzles;
    try {
      const jsonMatch = responseBody.completion.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new PuzzleValidationError('No JSON array found in response');
      }
      generatedPuzzles = JSON.parse(jsonMatch[0]);
      console.log('Generated puzzles:', generatedPuzzles);
    } catch (error) {
      console.error('Failed to parse puzzles JSON:', responseBody.completion);
      throw new PuzzleGenerationError('Failed to parse puzzles response', error);
    }

    // Validate puzzles
    if (!Array.isArray(generatedPuzzles) || generatedPuzzles.length !== 5) {
      throw new PuzzleValidationError('Invalid response: must contain exactly 10 questions');
    }

    // Validate each puzzle and ensure correct difficulty order
    generatedPuzzles.forEach((puzzle, index) => {
      validatePuzzle(puzzle, index + 1);
    });

    // Store in DynamoDB
    const batchId = `${category}-${Date.now()}`;
    try {
      // Store puzzles in batches due to DynamoDB limits
      const batches = chunk(generatedPuzzles, 25);
      for (const batch of batches) {
        await dynamoDB.batchWrite({
          RequestItems: {
            [PUZZLES_TABLE]: batch.map((puzzle, index) => ({
              PutRequest: {
                Item: {
                  puzzleId: `${batchId}-${index + 1}`,
                  category,
                  ...puzzle,
                  createdAt: new Date().toISOString()
                }
              }
            }))
          }
        }).promise();
      }
    } catch (error) {
      throw new DatabaseError('Failed to store puzzles in database', error);
    }

    // Return formatted response
    return {
      generatePuzzles: {
        questions: generatedPuzzles.map(puzzle => ({
          content: puzzle.content.trim(),
          options: puzzle.options.map((opt: string) => opt.trim()),
          hint: puzzle.hint?.trim() || '',
          difficulty: puzzle.difficulty,
          correctAnswer: puzzle.correctAnswer.trim(),
          explanation: puzzle.explanation.trim()
        }))
      }
    };

  } catch (error) {
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown error',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    if (error instanceof PuzzleGenerationError || 
        error instanceof PuzzleValidationError || 
        error instanceof DatabaseError) {
      throw new Error(`Failed to generate puzzles: ${error.message}`);
    }

    throw new Error('An unexpected error occurred while generating the puzzles');
  }
};

function validatePuzzle(puzzle: any, expectedDifficulty: number) {
  if (!puzzle || typeof puzzle !== 'object') {
    throw new PuzzleValidationError('Invalid puzzle format: not an object');
  }

  if (!puzzle.content || typeof puzzle.content !== 'string') {
    throw new PuzzleValidationError(`Question ${expectedDifficulty}: missing or invalid content`);
  }

  if (!Array.isArray(puzzle.options) || puzzle.options.length !== 4) {
    throw new PuzzleValidationError(`Question ${expectedDifficulty}: must have exactly 4 options`);
  }

  if (!puzzle.options.every((option: string) => 
    typeof option === 'string' && 
    option.trim() && 
    option.match(/^[A-D]\)/)
  )) {
    throw new PuzzleValidationError(
      `Question ${expectedDifficulty}: options must be non-empty strings prefixed with A), B), C), or D)`
    );
  }

  if (puzzle.difficulty !== expectedDifficulty) {
    throw new PuzzleValidationError(
      `Question ${expectedDifficulty}: incorrect difficulty level (expected ${expectedDifficulty}, got ${puzzle.difficulty})`
    );
  }

  if (!puzzle.correctAnswer || !puzzle.options.includes(puzzle.correctAnswer)) {
    throw new PuzzleValidationError(
      `Question ${expectedDifficulty}: correctAnswer must match one of the options`
    );
  }

  if (!puzzle.explanation || typeof puzzle.explanation !== 'string') {
    throw new PuzzleValidationError(
      `Question ${expectedDifficulty}: missing or invalid explanation`
    );
  }
}

// Utility function to chunk array for batch processing
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}
