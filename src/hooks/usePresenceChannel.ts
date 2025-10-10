import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceUser {
  peerId: string;
  username: string;
  timestamp: number;
}

export const usePresenceChannel = (peerId: string | null, username: string | null) => {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!peerId || !username) return;

    // Create a channel for peer presence
    const presenceChannel = supabase.channel('peer-discovery', {
      config: {
        presence: {
          key: peerId,
        },
      },
    });

    // Handle presence sync - fired when presence state changes
    presenceChannel.on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const users: PresenceUser[] = [];

      // Convert presence state to array of users
      Object.keys(state).forEach((key) => {
        const presences = state[key] as any[];
        if (presences && presences.length > 0) {
          const presence = presences[0];
          // Don't include self in the list
          if (presence.peerId !== peerId) {
            users.push({
              peerId: presence.peerId,
              username: presence.username,
              timestamp: presence.timestamp,
            });
          }
        }
      });

      setOnlineUsers(users);
    });

    // Handle new users joining
    presenceChannel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    });

    // Handle users leaving
    presenceChannel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    });

    // Subscribe and track presence
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Track our presence
        await presenceChannel.track({
          peerId,
          username,
          timestamp: Date.now(),
        });
        console.log('Tracked presence:', { peerId, username });
      }
    });

    setChannel(presenceChannel);

    // Cleanup on unmount
    return () => {
      presenceChannel.untrack();
      presenceChannel.unsubscribe();
    };
  }, [peerId, username]);

  return { onlineUsers, channel };
};
