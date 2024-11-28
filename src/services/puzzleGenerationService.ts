import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export async function generatePuzzle(category: string) {
  const client = new BedrockRuntimeClient({ region: 'us-east-1' });
  
  try {
    const prompt = `Generate an engaging puzzle or riddle related to ${category}. 
    The puzzle should be educational and challenging but solvable. 
    Format the response as a JSON object with these fields:
    - question: the puzzle or riddle text
    - hint: a helpful hint that doesn't give away the answer
    - answer: the correct answer
    - explanation: brief explanation of the answer
    - difficulty: a number from 1-5`;

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      accept: "*/*",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        prompt: prompt,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        top_p: 0.9,
      })
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    
    return result;
  } catch (error) {
    console.error('Error generating puzzle:', error);
    throw new Error('Failed to generate puzzle');
  }
}