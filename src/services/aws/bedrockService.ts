import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";

const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1",
  credentials: fromNodeProviderChain(),
});

export const generatePuzzle = async (category: string, difficulty: string): Promise<string> => {
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
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody;
  } catch (error) {
    console.error("Error generating puzzle:", error);
    throw new Error("Failed to generate puzzle");
  }
};