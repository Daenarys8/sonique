// bedrockService.ts
import { PuzzleGenerationResponse } from '../../types/bedrock.ts';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

export const bedrockService = {
  generatePuzzle: async (prompt: string, maxRetries: number = 2): Promise<PuzzleGenerationResponse> => {
    console.log('Generating puzzle with prompt:', prompt);
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt + 1} of ${maxRetries + 1}`);
        console.time(`API call ${attempt + 1}`);

        const response = await fetch(`${API_ENDPOINT}/puzzle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt,
            category: prompt.toLowerCase().includes('category:') 
              ? prompt.split('category:')[1].trim().split(' ')[0].toLowerCase()
              : 'general'
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.timeEnd(`API call ${attempt + 1}`);

        return {
          originalText: data.originalText,
          scrambledText: data.scrambledText,
          hint: data.hint
        };

      } catch (error) {
        console.timeEnd(`API call ${attempt + 1}`);
        console.error(`Attempt ${attempt + 1} failed:`, error);
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${backoffTime}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffTime));
          continue;
        }
      }
    }
    
    console.error('All attempts failed. Last error:', lastError);
    throw lastError || new Error('Failed to generate puzzle after all retry attempts.');
  }
};
