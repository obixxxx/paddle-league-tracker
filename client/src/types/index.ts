// Player types
export interface Player {
  id: number;
  name: string;
  active: boolean;
  elo: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  pointDiff?: number;
  winPercentage?: string;
  powerRanking?: number;
}

// Match types
export interface Match {
  id: number;
  date: string;
  playerA1: string;
  playerA2: string;
  playerB1: string;
  playerB2: string;
  scoreA: number;
  scoreB: number;
  eloChangeA1: number;
  eloChangeA2: number;
  eloChangeB1: number;
  eloChangeB2: number;
}

export interface NewMatch {
  date: string;
  playerA1: string;
  playerA2: string;
  playerB1: string;
  playerB2: string;
  scoreA: number;
  scoreB: number;
}

// Partnership types
export interface Partnership {
  id: string;
  players: string[];
  gamesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  winPercentage: string;
  chemistryRating: string;
  elo?: number;
}

// Tournament types have been removed

// ELO calculation types
export interface EloChangeResult {
  eloChangeA: number;
  eloChangeB: number;
}
