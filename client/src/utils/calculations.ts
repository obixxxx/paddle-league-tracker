import { Player, Match, Partnership, EloChangeResult } from '@/types';

// Initial ELO rating
const INITIAL_ELO = 1500;
const K_FACTOR = 20;

/**
 * Calculate ELO changes for a match
 */
export const calculateELO = (
  teamA: string[],
  teamB: string[],
  scoreA: number,
  scoreB: number,
  players: Player[]
): EloChangeResult | null => {
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
  
  // Calculate ELO changes
  const eloChangeA = Math.round(K_FACTOR * movMultiplier * (actualA - expectedA));
  const eloChangeB = Math.round(K_FACTOR * movMultiplier * (actualB - expectedB));
  
  return { eloChangeA, eloChangeB };
};

/**
 * Calculate all statistics for players and partnerships
 */
export const calculateStats = (players: Player[], matches: Match[]) => {
  // Player stats calculation
  const updatedPlayers = [...players];
  
  // Reset statistics
  updatedPlayers.forEach(player => {
    player.gamesPlayed = 0;
    player.wins = 0;
    player.losses = 0;
    player.pointsFor = 0;
    player.pointsAgainst = 0;
    // Reset ELO to initial value
    player.elo = INITIAL_ELO;
  });
  
  // Calculate from matches
  matches.forEach(match => {
    // Find player indices
    const playerA1Index = updatedPlayers.findIndex(p => p.name === match.playerA1);
    const playerA2Index = updatedPlayers.findIndex(p => p.name === match.playerA2);
    const playerB1Index = updatedPlayers.findIndex(p => p.name === match.playerB1);
    const playerB2Index = updatedPlayers.findIndex(p => p.name === match.playerB2);
    
    if (playerA1Index >= 0) {
      updatedPlayers[playerA1Index].gamesPlayed = (updatedPlayers[playerA1Index].gamesPlayed || 0) + 1;
      updatedPlayers[playerA1Index].pointsFor = (updatedPlayers[playerA1Index].pointsFor || 0) + match.scoreA;
      updatedPlayers[playerA1Index].pointsAgainst = (updatedPlayers[playerA1Index].pointsAgainst || 0) + match.scoreB;
      
      if (match.scoreA > match.scoreB) {
        updatedPlayers[playerA1Index].wins = (updatedPlayers[playerA1Index].wins || 0) + 1;
      } else {
        updatedPlayers[playerA1Index].losses = (updatedPlayers[playerA1Index].losses || 0) + 1;
      }
    }
    
    if (playerA2Index >= 0) {
      updatedPlayers[playerA2Index].gamesPlayed = (updatedPlayers[playerA2Index].gamesPlayed || 0) + 1;
      updatedPlayers[playerA2Index].pointsFor = (updatedPlayers[playerA2Index].pointsFor || 0) + match.scoreA;
      updatedPlayers[playerA2Index].pointsAgainst = (updatedPlayers[playerA2Index].pointsAgainst || 0) + match.scoreB;
      
      if (match.scoreA > match.scoreB) {
        updatedPlayers[playerA2Index].wins = (updatedPlayers[playerA2Index].wins || 0) + 1;
      } else {
        updatedPlayers[playerA2Index].losses = (updatedPlayers[playerA2Index].losses || 0) + 1;
      }
    }
    
    if (playerB1Index >= 0) {
      updatedPlayers[playerB1Index].gamesPlayed = (updatedPlayers[playerB1Index].gamesPlayed || 0) + 1;
      updatedPlayers[playerB1Index].pointsFor = (updatedPlayers[playerB1Index].pointsFor || 0) + match.scoreB;
      updatedPlayers[playerB1Index].pointsAgainst = (updatedPlayers[playerB1Index].pointsAgainst || 0) + match.scoreA;
      
      if (match.scoreB > match.scoreA) {
        updatedPlayers[playerB1Index].wins = (updatedPlayers[playerB1Index].wins || 0) + 1;
      } else {
        updatedPlayers[playerB1Index].losses = (updatedPlayers[playerB1Index].losses || 0) + 1;
      }
    }
    
    if (playerB2Index >= 0) {
      updatedPlayers[playerB2Index].gamesPlayed = (updatedPlayers[playerB2Index].gamesPlayed || 0) + 1;
      updatedPlayers[playerB2Index].pointsFor = (updatedPlayers[playerB2Index].pointsFor || 0) + match.scoreB;
      updatedPlayers[playerB2Index].pointsAgainst = (updatedPlayers[playerB2Index].pointsAgainst || 0) + match.scoreA;
      
      if (match.scoreB > match.scoreA) {
        updatedPlayers[playerB2Index].wins = (updatedPlayers[playerB2Index].wins || 0) + 1;
      } else {
        updatedPlayers[playerB2Index].losses = (updatedPlayers[playerB2Index].losses || 0) + 1;
      }
    }
  });

  // Apply ELO changes from all matches
  matches.forEach(match => {
    // Apply ELO changes to players based on recorded match data
    const playerA1 = updatedPlayers.find(p => p.name === match.playerA1);
    const playerA2 = updatedPlayers.find(p => p.name === match.playerA2);
    const playerB1 = updatedPlayers.find(p => p.name === match.playerB1);
    const playerB2 = updatedPlayers.find(p => p.name === match.playerB2);

    if (playerA1) {
      playerA1.elo += match.eloChangeA1;
    }
    if (playerA2) {
      playerA2.elo += match.eloChangeA2;
    }
    if (playerB1) {
      playerB1.elo += match.eloChangeB1;
    }
    if (playerB2) {
      playerB2.elo += match.eloChangeB2;
    }
  });
  
  // Calculate win percentage and point differential
  updatedPlayers.forEach(player => {
    player.winPercentage = player.gamesPlayed && player.gamesPlayed > 0 
      ? ((player.wins || 0) / player.gamesPlayed * 100).toFixed(2) 
      : '0';
    player.pointDiff = (player.pointsFor || 0) - (player.pointsAgainst || 0);
    
    // Calculate power ranking
    const eloFactor = ((player.elo || INITIAL_ELO) - INITIAL_ELO) * 0.3;
    const pointDiffFactor = (player.pointDiff || 0) * 4;
    const winPercentageFactor = parseFloat(player.winPercentage || '0') * 0.1;
    
    player.powerRanking = eloFactor + pointDiffFactor + winPercentageFactor;
  });
  
  // Calculate partnerships
  const partnershipMap: Record<string, Partnership> = {};
  
  matches.forEach(match => {
    // Team A partnership
    const partnershipA = [match.playerA1, match.playerA2].sort().join('-');
    if (!partnershipMap[partnershipA]) {
      partnershipMap[partnershipA] = {
        id: partnershipA,
        players: [match.playerA1, match.playerA2],
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        winPercentage: '0',
        chemistryRating: '0',
        elo: INITIAL_ELO
      };
    }
    
    partnershipMap[partnershipA].gamesPlayed++;
    partnershipMap[partnershipA].pointsFor += match.scoreA;
    partnershipMap[partnershipA].pointsAgainst += match.scoreB;
    
    if (match.scoreA > match.scoreB) {
      partnershipMap[partnershipA].wins++;
    } else {
      partnershipMap[partnershipA].losses++;
    }
    
    // Team B partnership
    const partnershipB = [match.playerB1, match.playerB2].sort().join('-');
    if (!partnershipMap[partnershipB]) {
      partnershipMap[partnershipB] = {
        id: partnershipB,
        players: [match.playerB1, match.playerB2],
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
        winPercentage: '0',
        chemistryRating: '0',
        elo: INITIAL_ELO
      };
    }
    
    partnershipMap[partnershipB].gamesPlayed++;
    partnershipMap[partnershipB].pointsFor += match.scoreB;
    partnershipMap[partnershipB].pointsAgainst += match.scoreA;
    
    if (match.scoreB > match.scoreA) {
      partnershipMap[partnershipB].wins++;
    } else {
      partnershipMap[partnershipB].losses++;
    }
  });
  
  // Calculate win percentage and point differential for partnerships
  Object.values(partnershipMap).forEach(partnership => {
    partnership.winPercentage = partnership.gamesPlayed > 0 
      ? (partnership.wins / partnership.gamesPlayed * 100).toFixed(2) 
      : '0';
    partnership.pointDiff = partnership.pointsFor - partnership.pointsAgainst;
    
    // Calculate chemistry rating and partnership ELO
    const player1 = updatedPlayers.find(p => p.name === partnership.players[0]);
    const player2 = updatedPlayers.find(p => p.name === partnership.players[1]);
    
    if (player1 && player2) {
      // Set partnership ELO as average of player ELOs
      partnership.elo = Math.round((player1.elo + player2.elo) / 2);
      
      const expectedWinPct = 50; // Baseline expectation
      const actualWinPct = parseFloat(partnership.winPercentage);
      
      // Chemistry bonus based on how much better they perform together
      const chemistryFactor = 100 + ((actualWinPct - expectedWinPct) * 0.5) + (partnership.pointDiff * 2);
      
      // Account for outliers in small sample sizes
      const sampleSizeFactor = partnership.gamesPlayed >= 3 ? 1 : 0.5 + (partnership.gamesPlayed * 0.2);
      
      // Final chemistry calculation
      partnership.chemistryRating = (chemistryFactor * sampleSizeFactor).toFixed(1);
    }
  });
  
  return { 
    updatedPlayers, 
    partnershipArray: Object.values(partnershipMap) 
  };
};
