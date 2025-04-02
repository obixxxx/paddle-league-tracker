import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Form, 
  Select, 
  Input, 
  DatePicker, 
  Tabs,
  Card,
  Statistic,
  Row,
  Col,
  notification,
  Spin,
  Modal
} from 'antd';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { ShareAltOutlined, LoadingOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push } from 'firebase/database';
import './App.css';

const { Option } = Select;
const { TabPane } = Tabs;

// Initial ELO rating
const INITIAL_ELO = 1500;
const K_FACTOR = 20;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHqRau_B38lHhVqHkJJo18AI2KMQEUGj8",
  authDomain: "padel-boyz-league.firebaseapp.com",
  databaseURL: "https://padel-boyz-league-default-rtdb.firebaseio.com",
  projectId: "padel-boyz-league",
  storageBucket: "padel-boyz-league.firebasestorage.app",
  messagingSenderId: "985827253631",
  appId: "1:985827253631:web:889d624b8d1814b8de4e4a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

function App() {
  // State for players, matches, and partnerships
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  
  const [newMatch, setNewMatch] = useState({
    date: '',
    playerA1: '',
    playerA2: '',
    playerB1: '',
    playerB2: '',
    scoreA: '',
    scoreB: ''
  });
  
  const [newPlayer, setNewPlayer] = useState({
    name: ''
  });

  // Load data from Firebase
  useEffect(() => {
    setLoading(true);
    
    // Get players data
    const playersRef = ref(database, 'players');
    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const playersArray = Object.values(data);
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
        const matchesArray = Object.values(data);
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

  // Calculate all statistics
  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [matches, players, loading]);
  
  const calculateStats = () => {
    // Player stats calculation
    const updatedPlayers = [...players];
    
    // Reset statistics
    updatedPlayers.forEach(player => {
      player.gamesPlayed = 0;
      player.wins = 0;
      player.losses = 0;
      player.pointsFor = 0;
      player.pointsAgainst = 0;
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
    
    // Calculate win percentage and point differential
    updatedPlayers.forEach(player => {
      player.winPercentage = player.gamesPlayed > 0 ? (player.wins / player.gamesPlayed * 100).toFixed(2) : 0;
      player.pointDiff = (player.pointsFor || 0) - (player.pointsAgainst || 0);
      
      // Calculate power ranking
      const eloFactor = ((player.elo || INITIAL_ELO) - INITIAL_ELO) * 0.3;
      const pointDiffFactor = (player.pointDiff || 0) * 4;
      const winPercentageFactor = (player.winPercentage || 0) * 0.1;
      
      player.powerRanking = eloFactor + pointDiffFactor + winPercentageFactor;
    });
    
    // Calculate partnerships
    const partnershipMap = {};
    
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
      partnership.winPercentage = partnership.gamesPlayed > 0 ? 
        (partnership.wins / partnership.gamesPlayed * 100).toFixed(2) : 0;
      partnership.pointDiff = partnership.pointsFor - partnership.pointsAgainst;
      
      // Calculate chemistry rating
      const player1 = players.find(p => p.name === partnership.players[0]);
      const player2 = players.find(p => p.name === partnership.players[1]);
      
      if (player1 && player2) {
        const avgElo = (player1.elo + player2.elo) / 2;
        const expectedWinPct = 50; // Baseline expectation
        const actualWinPct = parseFloat(partnership.winPercentage);
        
        // Chemistry bonus based on how much better they perform together
        const chemistryRating = 100 + ((actualWinPct - expectedWinPct) * 0.5) + (partnership.pointDiff * 2);
        partnership.chemistryRating = chemistryRating.toFixed(1);
      }
    });
    
    setPartnerships(Object.values(partnershipMap));
  };
  
  // Calculate ELO for a new match
  const calculateELO = (teamA, teamB, scoreA, scoreB) => {
    // Find players
    const playerA1 = players.find(p => p.name === teamA[0]);
    const playerA2 = players.find(p => p.name === teamA[1]);
    const playerB1 = players.find(p => p.name === teamB[0]);
    const playerB2 = players.find(p => p.name === teamB[1]);
    
    if (!playerA1 || !playerA2 || !playerB1 || !playerB2) return null;
    
    // Calculate team ELOs
    const teamAElo = (playerA1.elo + playerA2.elo) / 2;
    const teamBElo = (playerB1.elo + playerB2.elo) / 2;
    
    // Calculate expected win probability
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;
    
    // Actual result (1 for win, 0 for loss)
    const actualA = scoreA > scoreB ? 1 : 0;
    const actualB = scoreB > scoreA ? 1 : 0;
    
    // Calculate margin-of-victory multiplier
    const scoreDiff = Math.abs(scoreA - scoreB);
    const movMultiplier = Math.min(1.5, 1 + (scoreDiff / 12)); // Cap at 1.5x
    
    // Calculate ELO change
    const eloChangeBase = K_FACTOR * (actualA - expectedA);
    const eloChange = eloChangeBase * movMultiplier;
    
    return {
      eloChangeA1: eloChange,
      eloChangeA2: eloChange,
      eloChangeB1: -eloChange,
      eloChangeB2: -eloChange
    };
  };
  
  // Handle adding a new match
  const handleAddMatch = () => {
    // Validate input
    if (!newMatch.playerA1 || !newMatch.playerA2 || !newMatch.playerB1 || 
        !newMatch.playerB2 || !newMatch.scoreA || !newMatch.scoreB || !newMatch.date) {
      notification.error({
        message: 'Error',
        description: "Please fill in all match details",
      });
      return;
    }
    
    // Calculate ELO changes
    const eloChanges = calculateELO(
      [newMatch.playerA1, newMatch.playerA2],
      [newMatch.playerB1, newMatch.playerB2],
      parseInt(newMatch.scoreA),
      parseInt(newMatch.scoreB)
    );
    
    if (!eloChanges) {
      notification.error({
        message: 'Error',
        description: "Error calculating ELO changes",
      });
      return;
    }
    
    // Create new match object
    const match = {
      id: matches.length + 1,
      date: newMatch.date,
      playerA1: newMatch.playerA1,
      playerA2: newMatch.playerA2,
      playerB1: newMatch.playerB1,
      playerB2: newMatch.playerB2,
      scoreA: parseInt(newMatch.scoreA),
      scoreB: parseInt(newMatch.scoreB),
      ...eloChanges
    };
    
    // Save match to Firebase
    set(ref(database, `matches/${match.id}`), match);
    
    // Update player ELOs in Firebase
    const updatedPlayers = [...players];
    const playerA1Index = updatedPlayers.findIndex(p => p.name === newMatch.playerA1);
    const playerA2Index = updatedPlayers.findIndex(p => p.name === newMatch.playerA2);
    const playerB1Index = updatedPlayers.findIndex(p => p.name === newMatch.playerB1);
    const playerB2Index = updatedPlayers.findIndex(p => p.name === newMatch.playerB2);
    
    if (playerA1Index >= 0) {
      updatedPlayers[playerA1Index].elo += eloChanges.eloChangeA1;
      set(ref(database, `players/${updatedPlayers[playerA1Index].id}`), updatedPlayers[playerA1Index]);
    }
    if (playerA2Index >= 0) {
      updatedPlayers[playerA2Index].elo += eloChanges.eloChangeA2;
      set(ref(database, `players/${updatedPlayers[playerA2Index].id}`), updatedPlayers[playerA2Index]);
    }
    if (playerB1Index >= 0) {
      updatedPlayers[playerB1Index].elo += eloChanges.eloChangeB1;
      set(ref(database, `players/${updatedPlayers[playerB1Index].id}`), updatedPlayers[playerB1Index]);
    }
    if (playerB2Index >= 0) {
      updatedPlayers[playerB2Index].elo += eloChanges.eloChangeB2;
      set(ref(database, `players/${updatedPlayers[playerB2Index].id}`), updatedPlayers[playerB2Index]);
    }
    
    // Reset form
    setNewMatch({
      date: '',
      playerA1: '',
      playerA2: '',
      playerB1: '',
      playerB2: '',
      scoreA: '',
      scoreB: ''
    });
    
    notification.success({
      message: 'Success',
      description: 'Match added successfully!',
    });
  };
  
  // Handle adding a new player
  const handleAddPlayer = () => {
    if (!newPlayer.name) {
      notification.error({
        message: 'Error',
        description: 'Please enter a player name',
      });
      return;
    }
    
    // Check if player already exists
    if (players.some(p => p.name === newPlayer.name)) {
      notification.error({
        message: 'Error',
        description: 'Player already exists',
      });
      return;
    }
    
    const player = {
      id: players.length + 1,
      name: newPlayer.name,
      active: true,
      elo: INITIAL_ELO,
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointDiff: 0,
      winPercentage: 0
    };
    
    // Save to Firebase
    set(ref(database, `players/${player.id}`), player);
    
    setNewPlayer({ name: '' });
    
    notification.success({
      message: 'Success',
      description: `Player ${player.name} added successfully!`,
    });
  };
  
  // Share to WhatsApp
  const shareToWhatsApp = () => {
    const message = `Check out our Padel League Tracker! Current standings and match results: ${window.location.href}`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL);
  };
  
  // Update player status (active/inactive)
  const togglePlayerStatus = (player) => {
    const updatedPlayer = { ...player, active: !player.active };
    set(ref(database, `players/${player.id}`), updatedPlayer);
    
    notification.success({
      message: 'Success',
      description: `${player.name} is now ${updatedPlayer.active ? 'active' : 'inactive'}!`,
    });
  };
  
  // Share Modal
  const openShareModal = () => {
    setShareModalVisible(true);
  };
  
  const closeShareModal = () => {
    setShareModalVisible(false);
  };
  
  // Define columns for player rankings table
  const playerColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (text, record, index) => {
        // Sort players by ELO and return rank
        const sortedPlayers = [...players]
          .filter(p => p.gamesPlayed > 0)
          .sort((a, b) => b.elo - a.elo);
        
        const rank = sortedPlayers.findIndex(p => p.name === record.name) + 1;
        return rank > 0 ? rank : '-';
      },
    },
    {
      title: 'Player',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Games',
      dataIndex: 'gamesPlayed',
      key: 'gamesPlayed',
      sorter: (a, b) => a.gamesPlayed - b.gamesPlayed,
    },
    {
      title: 'Wins',
      dataIndex: 'wins',
      key: 'wins',
      sorter: (a, b) => a.wins - b.wins,
    },
    {
      title: 'Losses',
      dataIndex: 'losses',
      key: 'losses',
      sorter: (a, b) => a.losses - b.losses,
    },
    {
      title: 'Win %',
      key: 'winPercentage',
      render: (text, record) => `${record.winPercentage}%`,
      sorter: (a, b) => a.winPercentage - b.winPercentage,
    },
    {
      title: 'Points For',
      dataIndex: 'pointsFor',
      key: 'pointsFor',
      sorter: (a, b) => a.pointsFor - b.pointsFor,
    },
    {
      title: 'Points Against',
      dataIndex: 'pointsAgainst',
      key: 'pointsAgainst',
      sorter: (a, b) => a.pointsAgainst - b.pointsAgainst,
    },
    {
      title: 'Point Diff',
      dataIndex: 'pointDiff',
      key: 'pointDiff',
      sorter: (a, b) => a.pointDiff - b.pointDiff,
    },
    {
      title: 'ELO Rating',
      dataIndex: 'elo',
      key: 'elo',
      render: (text, record) => Math.round(record.elo),
      sorter: (a, b) => a.elo - b.elo,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Power Ranking',
      dataIndex: 'powerRanking',
      key: 'powerRanking',
      render: (text, record) => Math.round(record.powerRanking),
      sorter: (a, b) => a.powerRanking - b.powerRanking,
    }
  ];
  
  // Define columns for match log table
  const matchColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Team A',
      key: 'teamA',
      render: (text, record) => `${record.playerA1} / ${record.playerA2}`,
    },
    {
      title: 'Team B',
      key: 'teamB',
      render: (text, record) => `${record.playerB1} / ${record.playerB2}`,
    },
    {
      title: 'Score',
      key: 'score',
      render: (text, record) => `${record.scoreA} - ${record.scoreB}`,
    },
    {
      title: 'Winner',
      key: 'winner',
      render: (text, record) => 
        record.scoreA > record.scoreB 
          ? `${record.playerA1} / ${record.playerA2}` 
          : `${record.playerB1} / ${record.playerB2}`,
    },
    {
      title: 'ELO Change',
      key: 'eloChange',
      render: (text, record) => 
        `${record.playerA1}: ${record.eloChangeA1.toFixed(1)}, ${record.playerA2}: ${record.eloChangeA2.toFixed(1)}, ` +
        `${record.playerB1}: ${record.eloChangeB1.toFixed(1)}, ${record.playerB2}: ${record.eloChangeB2.toFixed(1)}`,
    }
  ];
  
  // Define columns for partnership table
  const partnershipColumns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (text, record, index) => {
        // Sort partnerships by ELO and return rank
        const sortedPartnerships = [...partnerships]
          .filter(p => p.gamesPlayed > 0)
          .sort((a, b) => b.elo - a.elo);
        
        const rank = sortedPartnerships.findIndex(p => p.id === record.id) + 1;
        return rank > 0 ? rank : '-';
      },
    },
    {
      title: 'Partnership',
      key: 'partnership',
      render: (text, record) => record.players.join(' / '),
    },
    {
      title: 'Games',
      dataIndex: 'gamesPlayed',
      key: 'gamesPlayed',
      sorter: (a, b) => a.gamesPlayed - b.gamesPlayed,
    },
    {
      title: 'Wins',
      dataIndex: 'wins',
      key: 'wins',
      sorter: (a, b) => a.wins - b.wins,
    },
    {
      title: 'Losses',
      dataIndex: 'losses',
      key: 'losses',
      sorter: (a, b) => a.losses - b.losses,
    },
    {
      title: 'Win %',
      key: 'winPercentage',
      render: (text, record) => `${record.winPercentage}%`,
      sorter: (a, b) => a.winPercentage - b.winPercentage,
    },
    {
      title: 'Points For',
      dataIndex: 'pointsFor',
      key: 'pointsFor',
      sorter: (a, b) => a.pointsFor - b.pointsFor,
    },
    {
      title: 'Points Against',
      dataIndex: 'pointsAgainst',
      key: 'pointsAgainst',
      sorter: (a, b) => a.pointsAgainst - b.pointsAgainst,
    },
    {
      title: 'Point Diff',
      dataIndex: 'pointDiff',
      key: 'pointDiff',
      sorter: (a, b) => a.pointDiff - b.pointDiff,
    },
    {
      title: 'Chemistry Rating',
      dataIndex: 'chemistryRating',
      key: 'chemistryRating',
      sorter: (a, b) => a.chemistryRating - b.chemistryRating,
    }
  ];
  
  // Get top players for stats
  const getTopPlayers = () => {
    return [...players]
      .filter(p => p.gamesPlayed > 0)
      .sort((a, b) => b.elo - a.elo)
      .slice(0, 5);
  };
  
  // Get top partnerships for stats
  const getTopPartnerships = () => {
    return [...partnerships]
      .filter(p => p.gamesPlayed >= 2) // At least 2 games played
      .sort((a, b) => b.winPercentage - a.winPercentage)
      .slice(0, 5);
  };
  
 // Prepare ELO history data for chart
  const prepareEloHistoryData = () => {
    const topPlayers = getTopPlayers();
    const eloHistory = [];
    
    // Create initial point with starting ELO
    topPlayers.forEach(player => {
      eloHistory.push({
        name: player.name,
        game0: INITIAL_ELO
      });
    });
    
    // Add points for each match
    matches.forEach((match, index) => {
      const gameNumber = index + 1;
      
      topPlayers.forEach(player => {
        const playerHistory = eloHistory.find(h => h.name === player.name);
        
        if (playerHistory) {
          const prevElo = playerHistory[`game${index}`] || INITIAL_ELO;
          let eloChange = 0;
          
          if (match.playerA1 === player.name) eloChange = match.eloChangeA1;
          else if (match.playerA2 === player.name) eloChange = match.eloChangeA2;
          else if (match.playerB1 === player.name) eloChange = match.eloChangeB1;
          else if (match.playerB2 === player.name) eloChange = match.eloChangeB2;
          
          playerHistory[`game${gameNumber}`] = prevElo + eloChange;
        }
      });
    });
    
    // Convert to format for Recharts
    const chartData = [];
    const maxGames = matches.length;
    
    for (let i = 0; i <= maxGames; i++) {
      const dataPoint = { game: i };
      
      eloHistory.forEach(player => {
        dataPoint[player.name] = player[`game${i}`];
      });
      
      chartData.push(dataPoint);
    }
    
    return chartData;
  };
  
  // Loading spinner
  if (loading) {
    return (
      <div className="loading-container">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <p>Loading Paddle League Data...</p>
      </div>
    );
  }
  
  return (
    <div className="App">
      <h1>Padel League Tracker</h1>
      
      <div className="header-actions">
        <Button 
          type="primary" 
          icon={<ShareAltOutlined />} 
          onClick={openShareModal}
          className="share-button"
        >
          Share
        </Button>
      </div>
      
      <Tabs defaultActiveKey="1">
        <TabPane tab="Dashboard" key="1">
          <div className="dashboard">
            <Row gutter={16}>
              <Col span={8}>
                <Card title="League Stats">
                  <Statistic title="Total Players" value={players.length} />
                  <Statistic title="Total Matches" value={matches.length} />
                  <Statistic title="Active Partnerships" value={partnerships.length} />
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="Top Player">
                  {players.filter(p => p.gamesPlayed > 0).sort((a, b) => b.elo - a.elo)[0] ? (
                    <>
                      <Statistic 
                        title="Name" 
                        value={players.filter(p => p.gamesPlayed > 0).sort((a, b) => b.elo - a.elo)[0].name} 
                      />
                      <Statistic 
                        title="ELO Rating" 
                        value={Math.round(players.filter(p => p.gamesPlayed > 0).sort((a, b) => b.elo - a.elo)[0].elo)} 
                      />
                      <Statistic 
                        title="Win %" 
                        value={`${players.filter(p => p.gamesPlayed > 0).sort((a, b) => b.elo - a.elo)[0].winPercentage}%`} 
                      />
                    </>
                  ) : (
                    <p>No data yet</p>
                  )}
                </Card>
              </Col>
              
              <Col span={8}>
                <Card title="Best Partnership">
                  {partnerships.filter(p => p.gamesPlayed >= 2).sort((a, b) => b.winPercentage - a.winPercentage)[0] ? (
                    <>
                      <Statistic 
                        title="Players" 
                        value={partnerships.filter(p => p.gamesPlayed >= 2).sort((a, b) => b.winPercentage - a.winPercentage)[0].players.join(' / ')} 
                      />
                      <Statistic 
                        title="Win %" 
                        value={`${partnerships.filter(p => p.gamesPlayed >= 2).sort((a, b) => b.winPercentage - a.winPercentage)[0].winPercentage}%`} 
                      />
                      <Statistic 
                        title="Chemistry" 
                        value={partnerships.filter(p => p.gamesPlayed >= 2).sort((a, b) => b.winPercentage - a.winPercentage)[0].chemistryRating} 
                      />
                    </>
                  ) : (
                    <p>No data yet</p>
                  )}
                </Card>
              </Col>
            </Row>
            
            <div className="chart-container">
              <h2>ELO Rating History</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={prepareEloHistoryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="game" label={{ value: 'Games Played', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'ELO Rating', angle: -90, position: 'insideLeft' }} domain={[1400, 1600]} />
                  <Tooltip />
                  <Legend />
                  {getTopPlayers().map((player, index) => (
                    <Line 
                      key={player.name}
                      type="monotone" 
                      dataKey={player.name} 
                      stroke={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'][index % 5]} 
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-container">
              <h2>Top Partnerships by Win %</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getTopPartnerships().map(p => ({ name: p.players.join(' / '), value: parseFloat(p.winPercentage) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Win %', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabPane>
        
        <TabPane tab="Player Rankings" key="2">
          <Table 
            dataSource={players.filter(p => p.gamesPlayed > 0)} 
            columns={playerColumns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </TabPane>
        
        <TabPane tab="Partnership Stats" key="3">
          <Table 
            dataSource={partnerships.filter(p => p.gamesPlayed > 0)} 
            columns={partnershipColumns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </TabPane>
        
        <TabPane tab="Match Log" key="4">
          <Table 
            dataSource={matches} 
            columns={matchColumns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </TabPane>
        
        <TabPane tab="Add Match" key="5">
          <Form layout="vertical" className="match-form">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Date">
                  <DatePicker 
                    style={{ width: '100%' }}
                    onChange={(date, dateString) => setNewMatch({...newMatch, date: dateString})}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <h3>Team A</h3>
              </Col>
              <Col span={8}>
                <Form.Item label="Player 1">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select player"
                    onChange={(value) => setNewMatch({...newMatch, playerA1: value})}
                    value={newMatch.playerA1}
                  >
                    {players.filter(p => p.active).map(player => (
                      <Option key={player.id} value={player.name}>{player.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Player 2">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select player"
                    onChange={(value) => setNewMatch({...newMatch, playerA2: value})}
                    value={newMatch.playerA2}
                  >
                    {players.filter(p => p.active && p.name !== newMatch.playerA1).map(player => (
                      <Option key={player.id} value={player.name}>{player.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Score">
                  <Input 
                    type="number" 
                    min={0} 
                    max={6} 
                    onChange={(e) => setNewMatch({...newMatch, scoreA: e.target.value})}
                    value={newMatch.scoreA}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <h3>Team B</h3>
              </Col>
              <Col span={8}>
                <Form.Item label="Player 1">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select player"
                    onChange={(value) => setNewMatch({...newMatch, playerB1: value})}
                    value={newMatch.playerB1}
                  >
                    {players.filter(p => p.active && p.name !== newMatch.playerA1 && p.name !== newMatch.playerA2).map(player => (
                      <Option key={player.id} value={player.name}>{player.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Player 2">
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Select player"
                    onChange={(value) => setNewMatch({...newMatch, playerB2: value})}
                    value={newMatch.playerB2}
                  >
                    {players.filter(p => p.active && p.name !== newMatch.playerA1 && p.name !== newMatch.playerA2 && p.name !== newMatch.playerB1).map(player => (
                      <Option key={player.id} value={player.name}>{player.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Score">
                  <Input 
                    type="number" 
                    min={0} 
                    max={6} 
                    onChange={(e) => setNewMatch({...newMatch, scoreB: e.target.value})}
                    value={newMatch.scoreB}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Button type="primary" onClick={handleAddMatch}>
              Add Match
            </Button>
          </Form>
        </TabPane>
        
        <TabPane tab="Manage Players" key="6">
          <Row gutter={16}>
            <Col span={12}>
              <h3>Add New Player</h3>
              <Form layout="inline">
                <Form.Item label="Player Name">
                  <Input 
                    onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                    value={newPlayer.name}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleAddPlayer}>
                    Add Player
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col span={12}>
              <h3>All Players</h3>
              <Table 
                dataSource={players} 
                columns={[
                  {
                    title: 'Name',
                    dataIndex: 'name',
                    key: 'name',
                  },
                  {
                    title: 'Status',
                    dataIndex: 'active',
                    key: 'active',
                    render: (text, record) => record.active ? 'Active' : 'Inactive',
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (text, record) => (
                      <Button 
                        onClick={() => togglePlayerStatus(record)}
                      >
                        {record.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    ),
                  },
                ]}
                rowKey="id"
                pagination={false}
                size="small"
              />
            </Col>
          </Row>
        </TabPane>
      </Tabs>
      
      {/* Share Modal */}
      <Modal
        title="Share Paddle League Tracker"
        visible={shareModalVisible}
        onCancel={closeShareModal}
        footer={null}
      >
        <div className="share-modal-content">
          <p>Share this link with your paddle group!</p>
          <Input value={window.location.href} readOnly />
          <div className="share-buttons">
            <Button 
              type="primary" 
              icon={<WhatsAppOutlined />} 
              onClick={shareToWhatsApp}
              className="whatsapp-button"
            >
              Share to WhatsApp
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                notification.success({
                  message: 'Link Copied!',
                  description: 'Link has been copied to clipboard.',
                });
              }}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;
