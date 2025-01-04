export interface BedrockResponse {
  completion: string;
  stop_reason: string;
  stop: string;
}

export interface PuzzleGenerationResponse {
  originalText: string;
  scrambledText: string;
  hint: string;
}