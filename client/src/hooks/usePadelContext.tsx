import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ref, set, onValue, push, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { calculateELO, calculateStats } from '@/utils/calculations';
import { 
  Player, 
  Match, 
  Partnership, 
  NewMatch
} from '@/types';

// Initial ELO rating
const INITIAL_ELO = 1500;

// Context interface
interface PadelContextType {
  players: Player[];
  matches: Match[];
  partnerships: Partnership[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  addPlayer: (name: string) => void;
  updatePlayer: (id: number, updatedData: Partial<Player>) => void;
  deletePlayer: (id: number) => void;
  addMatch: (matchData: NewMatch) => void;
  updateMatch: (id: number, updatedData: Partial<Match>) => void;
  deleteMatch: (id: number) => void;
  exportData: () => void;
  shareApp: () => void;
}

// Create context
const PadelContext = createContext<PadelContextType>({
  players: [],
  matches: [],
  partnerships: [],
  loading: true,
  activeTab: 'dashboard',
  setActiveTab: () => {},
  addPlayer: () => {},
  updatePlayer: () => {},
  deletePlayer: () => {},
  addMatch: () => {},
  updateMatch: () => {},
  deleteMatch: () => {},
  exportData: () => {},
  shareApp: () => {}
});

// Provider component
export const PadelContextProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load data from Firebase
  useEffect(() => {
    setLoading(true);
    
    // Get players data
    const playersRef = ref(database, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.values(data) as Player[];
        setPlayers(playersArray);
      } else {
        // If no data exists, initialize with sample players
        const initialPlayers = [
          { id: 1, name: 'Obi', active: true, elo: INITIAL_ELO },
          { id: 2, name: 'Jack', active: true, elo: INITIAL_ELO },
          { id: 3, name: 'Marvin', active: true, elo: INITIAL_ELO },
          { id: 4, name: 'James', active: true, elo: INITIAL_ELO },
          { id: 5, name: 'Dallas', active: true, elo: INITIAL_ELO },
          { id: 6, name: 'Dylan', active: true, elo: INITIAL_ELO },
          { id: 7, name: 'Nick', active: true, elo: INITIAL_ELO },
          { id: 8, name: 'Remi', active: true, elo: INITIAL_ELO },
          { id: 9, name: 'Alex', active: true, elo: INITIAL_ELO },
        ];
        
        initialPlayers.forEach((player) => {
          set(ref(database, `players/${player.id}`), player);
        });
        
        setPlayers(initialPlayers);
      }
    });
    
    // Get matches data
    const matchesRef = ref(database, 'matches');
    onValue(matchesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const matchesArray = Object.values(data) as Match[];
        setMatches(matchesArray);
      } else {
        // If no data exists, initialize with sample matches
        const initialMatches = [
          { 
            id: 1, 
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
            id: 2, 
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
            id: 3, 
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
        
        initialMatches.forEach((match) => {
          set(ref(database, `matches/${match.id}`), match);
        });
        
        setMatches(initialMatches);
      }
      
      setLoading(false);
    });
  }, []);

  // Calculate statistics when matches or players change
  useEffect(() => {
    if (!loading) {
      const { updatedPlayers, partnershipArray } = calculateStats(players, matches);
      setPlayers(updatedPlayers);
      setPartnerships(partnershipArray);
      
      // Update players in Firebase (only if they've changed)
      updatedPlayers.forEach(player => {
        const playerRef = ref(database, `players/${player.id}`);
        update(playerRef, player);
      });
    }
  }, [matches, loading]);

  // Add a new player
  const addPlayer = (name: string) => {
    // Get next ID
    const nextId = players.length > 0 
      ? Math.max(...players.map(p => p.id)) + 1 
      : 1;
    
    const newPlayer: Player = {
      id: nextId,
      name,
      active: true,
      elo: INITIAL_ELO
    };
    
    // Add to Firebase
    set(ref(database, `players/${newPlayer.id}`), newPlayer);
  };

  // Add a new match
  const addMatch = (matchData: NewMatch) => {
    // Calculate ELO changes
    const teamA = [matchData.playerA1, matchData.playerA2];
    const teamB = [matchData.playerB1, matchData.playerB2];
    
    const eloChanges = calculateELO(
      teamA, 
      teamB, 
      matchData.scoreA, 
      matchData.scoreB, 
      players
    );
    
    if (!eloChanges) return;
    
    // Get next ID
    const nextId = matches.length > 0 
      ? Math.max(...matches.map(m => m.id)) + 1 
      : 1;
    
    const newMatch: Match = {
      id: nextId,
      date: matchData.date,
      playerA1: matchData.playerA1,
      playerA2: matchData.playerA2,
      playerB1: matchData.playerB1,
      playerB2: matchData.playerB2,
      scoreA: matchData.scoreA,
      scoreB: matchData.scoreB,
      eloChangeA1: eloChanges.eloChangeA,
      eloChangeA2: eloChanges.eloChangeA,
      eloChangeB1: eloChanges.eloChangeB,
      eloChangeB2: eloChanges.eloChangeB
    };
    
    // Add match to Firebase
    set(ref(database, `matches/${newMatch.id}`), newMatch);
    
    // Update player ELO ratings
    const playerA1 = players.find(p => p.name === matchData.playerA1);
    const playerA2 = players.find(p => p.name === matchData.playerA2);
    const playerB1 = players.find(p => p.name === matchData.playerB1);
    const playerB2 = players.find(p => p.name === matchData.playerB2);
    
    if (playerA1) {
      update(ref(database, `players/${playerA1.id}`), {
        elo: (playerA1.elo || INITIAL_ELO) + eloChanges.eloChangeA
      });
    }
    
    if (playerA2) {
      update(ref(database, `players/${playerA2.id}`), {
        elo: (playerA2.elo || INITIAL_ELO) + eloChanges.eloChangeA
      });
    }
    
    if (playerB1) {
      update(ref(database, `players/${playerB1.id}`), {
        elo: (playerB1.elo || INITIAL_ELO) + eloChanges.eloChangeB
      });
    }
    
    if (playerB2) {
      update(ref(database, `players/${playerB2.id}`), {
        elo: (playerB2.elo || INITIAL_ELO) + eloChanges.eloChangeB
      });
    }
  };

  // Export data to JSON
  const exportData = () => {
    const data = {
      players,
      matches,
      partnerships,
      exportedAt: new Date().toISOString()
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `padel-league-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Share app via various methods
  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Padel League',
        text: 'Check out our padel league statistics!',
        url: window.location.href
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Failed to copy:', err));
    }
  };

  // Update a player
  const updatePlayer = (id: number, updatedData: Partial<Player>) => {
    const playerRef = ref(database, `players/${id}`);
    update(playerRef, updatedData);
  };
  
  // Delete a player
  const deletePlayer = (id: number) => {
    // First check if player is in any matches
    const playerToDelete = players.find(p => p.id === id);
    if (!playerToDelete) return;
    
    const playerName = playerToDelete.name;
    const isInMatches = matches.some(match => 
      match.playerA1 === playerName || 
      match.playerA2 === playerName || 
      match.playerB1 === playerName || 
      match.playerB2 === playerName
    );
    
    if (isInMatches) {
      alert(`Cannot delete ${playerName} because they are in existing matches. Consider marking them as inactive instead.`);
      
      // Mark as inactive instead
      update(ref(database, `players/${id}`), {
        active: false
      });
    } else {
      // Safe to delete
      const playerRef = ref(database, `players/${id}`);
      set(playerRef, null);
    }
  };
  
  // Update a match
  const updateMatch = (id: number, updatedData: Partial<Match>) => {
    const matchRef = ref(database, `matches/${id}`);
    
    // If teams or scores have changed, we need to recalculate ELO changes
    const match = matches.find(m => m.id === id);
    if (!match) return;
    
    // Check if we're updating teams or scores
    const teamsChanged = 
      (updatedData.playerA1 && updatedData.playerA1 !== match.playerA1) ||
      (updatedData.playerA2 && updatedData.playerA2 !== match.playerA2) ||
      (updatedData.playerB1 && updatedData.playerB1 !== match.playerB1) ||
      (updatedData.playerB2 && updatedData.playerB2 !== match.playerB2);
    
    const scoresChanged = 
      (updatedData.scoreA !== undefined && updatedData.scoreA !== match.scoreA) ||
      (updatedData.scoreB !== undefined && updatedData.scoreB !== match.scoreB);
    
    if (teamsChanged || scoresChanged) {
      // We need to undo the previous ELO changes
      const playerA1 = players.find(p => p.name === match.playerA1);
      const playerA2 = players.find(p => p.name === match.playerA2);
      const playerB1 = players.find(p => p.name === match.playerB1);
      const playerB2 = players.find(p => p.name === match.playerB2);
      
      // Undo previous ELO changes (subtract the change)
      if (playerA1) {
        update(ref(database, `players/${playerA1.id}`), {
          elo: (playerA1.elo || INITIAL_ELO) - match.eloChangeA1
        });
      }
      
      if (playerA2) {
        update(ref(database, `players/${playerA2.id}`), {
          elo: (playerA2.elo || INITIAL_ELO) - match.eloChangeA2
        });
      }
      
      if (playerB1) {
        update(ref(database, `players/${playerB1.id}`), {
          elo: (playerB1.elo || INITIAL_ELO) - match.eloChangeB1
        });
      }
      
      if (playerB2) {
        update(ref(database, `players/${playerB2.id}`), {
          elo: (playerB2.elo || INITIAL_ELO) - match.eloChangeB2
        });
      }
      
      // Calculate new ELO changes
      const teamA = [
        updatedData.playerA1 || match.playerA1, 
        updatedData.playerA2 || match.playerA2
      ];
      const teamB = [
        updatedData.playerB1 || match.playerB1, 
        updatedData.playerB2 || match.playerB2
      ];
      
      const scoreA = updatedData.scoreA !== undefined ? updatedData.scoreA : match.scoreA;
      const scoreB = updatedData.scoreB !== undefined ? updatedData.scoreB : match.scoreB;
      
      const eloChanges = calculateELO(
        teamA, 
        teamB, 
        scoreA, 
        scoreB, 
        players
      );
      
      if (!eloChanges) return;
      
      // Set the updated match with new ELO changes
      const updatedMatch = {
        ...match,
        ...updatedData,
        eloChangeA1: eloChanges.eloChangeA,
        eloChangeA2: eloChanges.eloChangeA,
        eloChangeB1: eloChanges.eloChangeB,
        eloChangeB2: eloChanges.eloChangeB
      };
      
      // Update the match in Firebase
      set(matchRef, updatedMatch);
      
      // Now apply the new ELO changes to the players
      const newPlayerA1 = players.find(p => p.name === updatedMatch.playerA1);
      const newPlayerA2 = players.find(p => p.name === updatedMatch.playerA2);
      const newPlayerB1 = players.find(p => p.name === updatedMatch.playerB1);
      const newPlayerB2 = players.find(p => p.name === updatedMatch.playerB2);
      
      if (newPlayerA1) {
        update(ref(database, `players/${newPlayerA1.id}`), {
          elo: (newPlayerA1.elo || INITIAL_ELO) + eloChanges.eloChangeA
        });
      }
      
      if (newPlayerA2) {
        update(ref(database, `players/${newPlayerA2.id}`), {
          elo: (newPlayerA2.elo || INITIAL_ELO) + eloChanges.eloChangeA
        });
      }
      
      if (newPlayerB1) {
        update(ref(database, `players/${newPlayerB1.id}`), {
          elo: (newPlayerB1.elo || INITIAL_ELO) + eloChanges.eloChangeB
        });
      }
      
      if (newPlayerB2) {
        update(ref(database, `players/${newPlayerB2.id}`), {
          elo: (newPlayerB2.elo || INITIAL_ELO) + eloChanges.eloChangeB
        });
      }
    } else {
      // Just update the other fields like date
      update(matchRef, updatedData);
    }
  };
  
  // Delete a match
  const deleteMatch = (id: number) => {
    // Get the match to delete
    const match = matches.find(m => m.id === id);
    if (!match) return;
    
    // Undo the ELO changes for the players
    const playerA1 = players.find(p => p.name === match.playerA1);
    const playerA2 = players.find(p => p.name === match.playerA2);
    const playerB1 = players.find(p => p.name === match.playerB1);
    const playerB2 = players.find(p => p.name === match.playerB2);
    
    if (playerA1) {
      update(ref(database, `players/${playerA1.id}`), {
        elo: (playerA1.elo || INITIAL_ELO) - match.eloChangeA1
      });
    }
    
    if (playerA2) {
      update(ref(database, `players/${playerA2.id}`), {
        elo: (playerA2.elo || INITIAL_ELO) - match.eloChangeA2
      });
    }
    
    if (playerB1) {
      update(ref(database, `players/${playerB1.id}`), {
        elo: (playerB1.elo || INITIAL_ELO) - match.eloChangeB1
      });
    }
    
    if (playerB2) {
      update(ref(database, `players/${playerB2.id}`), {
        elo: (playerB2.elo || INITIAL_ELO) - match.eloChangeB2
      });
    }
    
    // Delete the match from Firebase
    const matchRef = ref(database, `matches/${id}`);
    set(matchRef, null);
  };

// Tournament feature has been removed

  return (
    <PadelContext.Provider value={{
      players,
      matches,
      partnerships,
      loading,
      activeTab,
      setActiveTab,
      addPlayer,
      updatePlayer,
      deletePlayer,
      addMatch,
      updateMatch,
      deleteMatch,
      exportData,
      shareApp
    }}>
      {children}
    </PadelContext.Provider>
  );
};

// Custom hook to use the context
export const usePadelContext = () => useContext(PadelContext);
