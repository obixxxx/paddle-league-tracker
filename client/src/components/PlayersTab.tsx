import { useState } from 'react';
import { usePadelContext } from '@/hooks/usePadelContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCircle2, TrendingUp, Trophy, BarChart3, Pencil } from 'lucide-react';
import EditPlayerDialog from './EditPlayerDialog';
import { Player } from '@/types';

const PlayersTab = () => {
  const { players, addPlayer } = usePadelContext();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [sortBy, setSortBy] = useState<'elo' | 'games' | 'wins' | 'percentage' | 'pointDiff' | 'power'>('elo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };
  
  const handleEditPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setIsEditDialogOpen(true);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    let sortValueA = 0;
    let sortValueB = 0;
    
    switch (sortBy) {
      case 'elo':
        sortValueA = a.elo || 1500;
        sortValueB = b.elo || 1500;
        break;
      case 'games':
        sortValueA = a.gamesPlayed || 0;
        sortValueB = b.gamesPlayed || 0;
        break;
      case 'wins':
        sortValueA = a.wins || 0;
        sortValueB = b.wins || 0;
        break;
      case 'percentage':
        sortValueA = parseFloat(a.winPercentage || '0');
        sortValueB = parseFloat(b.winPercentage || '0');
        break;
      case 'pointDiff':
        sortValueA = a.pointDiff || 0;
        sortValueB = b.pointDiff || 0;
        break;
      case 'power':
        sortValueA = a.powerRanking || 0;
        sortValueB = b.powerRanking || 0;
        break;
    }
    
    return sortOrder === 'asc' ? sortValueA - sortValueB : sortValueB - sortValueA;
  });

  const toggleSort = (column: 'elo' | 'games' | 'wins' | 'percentage' | 'pointDiff' | 'power') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Total Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
              Average ELO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {players.length > 0 
                ? Math.round(players.reduce((sum, player) => sum + (player.elo || 1500), 0) / players.length) 
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
              Average Win %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {players.length > 0 
                ? Math.round(players.reduce((sum, player) => sum + parseFloat(player.winPercentage || '0'), 0) / players.length) + '%'
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Player</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Player Name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('elo')}>
                  ELO Rating {sortBy === 'elo' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('power')}>
                  Power Rank {sortBy === 'power' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('games')}>
                  Matches {sortBy === 'games' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('wins')}>
                  W/L {sortBy === 'wins' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('percentage')}>
                  Win % {sortBy === 'percentage' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Points F/A</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('pointDiff')}>
                  Point Diff {sortBy === 'pointDiff' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                        <UserCircle2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">{player.name}</span>
                      {!player.active && (
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-emerald-600">{player.elo || 1500}</TableCell>
                  <TableCell className="font-semibold text-purple-600">{(player.powerRanking || 0).toFixed(1)}</TableCell>
                  <TableCell>{player.gamesPlayed || 0}</TableCell>
                  <TableCell>{(player.wins || 0)}/{(player.losses || 0)}</TableCell>
                  <TableCell>{player.winPercentage || '0'}%</TableCell>
                  <TableCell>{(player.pointsFor || 0)}/{(player.pointsAgainst || 0)}</TableCell>
                  <TableCell className={`${(player.pointDiff || 0) > 0 ? 'text-emerald-600' : (player.pointDiff || 0) < 0 ? 'text-red-600' : ''}`}>
                    {(player.pointDiff || 0) > 0 ? '+' : ''}{player.pointDiff || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditPlayer(player)}
                      className="h-8 w-8 p-0"
                      aria-label="Edit player"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {players.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No players found. Add your first player above.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Player Dialog */}
      <EditPlayerDialog 
        player={selectedPlayer}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedPlayer(null);
        }}
      />
    </div>
  );
};

export default PlayersTab;
