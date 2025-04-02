import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Player, Match } from '@/types';

interface ChartSectionProps {
  activeTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  players: Player[];
  matches: Match[];
}

const ChartSection: React.FC<ChartSectionProps> = ({ 
  activeTimeframe, 
  onTimeframeChange,
  players,
  matches
}) => {
  // Generate color based on player name
  const getPlayerColor = (name: string) => {
    const colors = [
      '#10B981', // emerald-500
      '#3B82F6', // blue-500
      '#8B5CF6', // purple-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#06B6D4', // cyan-500
      '#EC4899', // pink-500
      '#84CC16', // lime-500
    ];
    
    // Simple hash function to determine color
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + acc;
    }, 0);
    
    return colors[hash % colors.length];
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    // Sort matches by date (oldest first)
    const sortedMatches = [...matches].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Limit to last 5 matches if recent timeframe
    const filteredMatches = activeTimeframe === 'recent' 
      ? sortedMatches.slice(-5) 
      : sortedMatches;
    
    // Track ELO changes for each player
    const playerEloHistory: Record<string, {elo: number, matches: Array<{match: number, elo: number}>}> = {};
    
    // Initialize with starting ELO
    players.forEach(player => {
      playerEloHistory[player.name] = {
        elo: 1500, // Start with initial ELO
        matches: []
      };
    });
    
    // Calculate ELO changes over matches
    filteredMatches.forEach((match, index) => {
      // Team A players
      [match.playerA1, match.playerA2].forEach(player => {
        if (playerEloHistory[player]) {
          playerEloHistory[player].elo += match.eloChangeA1;
          playerEloHistory[player].matches.push({
            match: index + 1,
            elo: playerEloHistory[player].elo
          });
        }
      });
      
      // Team B players
      [match.playerB1, match.playerB2].forEach(player => {
        if (playerEloHistory[player]) {
          playerEloHistory[player].elo += match.eloChangeB1;
          playerEloHistory[player].matches.push({
            match: index + 1,
            elo: playerEloHistory[player].elo
          });
        }
      });
    });
    
    // Prepare data points for chart
    const formattedData: Array<Record<string, any>> = [];
    
    // Get the max number of matches for any player
    const maxMatches = Math.max(...Object.values(playerEloHistory).map(history => history.matches.length));
    
    // Create data points for each match
    for (let i = 0; i < maxMatches; i++) {
      const dataPoint: Record<string, any> = { 
        name: `Match ${i + 1}` 
      };
      
      // Add data for each player
      Object.entries(playerEloHistory).forEach(([playerName, history]) => {
        if (history.matches[i]) {
          dataPoint[playerName] = history.matches[i].elo;
        }
      });
      
      formattedData.push(dataPoint);
    }
    
    return formattedData;
  }, [matches, players, activeTimeframe]);

  // Get players who have played in the displayed matches
  const activePlayers = useMemo(() => {
    if (chartData.length === 0) return [];
    
    // Get keys from the last data point excluding 'name'
    const lastDataPoint = chartData[chartData.length - 1];
    return Object.keys(lastDataPoint)
      .filter(key => key !== 'name')
      .sort((a, b) => 
        // Sort by last ELO, highest first
        (lastDataPoint[b] || 0) - (lastDataPoint[a] || 0)
      );
  }, [chartData]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">ELO Rating History</h2>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md cursor-pointer ${
              activeTimeframe === 'recent' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onTimeframeChange('recent')}
          >
            Last 5 Matches
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md cursor-pointer ${
              activeTimeframe === 'allTime' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => onTimeframeChange('allTime')}
          >
            All Time
          </button>
        </div>
      </div>
      
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[1400, 'auto']} />
              <Tooltip />
              <Legend />
              {activePlayers.map(player => (
                <Line
                  key={player}
                  type="monotone"
                  dataKey={player}
                  name={player}
                  stroke={getPlayerColor(player)}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">No match data available to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartSection;
