import { useState } from 'react';
import { usePadelContext } from '@/hooks/usePadelContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Trophy, Shield, Calculator, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const NewMatchTab = () => {
  const { players, addMatch } = usePadelContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    playerA1: '',
    playerA2: '',
    playerB1: '',
    playerB2: '',
    scoreA: '',
    scoreB: ''
  });
  
  const [eloPreview, setEloPreview] = useState<{
    teamA: number | null;
    teamB: number | null;
    changeA: number | null;
    changeB: number | null;
  }>({
    teamA: null,
    teamB: null,
    changeA: null,
    changeB: null
  });
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset ELO preview if players or scores change
    setEloPreview({
      teamA: null,
      teamB: null,
      changeA: null,
      changeB: null
    });
  };

  const calculateEloPreview = () => {
    const { playerA1, playerA2, playerB1, playerB2, scoreA, scoreB } = formData;
    
    // Validate all fields are filled
    if (!playerA1 || !playerA2 || !playerB1 || !playerB2 || !scoreA || !scoreB) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all players and scores to calculate ELO preview",
        variant: "destructive"
      });
      return;
    }
    
    // Check no duplicate players
    const allPlayers = [playerA1, playerA2, playerB1, playerB2];
    if (new Set(allPlayers).size !== 4) {
      toast({
        title: "Duplicate Players",
        description: "Each player can only play once in a match",
        variant: "destructive"
      });
      return;
    }
    
    // Find player ELOs
    const pA1 = players.find(p => p.name === playerA1);
    const pA2 = players.find(p => p.name === playerA2);
    const pB1 = players.find(p => p.name === playerB1);
    const pB2 = players.find(p => p.name === playerB2);
    
    if (!pA1 || !pA2 || !pB1 || !pB2) {
      toast({
        title: "Player Not Found",
        description: "One or more selected players could not be found",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate team ELOs
    const teamAElo = ((pA1.elo || 1500) + (pA2.elo || 1500)) / 2;
    const teamBElo = ((pB1.elo || 1500) + (pB2.elo || 1500)) / 2;
    
    // Calculate expected win probability
    const expectedA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400));
    const expectedB = 1 - expectedA;
    
    // Actual result (1 for win, 0 for loss)
    const actualA = parseInt(scoreA) > parseInt(scoreB) ? 1 : 0;
    const actualB = parseInt(scoreB) > parseInt(scoreA) ? 1 : 0;
    
    // Calculate margin-of-victory multiplier
    const scoreDiff = Math.abs(parseInt(scoreA) - parseInt(scoreB));
    const movMultiplier = Math.min(1.5, 1 + (scoreDiff / 12)); // Cap at 1.5x
    
    // K-factor (importance of match)
    const K_FACTOR = 20;
    
    // Calculate ELO changes
    const eloChangeA = Math.round(K_FACTOR * movMultiplier * (actualA - expectedA));
    const eloChangeB = Math.round(K_FACTOR * movMultiplier * (actualB - expectedB));
    
    setEloPreview({
      teamA: Math.round(teamAElo),
      teamB: Math.round(teamBElo),
      changeA: eloChangeA,
      changeB: eloChangeB
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { date, playerA1, playerA2, playerB1, playerB2, scoreA, scoreB } = formData;
    
    // Validate inputs
    if (!date || !playerA1 || !playerA2 || !playerB1 || !playerB2 || !scoreA || !scoreB) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    // Check no duplicate players
    const allPlayers = [playerA1, playerA2, playerB1, playerB2];
    if (new Set(allPlayers).size !== 4) {
      toast({
        title: "Duplicate players",
        description: "A player cannot be selected more than once",
        variant: "destructive"
      });
      return;
    }
    
    // Parse scores
    const scoreANum = parseInt(scoreA);
    const scoreBNum = parseInt(scoreB);
    
    if (isNaN(scoreANum) || isNaN(scoreBNum) || scoreANum < 0 || scoreBNum < 0) {
      toast({
        title: "Invalid scores",
        description: "Scores must be positive numbers",
        variant: "destructive"
      });
      return;
    }
    
    // Add match
    addMatch({
      date,
      playerA1,
      playerA2,
      playerB1,
      playerB2,
      scoreA: scoreANum,
      scoreB: scoreBNum
    });
    
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      playerA1: '',
      playerA2: '',
      playerB1: '',
      playerB2: '',
      scoreA: '',
      scoreB: ''
    });
    
    setEloPreview({
      teamA: null,
      teamB: null,
      changeA: null,
      changeB: null
    });
    
    toast({
      title: "Match Added",
      description: "The match has been recorded successfully"
    });
  };
  
  // Check for invalid player selections (duplicates)
  const hasDuplicatePlayers = () => {
    const { playerA1, playerA2, playerB1, playerB2 } = formData;
    const selectedPlayers = [playerA1, playerA2, playerB1, playerB2].filter(p => p);
    return selectedPlayers.length !== new Set(selectedPlayers).size;
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>Record a new match for the league</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="date">Match Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Trophy className="h-4 w-4 mr-2 text-emerald-500" />
                  Team A
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playerA1">Player 1</Label>
                    <Select 
                      value={formData.playerA1} 
                      onValueChange={(value) => handleInputChange('playerA1', value)}
                    >
                      <SelectTrigger id="playerA1">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player, i) => (
                          <SelectItem key={i} value={player.name}>{player.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="playerA2">Player 2</Label>
                    <Select 
                      value={formData.playerA2} 
                      onValueChange={(value) => handleInputChange('playerA2', value)}
                    >
                      <SelectTrigger id="playerA2">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player, i) => (
                          <SelectItem key={i} value={player.name}>{player.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scoreA">Score</Label>
                  <Input 
                    id="scoreA" 
                    type="number" 
                    min="0"
                    placeholder="Team A score" 
                    value={formData.scoreA}
                    onChange={(e) => handleInputChange('scoreA', e.target.value)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-blue-500" />
                  Team B
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playerB1">Player 1</Label>
                    <Select 
                      value={formData.playerB1} 
                      onValueChange={(value) => handleInputChange('playerB1', value)}
                    >
                      <SelectTrigger id="playerB1">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player, i) => (
                          <SelectItem key={i} value={player.name}>{player.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="playerB2">Player 2</Label>
                    <Select 
                      value={formData.playerB2} 
                      onValueChange={(value) => handleInputChange('playerB2', value)}
                    >
                      <SelectTrigger id="playerB2">
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player, i) => (
                          <SelectItem key={i} value={player.name}>{player.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scoreB">Score</Label>
                  <Input 
                    id="scoreB" 
                    type="number" 
                    min="0"
                    placeholder="Team B score" 
                    value={formData.scoreB}
                    onChange={(e) => handleInputChange('scoreB', e.target.value)}
                  />
                </div>
              </div>
              
              {hasDuplicatePlayers() && (
                <div className="flex items-center p-3 text-amber-800 bg-amber-50 rounded-md">
                  <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
                  <span>A player cannot be selected more than once</span>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={calculateEloPreview}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Preview ELO Change
                </Button>
                <Button type="submit" disabled={hasDuplicatePlayers()}>Save Match</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>ELO Preview</CardTitle>
            <CardDescription>See how this match will affect player ratings</CardDescription>
          </CardHeader>
          <CardContent>
            {eloPreview.teamA !== null ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Team A Current ELO</h3>
                    <div className="text-2xl font-bold">{eloPreview.teamA}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm text-gray-500 mb-1">Team B Current ELO</h3>
                    <div className="text-2xl font-bold">{eloPreview.teamB}</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Projected ELO Changes</h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{formData.playerA1}</div>
                        <div className="text-sm text-gray-500">Team A Player 1</div>
                      </div>
                      <div className={`text-lg font-bold ${eloPreview.changeA && eloPreview.changeA > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {eloPreview.changeA && eloPreview.changeA > 0 ? '+' : ''}{eloPreview.changeA}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{formData.playerA2}</div>
                        <div className="text-sm text-gray-500">Team A Player 2</div>
                      </div>
                      <div className={`text-lg font-bold ${eloPreview.changeA && eloPreview.changeA > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {eloPreview.changeA && eloPreview.changeA > 0 ? '+' : ''}{eloPreview.changeA}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{formData.playerB1}</div>
                        <div className="text-sm text-gray-500">Team B Player 1</div>
                      </div>
                      <div className={`text-lg font-bold ${eloPreview.changeB && eloPreview.changeB > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {eloPreview.changeB && eloPreview.changeB > 0 ? '+' : ''}{eloPreview.changeB}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 rounded-lg border">
                      <div>
                        <div className="font-medium">{formData.playerB2}</div>
                        <div className="text-sm text-gray-500">Team B Player 2</div>
                      </div>
                      <div className={`text-lg font-bold ${eloPreview.changeB && eloPreview.changeB > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {eloPreview.changeB && eloPreview.changeB > 0 ? '+' : ''}{eloPreview.changeB}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                  <p className="font-medium mb-1">How ELO is calculated:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Base team rating is the average of both players</li>
                    <li>Margin of victory influences rating changes</li>
                    <li>Bigger upsets result in larger rating swings</li>
                    <li>Both players on a team gain/lose the same ELO</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Calculator className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-2">Fill out the match details and click "Preview ELO Change"</p>
                <p className="text-sm text-gray-400">This will show you how the match will affect player ratings</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default NewMatchTab;
