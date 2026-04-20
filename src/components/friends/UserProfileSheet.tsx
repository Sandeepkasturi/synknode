import React from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserProfile } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { Send, MessageCircle, Phone, UserPlus, Users } from "lucide-react";
import { motion } from "framer-motion";
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";

interface UserProfileSheetProps {
  profile: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChat?: (uid: string) => void;
  onCall?: (uid: string) => void;
  onSendFile?: (profile: UserProfile) => void;
}

export const UserProfileSheet: React.FC<UserProfileSheetProps> = ({
  profile,
  open,
  onOpenChange,
  onChat,
  onCall,
  onSendFile,
}) => {
  const { isFriend, sendFriendRequest } = useFriends();

  if (!profile) return null;

  const alreadyFriend = isFriend(profile.uid);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#111118] border-t border-border/30 rounded-t-2xl pb-8">
        <SheetHeader className="pb-0" />

        <div className="flex flex-col items-center gap-4 pt-4">
          {/* Profile Photo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Avatar className="w-24 h-24 border-2 border-primary/30">
              <AvatarImage src={profile.photoURL ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-semibold">
                {profile.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Username & display name */}
          <div className="text-center">
            <h3 className="text-xl font-display font-bold text-foreground">@{profile.username}</h3>
            <p className="text-sm text-muted-foreground">{profile.displayName}</p>
          </div>

          {/* Stats row */}
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{profile.totalShares}</p>
              <p className="text-xs text-muted-foreground">Shares</p>
            </div>
            {profile.shareStreak > 0 && (
              <div>
                <p className="text-lg font-bold text-amber-400">🔥 {profile.shareStreak}</p>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full max-w-xs">
            {onSendFile && alreadyFriend && (
              <Button
                className="flex-1 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
                onClick={() => { onSendFile(profile); onOpenChange(false); }}
              >
                <Send className="h-4 w-4 mr-2" />
                Send File
              </Button>
            )}

            {onChat && (
              <Button
                className="flex-1 bg-secondary/40 border border-border/50 hover:bg-secondary/60"
                variant="ghost"
                onClick={() => { onChat(profile.uid); onOpenChange(false); }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            )}

            {/* Call — Coming Soon */}
            {alreadyFriend && (
              <ComingSoonOverlay feature="Audio calling">
                <Button
                  className="flex-1 bg-secondary/40 border border-border/50"
                  variant="ghost"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </ComingSoonOverlay>
            )}
          </div>

          {/* Friend Request button if not already friends */}
          {!alreadyFriend && (
            <Button
              className="w-full max-w-xs bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20"
              onClick={() => sendFriendRequest(profile.uid)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Send Friend Request
            </Button>
          )}

          {alreadyFriend && (
            <div className="flex items-center gap-2 text-xs text-[#00D68F]">
              <Users className="h-3.5 w-3.5" />
              You are friends
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
