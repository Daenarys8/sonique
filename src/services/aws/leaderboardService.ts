import type { LeaderboardEntry } from '../../types/game';

// You might want to move this to a config file
const API_ENDPOINT = import.meta.env.VITE_APP_API_ENDPOINT || 'your-api-gateway-url';

export const leaderboardService = {
  getTopScores: getLeaderboard,
  submitScore: updateScore,
};

async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { Items } = await response.json();
    
    return (Items as LeaderboardEntry[]).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

async function updateScore(username: string, score: number, coins: number): Promise<void> {
  try {
    const response = await fetch(`${API_ENDPOINT}/update-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        score,
        coins
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error('Failed to update score');
    }
  } catch (error) {
    console.error('Error updating score:', error);
    throw error;
  }
}

// Add error types for better error handling
export class LeaderboardError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'LeaderboardError';
  }
}
