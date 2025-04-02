import { useState, useEffect } from 'react';
import { Player } from '@/types';
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
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';

interface EditPlayerDialogProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditPlayerDialog = ({ player, isOpen, onClose }: EditPlayerDialogProps) => {
  const { updatePlayer, deletePlayer } = usePadelContext();
  const [name, setName] = useState('');
  const [active, setActive] = useState(true);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Reset form when dialog opens with a new player
  useEffect(() => {
    if (player) {
      setName(player.name);
      setActive(player.active);
    }
  }, [player]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!player) return;
    
    updatePlayer(player.id, {
      name,
      active
    });
    
    onClose();
  };
  
  const handleDelete = () => {
    if (!player) return;
    
    deletePlayer(player.id);
    setIsDeleteConfirmOpen(false);
    onClose();
  };
  
  const handleCancel = () => {
    setIsDeleteConfirmOpen(false);
    onClose();
  };
  
  if (!player) return null;
  
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
              Are you sure you want to delete {player.name}?
              {player.gamesPlayed && player.gamesPlayed > 0 && (
                <p className="mt-2 text-amber-600 font-medium">
                  This player has played in matches. Deleting this player may affect match history.
                </p>
              )}
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Player</DialogTitle>
          <DialogDescription>
            Update the player's information below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="active">Active</Label>
            <Switch 
              id="active" 
              checked={active} 
              onCheckedChange={setActive} 
            />
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
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlayerDialog;