import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, User, Lock } from "lucide-react";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username.trim()) {
            toast.error("Please enter your username");
            return;
        }
        if (!password.trim()) {
            toast.error("Please enter your password");
            return;
        }

        setLoading(true);
        const { error } = await login(username.trim(), password);
        setLoading(false);

        if (error) {
            toast.error(error.message || "Login failed");
        } else {
            toast.success("Logged in successfully!");
            onOpenChange(false);
            setUsername("");
            setPassword("");
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setUsername("");
            setPassword("");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-secondary/90 border-primary/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        Receiver Access
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Enter your credentials to access SRGEC receiver
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={handleLogin}
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
