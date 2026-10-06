import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, User, Lock, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border/60 bg-card shadow-2xl">
                {/* Accent header */}
                <div className="relative px-6 pt-8 pb-6 bg-gradient-to-b from-primary/10 to-transparent">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <span className="absolute inset-0 rounded-2xl bg-primary/20 blur-lg" />
                            <div className="relative w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                        </div>
                        <DialogHeader className="space-y-1">
                            <DialogTitle className="text-2xl font-display text-foreground">
                                Receiver Access
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">
                                Sign in to open the{" "}
                                <span className="font-mono font-semibold text-primary tracking-wider">SRGEC</span>{" "}
                                receiver queue
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="px-6 pb-6 space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="rx-username" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Username
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="rx-username"
                                autoComplete="username"
                                placeholder="Enter username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 h-11 bg-background border-border focus-visible:ring-primary/40"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="rx-password" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="rx-password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10 pr-10 h-11 bg-background border-border focus-visible:ring-primary/40"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleLogin}
                        className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20"
                        disabled={loading}
                    >
                        {loading ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying…</>
                        ) : (
                            <>Unlock receiver <ArrowRight className="h-4 w-4 ml-2" /></>
                        )}
                    </Button>

                    <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                        <Lock className="h-3 w-3" />
                        Authorised receivers only · credentials are encrypted
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

