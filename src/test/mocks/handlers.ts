import { rest } from 'msw';
import { API_ENDPOINT } from '../../config/constants';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_ENDPOINT}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-token',
        user: {
          id: '1',
          username: 'testuser'
        }
      })
    );
  }),

  // User endpoints
  rest.get(`${API_ENDPOINT}/users/me`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        stats: {
          totalCoins: 100,
          completedPuzzles: 5
        }
      })
    );
  }),

  // Game endpoints
  rest.get(`${API_ENDPOINT}/categories`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          id: '1',
          name: 'Test Category',
          description: 'Test description',
          difficulty: 'medium',
          totalPuzzles: 10,
          progress: 5
        }
      ])
    );
  })
];