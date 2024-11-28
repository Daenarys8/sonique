import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";


const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: fromNodeProviderChain(),
});

interface PuzzleResponse {
  question: string;
  answer: string;
}

export const generatePuzzle = async (category: string, difficulty: string): Promise<PuzzleResponse> => {
  const prompt = `Generate a ${difficulty} difficulty puzzle for the category ${category}. 
    The puzzle should be challenging but solvable, and related to ${category}.
    Format the response as a JSON object with "question" and "answer" fields.`;

  const payload = {
    prompt: prompt,
    max_tokens: 500,
    temperature: 0.7,
  };

  try {
    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      body: JSON.stringify(payload),
      contentType: "application/json",
    });

    const response = await bedrockClient.send(command);
    const rawResponse = new TextDecoder().decode(response.body);
    const claudeResponse = JSON.parse(rawResponse);
    
    if (claudeResponse.completion) {
      try {
        // First try to extract JSON from the completion
        const jsonMatch = claudeResponse.completion.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedContent = JSON.parse(jsonMatch[0]);
          if (parsedContent.question && parsedContent.answer) {
            return {
              question: parsedContent.question,
              answer: parsedContent.answer
            };
          }
        }
        
        // Fallback: treat the completion as direct response
        const directParsed = JSON.parse(claudeResponse.completion);
        if (directParsed.question && directParsed.answer) {
          return {
            question: directParsed.question,
            answer: directParsed.answer
          };
        }
      } catch (e) {
        console.error("Failed to parse Claude's response:", e);
      }
    }
    
    throw new Error("Invalid puzzle response format from Claude");
  } catch (error) {
    console.error("Error generating puzzle:", error);
    throw new Error("Failed to generate puzzle");
  }
};