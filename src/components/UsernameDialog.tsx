
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePeer } from '@/context/PeerContext';

export const UsernameDialog: React.FC = () => {
  const { username, setUsername, announcePresence } = usePeer();
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Show dialog if username is not set
    if (!username) {
      setOpen(true);
    }
  }, [username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (inputValue.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    setUsername(inputValue);
    setOpen(false);
    
    // Announce presence to network with new username
    setTimeout(() => {
      announcePresence();
    }, 500);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set your device name</DialogTitle>
          <DialogDescription>
            This name will be visible to other users when sharing files.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter a username"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError('');
                }}
                className={error ? "border-red-300" : ""}
                autoFocus
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
