// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var INITIAL_ELO = 1500;
var MemStorage = class {
  playersMap;
  matchesMap;
  partnershipsMap;
  playerIdCounter;
  matchIdCounter;
  partnershipIdCounter;
  constructor() {
    this.playersMap = /* @__PURE__ */ new Map();
    this.matchesMap = /* @__PURE__ */ new Map();
    this.partnershipsMap = /* @__PURE__ */ new Map();
    this.playerIdCounter = 1;
    this.matchIdCounter = 1;
    this.partnershipIdCounter = 1;
    this.initializeSampleData();
  }
  // Initialize sample data for development/testing
  async initializeSampleData() {
    if (this.playersMap.size === 0) {
      const initialPlayers = [
        { name: "Obi", active: true, elo: INITIAL_ELO },
        { name: "Jack", active: true, elo: INITIAL_ELO },
        { name: "Marvin", active: true, elo: INITIAL_ELO },
        { name: "James", active: true, elo: INITIAL_ELO },
        { name: "Dallas", active: true, elo: INITIAL_ELO },
        { name: "Dylan", active: true, elo: INITIAL_ELO },
        { name: "Nick", active: true, elo: INITIAL_ELO },
        { name: "Remi", active: true, elo: INITIAL_ELO },
        { name: "Alex", active: true, elo: INITIAL_ELO }
      ];
      for (const player of initialPlayers) {
        await this.createPlayer(player);
      }
      if (this.matchesMap.size === 0) {
        const initialMatches = [
          {
            date: "2025-03-24",
            playerA1: "Marvin",
            playerA2: "Obi",
            playerB1: "James",
            playerB2: "Jack",
            scoreA: 2,
            scoreB: 6,
            eloChangeA1: -10,
            eloChangeA2: -10,
            eloChangeB1: 10,
            eloChangeB2: 10
          },
          {
            date: "2025-03-24",
            playerA1: "Jack",
            playerA2: "Obi",
            playerB1: "Marvin",
            playerB2: "James",
            scoreA: 6,
            scoreB: 4,
            eloChangeA1: 8,
            eloChangeA2: 8,
            eloChangeB1: -8,
            eloChangeB2: -8
          },
          {
            date: "2025-03-24",
            playerA1: "Jack",
            playerA2: "Marvin",
            playerB1: "James",
            playerB2: "Obi",
            scoreA: 6,
            scoreB: 1,
            eloChangeA1: 12,
            eloChangeA2: 12,
            eloChangeB1: -12,
            eloChangeB2: -12
          }
        ];
        for (const match of initialMatches) {
          await this.createMatch(match);
        }
        await this.calculateStats();
      }
    }
  }
  // Player operations
  async getPlayer(id) {
    return this.playersMap.get(id);
  }
  async getAllPlayers() {
    return Array.from(this.playersMap.values());
  }
  async createPlayer(insertPlayer) {
    const id = this.playerIdCounter++;
    const player = {
      id,
      name: insertPlayer.name,
      active: insertPlayer.active ?? true,
      elo: insertPlayer.elo ?? 1500,
      wins: null,
      losses: null,
      gamesPlayed: null,
      pointsFor: null,
      pointsAgainst: null,
      pointDiff: null,
      winPercentage: null,
      powerRanking: null
    };
    this.playersMap.set(id, player);
    return player;
  }
  async updatePlayer(id, updateData) {
    const player = this.playersMap.get(id);
    if (!player) {
      return void 0;
    }
    const updatedPlayer = { ...player, ...updateData };
    this.playersMap.set(id, updatedPlayer);
    return updatedPlayer;
  }
  // Match operations
  async getMatch(id) {
    return this.matchesMap.get(id);
  }
  async getAllMatches() {
    return Array.from(this.matchesMap.values());
  }
  async createMatch(insertMatch) {
    const id = this.matchIdCounter++;
    const match = { id, ...insertMatch };
    this.matchesMap.set(id, match);
    const playerA1 = await this.getPlayerByName(insertMatch.playerA1);
    const playerA2 = await this.getPlayerByName(insertMatch.playerA2);
    const playerB1 = await this.getPlayerByName(insertMatch.playerB1);
    const playerB2 = await this.getPlayerByName(insertMatch.playerB2);
    if (playerA1) {
      const updatedElo = (playerA1.elo || INITIAL_ELO) + insertMatch.eloChangeA1;
      await this.updatePlayer(playerA1.id, { elo: updatedElo });
    }
    if (playerA2) {
      const updatedElo = (playerA2.elo || INITIAL_ELO) + insertMatch.eloChangeA2;
      await this.updatePlayer(playerA2.id, { elo: updatedElo });
    }
    if (playerB1) {
      const updatedElo = (playerB1.elo || INITIAL_ELO) + insertMatch.eloChangeB1;
      await this.updatePlayer(playerB1.id, { elo: updatedElo });
    }
    if (playerB2) {
      const updatedElo = (playerB2.elo || INITIAL_ELO) + insertMatch.eloChangeB2;
      await this.updatePlayer(playerB2.id, { elo: updatedElo });
    }
    await this.calculateStats();
    return match;
  }
  // Partnership operations
  async getPartnership(id) {
    return this.partnershipsMap.get(id);
  }
  async getAllPartnerships() {
    return Array.from(this.partnershipsMap.values());
  }
  async createPartnership(insertPartnership) {
    const id = this.partnershipIdCounter++;
    const partnership = {
      id,
      partnershipId: insertPartnership.partnershipId,
      player1: insertPartnership.player1,
      player2: insertPartnership.player2,
      elo: insertPartnership.elo ?? INITIAL_ELO,
      wins: insertPartnership.wins ?? 0,
      losses: insertPartnership.losses ?? 0,
      gamesPlayed: insertPartnership.gamesPlayed ?? 0,
      pointsFor: insertPartnership.pointsFor ?? 0,
      pointsAgainst: insertPartnership.pointsAgainst ?? 0,
      pointDiff: insertPartnership.pointDiff ?? 0,
      winPercentage: insertPartnership.winPercentage ?? null,
      chemistryRating: insertPartnership.chemistryRating ?? null
    };
    this.partnershipsMap.set(insertPartnership.partnershipId, partnership);
    return partnership;
  }
  async updatePartnership(id, updateData) {
    const partnership = this.partnershipsMap.get(id);
    if (!partnership) {
      return void 0;
    }
    const updatedPartnership = { ...partnership, ...updateData };
    this.partnershipsMap.set(id, updatedPartnership);
    return updatedPartnership;
  }
  // Tournament feature has been removed
  // Helper method to get player by name
  async getPlayerByName(name) {
    const players2 = await this.getAllPlayers();
    return players2.find((p) => p.name === name);
  }
  // Helper to calculate ELO changes
  calculateELO(teamA, teamB, scoreA, scoreB, players2) {
    const playerA1 = players2.find((p) => p.name === teamA[0]);
    const playerA2 = players2.find((p) => p.name === teamA[1]);
    const playerB1 = players2.find((p) => p.name === teamB[0]);
    const playerB2 = players2.find((p) => p.name === teamB[1]);
    if (!playerA1 || !playerA2 || !playerB1 || !playerB2) return null;
    const teamAElo = ((playerA1.elo || INITIAL_ELO) + (playerA2.elo || INITIAL_ELO)) / 2;
    const teamBElo = ((playerB1.elo || INITIAL_ELO) + (playerB2.elo || INITIAL_ELO)) / 2;
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;
    const actualA = scoreA > scoreB ? 1 : 0;
    const actualB = scoreB > scoreA ? 1 : 0;
    const scoreDiff = Math.abs(scoreA - scoreB);
    const movMultiplier = Math.min(1.5, 1 + scoreDiff / 12);
    const K_FACTOR = 20;
    const eloChangeA = Math.round(K_FACTOR * movMultiplier * (actualA - expectedA));
    const eloChangeB = Math.round(K_FACTOR * movMultiplier * (actualB - expectedB));
    return { eloChangeA, eloChangeB };
  }
  // Calculate all statistics for players and partnerships
  async calculateStats() {
    const players2 = await this.getAllPlayers();
    const matches2 = await this.getAllMatches();
    for (const player of players2) {
      player.gamesPlayed = null;
      player.wins = null;
      player.losses = null;
      player.pointsFor = null;
      player.pointsAgainst = null;
      player.pointDiff = null;
      player.winPercentage = null;
      player.powerRanking = null;
      await this.updatePlayer(player.id, player);
    }
    this.partnershipsMap.clear();
    const partnershipMap = {};
    for (const match of matches2) {
      const playerA1 = players2.find((p) => p.name === match.playerA1);
      const playerA2 = players2.find((p) => p.name === match.playerA2);
      const playerB1 = players2.find((p) => p.name === match.playerB1);
      const playerB2 = players2.find((p) => p.name === match.playerB2);
      if (playerA1) {
        playerA1.gamesPlayed = (playerA1.gamesPlayed || 0) + 1;
        playerA1.pointsFor = (playerA1.pointsFor || 0) + match.scoreA;
        playerA1.pointsAgainst = (playerA1.pointsAgainst || 0) + match.scoreB;
        if (match.scoreA > match.scoreB) {
          playerA1.wins = (playerA1.wins || 0) + 1;
        } else {
          playerA1.losses = (playerA1.losses || 0) + 1;
        }
        await this.updatePlayer(playerA1.id, playerA1);
      }
      if (playerA2) {
        playerA2.gamesPlayed = (playerA2.gamesPlayed || 0) + 1;
        playerA2.pointsFor = (playerA2.pointsFor || 0) + match.scoreA;
        playerA2.pointsAgainst = (playerA2.pointsAgainst || 0) + match.scoreB;
        if (match.scoreA > match.scoreB) {
          playerA2.wins = (playerA2.wins || 0) + 1;
        } else {
          playerA2.losses = (playerA2.losses || 0) + 1;
        }
        await this.updatePlayer(playerA2.id, playerA2);
      }
      if (playerB1) {
        playerB1.gamesPlayed = (playerB1.gamesPlayed || 0) + 1;
        playerB1.pointsFor = (playerB1.pointsFor || 0) + match.scoreB;
        playerB1.pointsAgainst = (playerB1.pointsAgainst || 0) + match.scoreA;
        if (match.scoreB > match.scoreA) {
          playerB1.wins = (playerB1.wins || 0) + 1;
        } else {
          playerB1.losses = (playerB1.losses || 0) + 1;
        }
        await this.updatePlayer(playerB1.id, playerB1);
      }
      if (playerB2) {
        playerB2.gamesPlayed = (playerB2.gamesPlayed || 0) + 1;
        playerB2.pointsFor = (playerB2.pointsFor || 0) + match.scoreB;
        playerB2.pointsAgainst = (playerB2.pointsAgainst || 0) + match.scoreA;
        if (match.scoreB > match.scoreA) {
          playerB2.wins = (playerB2.wins || 0) + 1;
        } else {
          playerB2.losses = (playerB2.losses || 0) + 1;
        }
        await this.updatePlayer(playerB2.id, playerB2);
      }
      const playerAPair = [match.playerA1, match.playerA2].sort();
      const partnershipIdA = playerAPair.join("-");
      if (!partnershipMap[partnershipIdA]) {
        partnershipMap[partnershipIdA] = {
          partnershipId: partnershipIdA,
          player1: playerAPair[0],
          player2: playerAPair[1],
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDiff: 0,
          winPercentage: "0.00",
          chemistryRating: "0.00",
          elo: INITIAL_ELO
        };
      }
      partnershipMap[partnershipIdA].gamesPlayed++;
      partnershipMap[partnershipIdA].pointsFor += match.scoreA;
      partnershipMap[partnershipIdA].pointsAgainst += match.scoreB;
      if (match.scoreA > match.scoreB) {
        partnershipMap[partnershipIdA].wins++;
      } else {
        partnershipMap[partnershipIdA].losses++;
      }
      const playerBPair = [match.playerB1, match.playerB2].sort();
      const partnershipIdB = playerBPair.join("-");
      if (!partnershipMap[partnershipIdB]) {
        partnershipMap[partnershipIdB] = {
          partnershipId: partnershipIdB,
          player1: playerBPair[0],
          player2: playerBPair[1],
          gamesPlayed: 0,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDiff: 0,
          winPercentage: "0.00",
          chemistryRating: "0.00",
          elo: INITIAL_ELO
        };
      }
      partnershipMap[partnershipIdB].gamesPlayed++;
      partnershipMap[partnershipIdB].pointsFor += match.scoreB;
      partnershipMap[partnershipIdB].pointsAgainst += match.scoreA;
      if (match.scoreB > match.scoreA) {
        partnershipMap[partnershipIdB].wins++;
      } else {
        partnershipMap[partnershipIdB].losses++;
      }
    }
    for (const player of players2) {
      player.pointDiff = (player.pointsFor || 0) - (player.pointsAgainst || 0);
      if (player.gamesPlayed && player.gamesPlayed > 0) {
        player.winPercentage = ((player.wins || 0) / player.gamesPlayed * 100).toFixed(2);
      } else {
        player.winPercentage = "0.00";
      }
      const eloFactor = ((player.elo || INITIAL_ELO) - INITIAL_ELO) * 0.3;
      const pointDiffFactor = (player.pointDiff || 0) * 4;
      const winPercentageFactor = parseFloat(player.winPercentage || "0") * 0.1;
      player.powerRanking = Math.round(eloFactor + pointDiffFactor + winPercentageFactor);
      await this.updatePlayer(player.id, player);
    }
    for (const [partnershipId, partnership] of Object.entries(partnershipMap)) {
      partnership.pointDiff = partnership.pointsFor - partnership.pointsAgainst;
      if (partnership.gamesPlayed > 0) {
        partnership.winPercentage = (partnership.wins / partnership.gamesPlayed * 100).toFixed(2);
      }
      const player1 = players2.find((p) => p.name === partnership.player1);
      const player2 = players2.find((p) => p.name === partnership.player2);
      if (player1 && player2) {
        const avgElo = ((player1.elo || INITIAL_ELO) + (player2.elo || INITIAL_ELO)) / 2;
        const expectedWinPct = 50;
        const actualWinPct = parseFloat(partnership.winPercentage);
        const chemistryFactor = 100 + (actualWinPct - expectedWinPct) * 0.5 + partnership.pointDiff * 2;
        const sampleSizeFactor = partnership.gamesPlayed >= 3 ? 1 : 0.5 + partnership.gamesPlayed * 0.2;
        partnership.chemistryRating = (chemistryFactor * sampleSizeFactor).toFixed(1);
      }
      await this.createPartnership(partnership);
    }
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  elo: integer("elo").notNull().default(1500),
  wins: integer("wins"),
  losses: integer("losses"),
  gamesPlayed: integer("games_played"),
  pointsFor: integer("points_for"),
  pointsAgainst: integer("points_against"),
  pointDiff: integer("point_diff"),
  winPercentage: text("win_percentage"),
  powerRanking: integer("power_ranking")
});
var insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  active: true,
  elo: true
});
var matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  playerA1: text("player_a1").notNull(),
  playerA2: text("player_a2").notNull(),
  playerB1: text("player_b1").notNull(),
  playerB2: text("player_b2").notNull(),
  scoreA: integer("score_a").notNull(),
  scoreB: integer("score_b").notNull(),
  eloChangeA1: integer("elo_change_a1").notNull(),
  eloChangeA2: integer("elo_change_a2").notNull(),
  eloChangeB1: integer("elo_change_b1").notNull(),
  eloChangeB2: integer("elo_change_b2").notNull()
});
var insertMatchSchema = createInsertSchema(matches).pick({
  date: true,
  playerA1: true,
  playerA2: true,
  playerB1: true,
  playerB2: true,
  scoreA: true,
  scoreB: true,
  eloChangeA1: true,
  eloChangeA2: true,
  eloChangeB1: true,
  eloChangeB2: true
});
var partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  partnershipId: text("partnership_id").notNull().unique(),
  player1: text("player1").notNull(),
  player2: text("player2").notNull(),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  pointsFor: integer("points_for").notNull().default(0),
  pointsAgainst: integer("points_against").notNull().default(0),
  pointDiff: integer("point_diff").notNull().default(0),
  winPercentage: text("win_percentage"),
  chemistryRating: text("chemistry_rating"),
  elo: integer("elo").notNull().default(1500)
});
var insertPartnershipSchema = createInsertSchema(partnerships).pick({
  partnershipId: true,
  player1: true,
  player2: true,
  gamesPlayed: true,
  wins: true,
  losses: true,
  pointsFor: true,
  pointsAgainst: true,
  pointDiff: true,
  winPercentage: true,
  chemistryRating: true,
  elo: true
});

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/players", async (req, res) => {
    try {
      const players2 = await storage.getAllPlayers();
      res.json(players2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });
  app2.get("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });
  app2.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.status(201).json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create player" });
    }
  });
  app2.patch("/api/players/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const playerData = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(id, playerData);
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid player data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update player" });
    }
  });
  app2.get("/api/matches", async (req, res) => {
    try {
      const matches2 = await storage.getAllMatches();
      res.json(matches2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });
  app2.get("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });
  app2.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid match data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create match" });
    }
  });
  app2.get("/api/partnerships", async (req, res) => {
    try {
      const partnerships2 = await storage.getAllPartnerships();
      res.json(partnerships2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch partnerships" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    console.error("Server error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  });
  const distPath = path.join(__dirname, "../dist/public");
  console.log("Serving static files from:", distPath);
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  const port = process.env.PORT || 3e3;
  server.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV || "development"} mode`);
  });
})();
