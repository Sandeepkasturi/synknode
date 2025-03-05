
import React from 'react';
import { usePeer } from '@/context/PeerContext';
import { Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

export const DeviceStatusBadge: React.FC = () => {
  const { username, setUsername, peerId } = usePeer();
  const [newUsername, setNewUsername] = useState(username || '');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUsernameUpdate = () => {
    if (newUsername.trim()) {
      setUsername(newUsername.trim());
      toast.success("Username updated successfully!");
      setDialogOpen(false);
    } else {
      toast.error("Username cannot be empty");
    }
  };

  return (
    <div className="text-center mb-4 sm:mb-6">
      <div className="inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 shadow-sm border border-white/60">
        <span className="relative flex h-2 w-2 mr-1.5 sm:mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[150px] sm:max-w-none">
          Online as <span className="font-medium text-indigo-800">{username || 'Anonymous'}</span>
        </span>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="ml-1.5 p-1 text-gray-400 hover:text-indigo-500 transition-colors">
              <Edit className="h-3 w-3" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              {peerId && (
                <div className="grid gap-2">
                  <Label htmlFor="peerid">Your ID (Read-only)</Label>
                  <Input 
                    id="peerid" 
                    value={peerId} 
                    readOnly
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">This is your unique identifier on the network</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUsernameUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
