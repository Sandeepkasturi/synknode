import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, UserPlus, Trash2, User, Crown, Lock } from "lucide-react";

interface Receiver {
    id: string;
    username: string | null;
    is_primary: boolean;
    created_at: string;
}

interface ManageReceiversDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const ManageReceiversDialog: React.FC<ManageReceiversDialogProps> = ({ open, onOpenChange }) => {
    const { user, isPrimaryAdmin } = useAuth();
    const [receivers, setReceivers] = useState<Receiver[]>([]);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (open && isPrimaryAdmin) {
            fetchReceivers();
        }
    }, [open, isPrimaryAdmin]);

    const fetchReceivers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('authorized_receivers')
            .select('id, username, is_primary, created_at')
            .order('created_at', { ascending: true });

        if (error) {
            toast.error("Failed to load users");
            console.error(error);
        } else {
            setReceivers(data || []);
        }
        setLoading(false);
    };

    const handleAddReceiver = async () => {
        if (!newUsername.trim()) {
            toast.error("Please enter a username");
            return;
        }
        if (!newPassword.trim() || newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setAdding(true);
        const { error } = await supabase
            .from('authorized_receivers')
            .insert({
                username: newUsername.trim(),
                password_hash: newPassword,
                added_by: user?.id,
                is_primary: false
            });

        if (error) {
            if (error.code === '23505') {
                toast.error("This username already exists");
            } else {
                toast.error("Failed to add user");
                console.error(error);
            }
        } else {
            toast.success("User added successfully!");
            setNewUsername("");
            setNewPassword("");
            fetchReceivers();
        }
        setAdding(false);
    };

    const handleRemoveReceiver = async (receiver: Receiver) => {
        if (receiver.is_primary) {
            toast.error("Cannot remove primary admin");
            return;
        }

        const { error } = await supabase
            .from('authorized_receivers')
            .delete()
            .eq('id', receiver.id);

        if (error) {
            toast.error("Failed to remove user");
            console.error(error);
        } else {
            toast.success("User removed");
            fetchReceivers();
        }
    };

    if (!isPrimaryAdmin) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-secondary/90 border-primary/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        Manage Users
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Add or remove authorized users for SRGEC access
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Add new user */}
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="New Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Password (min 6 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>
                        <Button
                            onClick={handleAddReceiver}
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={adding}
                        >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add User
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Users list */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : receivers.length === 0 ? (
                            <p className="text-center text-muted-foreground py-4">No users found</p>
                        ) : (
                            receivers.map((receiver) => (
                                <div
                                    key={receiver.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5"
                                >
                                    <div className="flex items-center gap-2">
                                        {receiver.is_primary && (
                                            <Crown className="h-4 w-4 text-yellow-500" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {receiver.username}
                                        </span>
                                        {receiver.is_primary && (
                                            <span className="text-xs text-yellow-500/70">(Admin)</span>
                                        )}
                                    </div>
                                    {!receiver.is_primary && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveReceiver(receiver)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
