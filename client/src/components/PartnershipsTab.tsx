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
  Users, 
  TrendingUp, 
  Zap,
  Heart,
  ThumbsUp,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const PartnershipsTab = () => {
  const { partnerships, players } = usePadelContext();
  const [sortBy, setSortBy] = useState<'chemistry' | 'winrate' | 'games' | 'pointdiff'>('chemistry');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleSort = (column: 'chemistry' | 'winrate' | 'games' | 'pointdiff') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const filteredPartnerships = partnerships.filter(p => {
    if (!searchTerm) return true;
    return p.players.some(player => 
      player.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const sortedPartnerships = [...filteredPartnerships].sort((a, b) => {
    let sortValueA = 0;
    let sortValueB = 0;
    
    switch (sortBy) {
      case 'chemistry':
        sortValueA = parseFloat(a.chemistryRating || '0');
        sortValueB = parseFloat(b.chemistryRating || '0');
        break;
      case 'winrate':
        sortValueA = parseFloat(a.winPercentage || '0');
        sortValueB = parseFloat(b.winPercentage || '0');
        break;
      case 'games':
        sortValueA = a.gamesPlayed || 0;
        sortValueB = b.gamesPlayed || 0;
        break;
      case 'pointdiff':
        sortValueA = a.pointDiff || 0;
        sortValueB = b.pointDiff || 0;
        break;
    }
    
    return sortOrder === 'asc' ? sortValueA - sortValueB : sortValueB - sortValueA;
  });

  // Find best chemistry partnership
  const bestChemistry = partnerships.length > 0 
    ? [...partnerships].sort((a, b) => 
        parseFloat(b.chemistryRating || '0') - parseFloat(a.chemistryRating || '0')
      )[0] 
    : null;

  // Find highest win rate partnership
  const bestWinRate = partnerships.length > 0 
    ? [...partnerships].sort((a, b) => 
        parseFloat(b.winPercentage || '0') - parseFloat(a.winPercentage || '0')
      )[0] 
    : null;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-500" />
              Total Partnerships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{partnerships.length}</div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
              Best Chemistry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {bestChemistry ? bestChemistry.players.join(' & ') : 'N/A'}
            </div>
            <div className="text-3xl font-bold">
              {bestChemistry ? bestChemistry.chemistryRating : 'N/A'}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ThumbsUp className="h-5 w-5 mr-2 text-purple-500" />
              Highest Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              {bestWinRate ? bestWinRate.players.join(' & ') : 'N/A'}
            </div>
            <div className="text-3xl font-bold">
              {bestWinRate ? bestWinRate.winPercentage + '%' : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Partnerships</CardTitle>
          <div className="mt-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search partnerships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partnership</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('chemistry')}>
                  Chemistry {sortBy === 'chemistry' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('winrate')}>
                  Win % {sortBy === 'winrate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('games')}>
                  Matches {sortBy === 'games' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>W/L</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort('pointdiff')}>
                  Point Diff {sortBy === 'pointdiff' && (sortOrder === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPartnerships.map((partnership, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex -space-x-2 mr-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white z-10">
                          <span className="text-xs font-medium text-blue-800">
                            {partnership.players[0].charAt(0)}
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-xs font-medium text-emerald-800">
                            {partnership.players[1].charAt(0)}
                          </span>
                        </div>
                      </div>
                      <span className="font-medium">
                        {partnership.players.join(' & ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Heart className={`h-4 w-4 mr-1 ${
                        parseFloat(partnership.chemistryRating) >= 110 ? 'text-red-500' :
                        parseFloat(partnership.chemistryRating) >= 100 ? 'text-emerald-500' : 'text-gray-400'
                      }`} />
                      <span className={`font-semibold ${
                        parseFloat(partnership.chemistryRating) >= 110 ? 'text-red-600' :
                        parseFloat(partnership.chemistryRating) >= 100 ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {partnership.chemistryRating}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {partnership.winPercentage}%
                  </TableCell>
                  <TableCell>{partnership.gamesPlayed}</TableCell>
                  <TableCell>{partnership.wins}/{partnership.losses}</TableCell>
                  <TableCell className={`font-semibold ${
                    (partnership.pointDiff || 0) > 0 ? 'text-emerald-600' : 
                    (partnership.pointDiff || 0) < 0 ? 'text-red-600' : ''
                  }`}>
                    {(partnership.pointDiff || 0) > 0 ? '+' : ''}
                    {partnership.pointDiff || 0}
                  </TableCell>
                </TableRow>
              ))}
              {filteredPartnerships.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {partnerships.length === 0 
                      ? 'No partnerships found. Play some matches first!'
                      : 'No partnerships found matching your search.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnershipsTab;
