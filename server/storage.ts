import { 
  players, 
  matches, 
  partnerships,
  type Player, 
  type Match, 
  type Partnership,
  type InsertPlayer, 
  type InsertMatch, 
  type InsertPartnership
} from "@shared/schema";

// Initial ELO rating
const INITIAL_ELO = 1500;

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Player operations
  getPlayer(id: number): Promise<Player | undefined>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  
  // Match operations
  getMatch(id: number): Promise<Match | undefined>;
  getAllMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  
  // Partnership operations
  getPartnership(id: string): Promise<Partnership | undefined>;
  getAllPartnerships(): Promise<Partnership[]>;
  createPartnership(partnership: InsertPartnership): Promise<Partnership>;
  updatePartnership(id: string, partnership: Partial<InsertPartnership>): Promise<Partnership | undefined>;
  
  // Calculation helpers
  calculateStats(): Promise<void>;
}

export class MemStorage implements IStorage {
  private playersMap: Map<number, Player>;
  private matchesMap: Map<number, Match>;
  private partnershipsMap: Map<string, Partnership>;
  private playerIdCounter: number;
  private matchIdCounter: number;
  private partnershipIdCounter: number;

  constructor() {
    this.playersMap = new Map();
    this.matchesMap = new Map();
    this.partnershipsMap = new Map();
    this.playerIdCounter = 1;
    this.matchIdCounter = 1;
    this.partnershipIdCounter = 1;
    
    // Initialize with sample players if needed
    this.initializeSampleData();
  }

  // Initialize sample data for development/testing
  private async initializeSampleData() {
    // Only initialize if no data exists
    if (this.playersMap.size === 0) {
      const initialPlayers = [
        { name: 'Obi', active: true, elo: INITIAL_ELO },
        { name: 'Jack', active: true, elo: INITIAL_ELO },
        { name: 'Marvin', active: true, elo: INITIAL_ELO },
        { name: 'James', active: true, elo: INITIAL_ELO },
        { name: 'Dallas', active: true, elo: INITIAL_ELO },
        { name: 'Dylan', active: true, elo: INITIAL_ELO },
        { name: 'Nick', active: true, elo: INITIAL_ELO },
        { name: 'Remi', active: true, elo: INITIAL_ELO },
        { name: 'Alex', active: true, elo: INITIAL_ELO },
      ];
      
      // Create players
      for (const player of initialPlayers) {
        await this.createPlayer(player);
      }
      
      // Create some initial matches if needed
      if (this.matchesMap.size === 0) {
        const initialMatches = [
          { 
            date: '2025-03-24',
            playerA1: 'Marvin', 
            playerA2: 'Obi', 
            playerB1: 'James', 
            playerB2: 'Jack', 
            scoreA: 2, 
            scoreB: 6,
            eloChangeA1: -10,
            eloChangeA2: -10,
            eloChangeB1: 10,
            eloChangeB2: 10
          },
          { 
            date: '2025-03-24',
            playerA1: 'Jack', 
            playerA2: 'Obi', 
            playerB1: 'Marvin', 
            playerB2: 'James', 
            scoreA: 6, 
            scoreB: 4,
            eloChangeA1: 8,
            eloChangeA2: 8,
            eloChangeB1: -8,
            eloChangeB2: -8
          },
          { 
            date: '2025-03-24',
            playerA1: 'Jack', 
            playerA2: 'Marvin', 
            playerB1: 'James', 
            playerB2: 'Obi', 
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
        
        // Calculate stats after creating matches
        await this.calculateStats();
      }
    }
  }

  // Player operations
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.playersMap.get(id);
  }

  async getAllPlayers(): Promise<Player[]> {
    return Array.from(this.playersMap.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const player: Player = { 
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

  async updatePlayer(id: number, updateData: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.playersMap.get(id);
    if (!player) {
      return undefined;
    }
    
    const updatedPlayer: Player = { ...player, ...updateData };
    this.playersMap.set(id, updatedPlayer);
    return updatedPlayer;
  }

  // Match operations
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matchesMap.get(id);
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matchesMap.values());
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = this.matchIdCounter++;
    const match: Match = { id, ...insertMatch };
    this.matchesMap.set(id, match);
    
    // Update player ELO ratings
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
    
    // Recalculate stats
    await this.calculateStats();
    
    return match;
  }

  // Partnership operations
  async getPartnership(id: string): Promise<Partnership | undefined> {
    return this.partnershipsMap.get(id);
  }

  async getAllPartnerships(): Promise<Partnership[]> {
    return Array.from(this.partnershipsMap.values());
  }

  async createPartnership(insertPartnership: InsertPartnership): Promise<Partnership> {
    const id = this.partnershipIdCounter++;
    const partnership: Partnership = { 
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

  async updatePartnership(id: string, updateData: Partial<InsertPartnership>): Promise<Partnership | undefined> {
    const partnership = this.partnershipsMap.get(id);
    if (!partnership) {
      return undefined;
    }
    
    const updatedPartnership: Partnership = { ...partnership, ...updateData };
    this.partnershipsMap.set(id, updatedPartnership);
    return updatedPartnership;
  }

  // Tournament feature has been removed

  // Helper method to get player by name
  private async getPlayerByName(name: string): Promise<Player | undefined> {
    const players = await this.getAllPlayers();
    return players.find(p => p.name === name);
  }

  // Helper to calculate ELO changes
  private calculateELO(
    teamA: string[],
    teamB: string[],
    scoreA: number,
    scoreB: number,
    players: Player[]
  ): { eloChangeA: number, eloChangeB: number } | null {
    // Find players
    const playerA1 = players.find(p => p.name === teamA[0]);
    const playerA2 = players.find(p => p.name === teamA[1]);
    const playerB1 = players.find(p => p.name === teamB[0]);
    const playerB2 = players.find(p => p.name === teamB[1]);
    
    if (!playerA1 || !playerA2 || !playerB1 || !playerB2) return null;
    
    // Calculate team ELOs
    const teamAElo = ((playerA1.elo || INITIAL_ELO) + (playerA2.elo || INITIAL_ELO)) / 2;
    const teamBElo = ((playerB1.elo || INITIAL_ELO) + (playerB2.elo || INITIAL_ELO)) / 2;
    
    // Calculate expected win probability
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;
    
    // Actual result (1 for win, 0 for loss)
    const actualA = scoreA > scoreB ? 1 : 0;
    const actualB = scoreB > scoreA ? 1 : 0;
    
    // Calculate margin-of-victory multiplier
    const scoreDiff = Math.abs(scoreA - scoreB);
    const movMultiplier = Math.min(1.5, 1 + (scoreDiff / 12)); // Cap at 1.5x
    
    // K-factor (importance of match)
    const K_FACTOR = 20;
    
    // Calculate ELO changes
    const eloChangeA = Math.round(K_FACTOR * movMultiplier * (actualA - expectedA));
    const eloChangeB = Math.round(K_FACTOR * movMultiplier * (actualB - expectedB));
    
    return { eloChangeA, eloChangeB };
  }

  // Calculate all statistics for players and partnerships
  async calculateStats(): Promise<void> {
    const players = await this.getAllPlayers();
    const matches = await this.getAllMatches();
    
    // Reset player statistics
    for (const player of players) {
      player.gamesPlayed = null;
      player.wins = null;
      player.losses = null;
      player.pointsFor = null;
      player.pointsAgainst = null;
      player.pointDiff = null;
      player.winPercentage = null;
      player.powerRanking = null;
      
      // Save reset player
      await this.updatePlayer(player.id, player);
    }
    
    // Clear partnerships and recalculate
    this.partnershipsMap.clear();
    
    // Partnership mapping
    const partnershipMap: Record<string, {
      partnershipId: string;
      player1: string;
      player2: string;
      gamesPlayed: number;
      wins: number;
      losses: number;
      pointsFor: number;
      pointsAgainst: number;
      pointDiff: number;
      winPercentage: string;
      chemistryRating: string;
      elo: number;
    }> = {};
    
    // Process all matches
    for (const match of matches) {
      // Find players
      const playerA1 = players.find(p => p.name === match.playerA1);
      const playerA2 = players.find(p => p.name === match.playerA2);
      const playerB1 = players.find(p => p.name === match.playerB1);
      const playerB2 = players.find(p => p.name === match.playerB2);
      
      // Team A players
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
      
      // Team B players
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
      
      // Calculate partnerships
      
      // Team A partnership
      const playerAPair = [match.playerA1, match.playerA2].sort();
      const partnershipIdA = playerAPair.join('-');
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
      
      // Team B partnership
      const playerBPair = [match.playerB1, match.playerB2].sort();
      const partnershipIdB = playerBPair.join('-');
      
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
    
    // Update player win percentage and point differential
    for (const player of players) {
      player.pointDiff = (player.pointsFor || 0) - (player.pointsAgainst || 0);
      
      if (player.gamesPlayed && player.gamesPlayed > 0) {
        player.winPercentage = ((player.wins || 0) / player.gamesPlayed * 100).toFixed(2);
      } else {
        player.winPercentage = "0.00";
      }
      
      // Calculate power ranking
      const eloFactor = ((player.elo || INITIAL_ELO) - INITIAL_ELO) * 0.3;
      const pointDiffFactor = (player.pointDiff || 0) * 4;
      const winPercentageFactor = parseFloat(player.winPercentage || '0') * 0.1;
      
      player.powerRanking = Math.round(eloFactor + pointDiffFactor + winPercentageFactor);
      
      // Update player
      await this.updatePlayer(player.id, player);
    }
    
    // Process partnerships
    for (const [partnershipId, partnership] of Object.entries(partnershipMap)) {
      // Calculate point differential
      partnership.pointDiff = partnership.pointsFor - partnership.pointsAgainst;
      
      // Calculate win percentage
      if (partnership.gamesPlayed > 0) {
        partnership.winPercentage = (partnership.wins / partnership.gamesPlayed * 100).toFixed(2);
      }
      
      // Calculate chemistry rating
      const player1 = players.find(p => p.name === partnership.player1);
      const player2 = players.find(p => p.name === partnership.player2);
      
      if (player1 && player2) {
        const avgElo = ((player1.elo || INITIAL_ELO) + (player2.elo || INITIAL_ELO)) / 2;
        const expectedWinPct = 50; // Baseline expectation
        const actualWinPct = parseFloat(partnership.winPercentage);
        
        // Chemistry calculation (how much better they perform together)
        const chemistryFactor = 100 + ((actualWinPct - expectedWinPct) * 0.5) + (partnership.pointDiff * 2);
        
        // Account for sample size
        const sampleSizeFactor = partnership.gamesPlayed >= 3 ? 1 : 0.5 + (partnership.gamesPlayed * 0.2);
        
        partnership.chemistryRating = (chemistryFactor * sampleSizeFactor).toFixed(1);
      }
      
      // Create or update the partnership
      await this.createPartnership(partnership);
    }
  }
}

export const storage = new MemStorage();