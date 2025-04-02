import { useState } from 'react';
import { usePadelContext } from '@/hooks/usePadelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Trophy, 
  Calendar, 
  Zap,
  Search,
  ArrowUpDown,
  Pencil
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import EditMatchDialog from './EditMatchDialog';
import { Match } from '@/types';

const MatchesTab = () => {
  const { matches, players } = usePadelContext();
  const [sortBy, setSortBy] = useState<'date' | 'margin'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [playerFilter, setPlayerFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleEditMatch = (match: Match) => {
    setSelectedMatch(match);
    setIsEditDialogOpen(true);
  };
  
  const toggleSort = (column: 'date' | 'margin') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc'); // Default to descending when changing columns
    }
  };

  const filteredMatches = matches.filter(match => {
    const searchMatches = !searchTerm || [
      match.playerA1, 
      match.playerA2, 
      match.playerB1, 
      match.playerB2
    ].some(player => player.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const playerMatches = playerFilter === 'all' || [
      match.playerA1, 
      match.playerA2, 
      match.playerB1, 
      match.playerB2
    ].includes(playerFilter);
    
    return searchMatches && playerMatches;
  });

  const sortedMatches = [...filteredMatches].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      // Sort by margin
      const marginA = Math.abs(a.scoreA - a.scoreB);
      const marginB = Math.abs(b.scoreA - b.scoreB);
      return sortOrder === 'asc' ? marginA - marginB : marginB - marginA;
    }
  });

  // Calculate highest scoring match
  const highestScoringMatch = matches.length > 0 
    ? matches.reduce((highest, match) => {
        const totalScore = match.scoreA + match.scoreB;
        return totalScore > (highest.scoreA + highest.scoreB) ? match : highest;
      }, matches[0])
    : null;

  // Calculate largest margin of victory
  const largestMarginMatch = matches.length > 0
    ? matches.reduce((largest, match) => {
        const margin = Math.abs(match.scoreA - match.scoreB);
        const largestMargin = Math.abs(largest.scoreA - largest.scoreB);
        return margin > largestMargin ? match : largest;
      }, matches[0])
    : null;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{matches.length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-orange-500" />
              Highest Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            {highestScoringMatch ? (
              <>
                <div className="text-sm text-gray-500">
                  {highestScoringMatch.playerA1}/{highestScoringMatch.playerA2} vs {highestScoringMatch.playerB1}/{highestScoringMatch.playerB2}
                </div>
                <div className="text-3xl font-bold">
                  {highestScoringMatch.scoreA}-{highestScoringMatch.scoreB}
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold">N/A</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ArrowUpDown className="h-5 w-5 mr-2 text-purple-500" />
              Largest Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            {largestMarginMatch ? (
              <>
                <div className="text-sm text-gray-500">
                  {largestMarginMatch.scoreA > largestMarginMatch.scoreB 
                    ? `${largestMarginMatch.playerA1}/${largestMarginMatch.playerA2}` 
                    : `${largestMarginMatch.playerB1}/${largestMarginMatch.playerB2}`} victory
                </div>
                <div className="text-3xl font-bold">
                  {Math.abs(largestMarginMatch.scoreA - largestMarginMatch.scoreB)} points
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold">N/A</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Match History</CardTitle>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={playerFilter} onValueChange={setPlayerFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by player" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Players</SelectItem>
                {players.map((player, i) => (
                  <SelectItem key={i} value={player.name}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('date')}>
                  Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Team A</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Team B</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('margin')}>
                  Margin {sortBy === 'margin' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>ELO Change</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedMatches.map((match, index) => {
                const teamAWon = match.scoreA > match.scoreB;
                const margin = Math.abs(match.scoreA - match.scoreB);
                
                return (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(match.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </div>
                    </TableCell>
                    <TableCell className={teamAWon ? 'font-medium text-emerald-600' : ''}>
                      {match.playerA1} & {match.playerA2}
                    </TableCell>
                    <TableCell className="font-bold">
                      {match.scoreA} - {match.scoreB}
                    </TableCell>
                    <TableCell className={!teamAWon ? 'font-medium text-emerald-600' : ''}>
                      {match.playerB1} & {match.playerB2}
                    </TableCell>
                    <TableCell className="font-medium">
                      {margin} {margin === 1 ? 'point' : 'points'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={teamAWon ? 'text-emerald-600' : 'text-red-600'}>
                          {teamAWon ? '+' : ''}{match.eloChangeA1}
                        </span>
                        <span className={!teamAWon ? 'text-emerald-600' : 'text-red-600'}>
                          {!teamAWon ? '+' : ''}{match.eloChangeB1}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditMatch(match)}
                        className="h-8 w-8 p-0"
                        aria-label="Edit match"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredMatches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    {matches.length === 0 
                      ? 'No matches recorded yet. Add your first match in the New Match tab.'
                      : 'No matches found matching your search criteria.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    
      {/* Edit Match Dialog */}
      <EditMatchDialog 
        match={selectedMatch}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedMatch(null);
        }}
      />
    </div>
  );
};

export default MatchesTab;
