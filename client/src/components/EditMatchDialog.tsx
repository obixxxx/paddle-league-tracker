import { useState, useEffect } from 'react';
import { Match, Player } from '@/types';
import { usePadelContext } from '@/hooks/usePadelContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface EditMatchDialogProps {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditMatchDialog = ({ match, isOpen, onClose }: EditMatchDialogProps) => {
  const { players, updateMatch, deleteMatch } = usePadelContext();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [playerA1, setPlayerA1] = useState('');
  const [playerA2, setPlayerA2] = useState('');
  const [playerB1, setPlayerB1] = useState('');
  const [playerB2, setPlayerB2] = useState('');
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activePlayers, setActivePlayers] = useState<Player[]>([]);
  
  // Reset form when dialog opens with a new match
  useEffect(() => {
    if (match) {
      setDate(new Date(match.date));
      setPlayerA1(match.playerA1);
      setPlayerA2(match.playerA2);
      setPlayerB1(match.playerB1);
      setPlayerB2(match.playerB2);
      setScoreA(match.scoreA);
      setScoreB(match.scoreB);
    }
    
    // Filter active players
    setActivePlayers(players.filter(p => p.active));
  }, [match, players]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!match || !date) return;
    
    updateMatch(match.id, {
      date: format(date, 'yyyy-MM-dd'),
      playerA1,
      playerA2,
      playerB1,
      playerB2,
      scoreA,
      scoreB
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    if (!match) return;
    
    deleteMatch(match.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };
  
  const handleCancel = () => {
    setIsDeleteConfirmOpen(false);
    onClose();
  };
  
  // Filter players that are already selected for other positions
  const getAvailablePlayers = (currentPosition: string) => {
    const selectedPlayers = [playerA1, playerA2, playerB1, playerB2].filter(Boolean);
    
    // If this is the current position's value, it should remain available
    if (currentPosition && selectedPlayers.includes(currentPosition)) {
      return activePlayers;
    }
    
    return activePlayers.filter(player => !selectedPlayers.includes(player.name));
  };
  
  if (!match) return null;
  
  // If we're showing the delete confirmation
  if (isDeleteConfirmOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-amber-600">
              <AlertTriangle className="h-5 w-5 mr-2" /> Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this match?
              <p className="mt-2">
                {match.playerA1} & {match.playerA2} vs {match.playerB1} & {match.playerB2} ({match.scoreA}-{match.scoreB})
              </p>
              <p className="mt-2 text-amber-600 font-medium">
                Player ELO ratings will be adjusted to reverse the effect of this match.
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Normal edit dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Match</DialogTitle>
          <DialogDescription>
            Update the match details below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Team A</Label>
              
              <div className="space-y-2">
                <Select value={playerA1} onValueChange={setPlayerA1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Player 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {activePlayers.map((player) => (
                      <SelectItem key={player.id} value={player.name}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={playerA2} 
                  onValueChange={setPlayerA2}
                  disabled={!playerA1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Player 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(playerA2).map((player) => (
                      <SelectItem 
                        key={player.id} 
                        value={player.name}
                        disabled={player.name === playerA1}
                      >
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Label htmlFor="scoreA">Score</Label>
                <Input
                  id="scoreA"
                  type="number"
                  min={0}
                  max={9}
                  value={scoreA}
                  onChange={(e) => setScoreA(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Team B</Label>
              
              <div className="space-y-2">
                <Select 
                  value={playerB1} 
                  onValueChange={setPlayerB1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Player 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(playerB1).map((player) => (
                      <SelectItem 
                        key={player.id} 
                        value={player.name}
                        disabled={player.name === playerA1 || player.name === playerA2}
                      >
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select 
                  value={playerB2} 
                  onValueChange={setPlayerB2}
                  disabled={!playerB1}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Player 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailablePlayers(playerB2).map((player) => (
                      <SelectItem 
                        key={player.id} 
                        value={player.name}
                        disabled={
                          player.name === playerA1 || 
                          player.name === playerA2 || 
                          player.name === playerB1
                        }
                      >
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-2">
                <Label htmlFor="scoreB">Score</Label>
                <Input
                  id="scoreB"
                  type="number"
                  min={0}
                  max={9}
                  value={scoreB}
                  onChange={(e) => setScoreB(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-between">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              Delete
            </Button>
            
            <div className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={
                  !date || 
                  !playerA1 || 
                  !playerA2 || 
                  !playerB1 || 
                  !playerB2 || 
                  (scoreA === 0 && scoreB === 0)
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMatchDialog;