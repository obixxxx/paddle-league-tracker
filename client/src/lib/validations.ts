import { z } from 'zod';

// Player validation schema
export const playerSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(30, { message: 'Name cannot exceed 30 characters' })
    .trim(),
  active: z.boolean().default(true),
});

// Match validation schema
export const matchSchema = z.object({
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be in YYYY-MM-DD format' }),
  playerA1: z.string()
    .min(1, { message: 'Player A1 is required' }),
  playerA2: z.string()
    .min(1, { message: 'Player A2 is required' }),
  playerB1: z.string()
    .min(1, { message: 'Player B1 is required' }),
  playerB2: z.string()
    .min(1, { message: 'Player B2 is required' }),
  scoreA: z.number()
    .int()
    .min(0, { message: 'Score cannot be negative' })
    .max(99, { message: 'Score is too high' }),
  scoreB: z.number()
    .int()
    .min(0, { message: 'Score cannot be negative' })
    .max(99, { message: 'Score is too high' }),
}).refine(
  (data) => data.playerA1 !== data.playerA2,
  {
    message: 'Team A cannot have the same player twice',
    path: ['playerA2'],
  }
).refine(
  (data) => data.playerB1 !== data.playerB2,
  {
    message: 'Team B cannot have the same player twice',
    path: ['playerB2'],
  }
).refine(
  (data) => !([data.playerA1, data.playerA2].includes(data.playerB1) || [data.playerA1, data.playerA2].includes(data.playerB2)),
  {
    message: 'A player cannot be on both teams',
    path: ['playerB1'],
  }
).refine(
  (data) => data.scoreA !== data.scoreB,
  {
    message: 'Scores cannot be equal (draws are not allowed)',
    path: ['scoreB'],
  }
);

// Tournament validation schema
export const tournamentSchema = z.object({
  name: z.string()
    .min(3, { message: 'Tournament name must be at least 3 characters' })
    .max(50, { message: 'Tournament name cannot exceed 50 characters' })
    .trim(),
  startDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Start date must be in YYYY-MM-DD format' }),
  endDate: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'End date must be in YYYY-MM-DD format' }),
  location: z.string()
    .min(2, { message: 'Location is required' })
    .max(100, { message: 'Location cannot exceed 100 characters' })
    .trim(),
  description: z.string().max(500, { message: 'Description is too long' }).optional(),
  format: z.enum(['single-elimination', 'double-elimination', 'round-robin'], {
    errorMap: () => ({ message: 'Please select a valid tournament format' }),
  }),
  maxTeams: z.number()
    .int()
    .min(4, { message: 'Tournament must allow at least 4 teams' })
    .max(64, { message: 'Tournament cannot exceed 64 teams' }),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  }
);