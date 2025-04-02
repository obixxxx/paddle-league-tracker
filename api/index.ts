import express from 'express';
import { storage } from '../server/storage';
import { handleFirebaseError } from '../client/src/lib/firebase';
import { error as logError } from '../client/src/lib/logger';

const app = express();

// Middleware
app.use(express.json());

// API Routes
app.get('/api/players', async (req, res) => {
  try {
    const players = await storage.getAllPlayers();
    res.json(players);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching players:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const player = await storage.createPlayer(req.body);
    res.status(201).json(player);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error creating player:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/matches', async (req, res) => {
  try {
    const matches = await storage.getAllMatches();
    res.json(matches);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching matches:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/matches', async (req, res) => {
  try {
    const match = await storage.createMatch(req.body);
    await storage.calculateStats();
    res.status(201).json(match);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error creating match:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/partnerships', async (req, res) => {
  try {
    const partnerships = await storage.getAllPartnerships();
    res.json(partnerships);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching partnerships:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/tournaments', async (req, res) => {
  try {
    const tournaments = await storage.getAllTournaments();
    res.json(tournaments);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching tournaments:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/tournaments', async (req, res) => {
  try {
    const tournament = await storage.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error creating tournament:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/tournaments/:id/teams', async (req, res) => {
  try {
    const teams = await storage.getTournamentTeamsByTournament(parseInt(req.params.id));
    res.json(teams);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching tournament teams:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/tournaments/:id/teams', async (req, res) => {
  try {
    const team = await storage.createTournamentTeam({
      ...req.body,
      tournamentId: parseInt(req.params.id)
    });
    res.status(201).json(team);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error creating tournament team:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/api/tournaments/:id/brackets/generate', async (req, res) => {
  try {
    const brackets = await storage.generateTournamentBrackets(parseInt(req.params.id));
    res.status(201).json(brackets);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error generating tournament brackets:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/tournaments/:id/brackets', async (req, res) => {
  try {
    const brackets = await storage.getBracketsByTournament(parseInt(req.params.id));
    res.json(brackets);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error fetching tournament brackets:', error);
    res.status(500).json({ error: errorMessage });
  }
});

app.patch('/api/brackets/:id', async (req, res) => {
  try {
    const bracket = await storage.updateBracket(parseInt(req.params.id), req.body);
    res.json(bracket);
  } catch (error) {
    const errorMessage = handleFirebaseError(error);
    logError('Error updating bracket:', error);
    res.status(500).json({ error: errorMessage });
  }
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logError('Server error:', err);
  res.status(500).json({ error: err.message || 'Something went wrong on the server' });
});

// Export the Express app as a Vercel serverless function
export default app;