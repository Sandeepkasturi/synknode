import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth, UserProfile } from "@/context/AuthContext";
import { ShieldX } from "lucide-react";
import { toast } from "sonner";

interface BlockedUser {
  blockId: string;
  profile: UserProfile | null;
}

interface BlockedUsersScreenProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BlockedUsersScreen: React.FC<BlockedUsersScreenProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBlockedUsers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "blocks"), where("blockerId", "==", user.uid));
      const snap = await getDocs(q);
      const result: BlockedUser[] = [];
      for (const d of snap.docs) {
        const data = d.data();
        const profSnap = await getDoc(doc(db, "users", data.blockedId));
        result.push({
          blockId: d.id,
          profile: profSnap.exists() ? (profSnap.data() as UserProfile) : null,
        });
      }
      setBlockedUsers(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadBlockedUsers();
  }, [open]);

  const unblock = async (blockId: string) => {
    await deleteDoc(doc(db, "blocks", blockId));
    setBlockedUsers((prev) => prev.filter((b) => b.blockId !== blockId));
    toast.success("User unblocked");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[#111118] border-t border-border/30 rounded-t-2xl pb-10 max-h-[70vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-foreground">
            <ShieldX className="h-5 w-5 text-muted-foreground" />
            Blocked Users
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-2">
          {blockedUsers.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-8">No blocked users.</p>
          )}
          {blockedUsers.map((bu) => (
            <div key={bu.blockId} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/40">
              <Avatar className="w-10 h-10">
                <AvatarImage src={bu.profile?.photoURL ?? undefined} />
                <AvatarFallback className="bg-secondary text-muted-foreground">
                  {bu.profile?.username?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">@{bu.profile?.username ?? "Unknown"}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => unblock(bu.blockId)}
                className="text-xs border-border/50 hover:border-primary/40"
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Helper: block a user (call from context menus / profile sheets)
export async function blockUser(blockerId: string, blockedId: string) {
  await addDoc(collection(db, "blocks"), {
    blockerId,
    blockedId,
    createdAt: serverTimestamp(),
  });
}
