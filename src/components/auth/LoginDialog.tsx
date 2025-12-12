import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Loader2, Phone, KeyRound } from "lucide-react";

interface LoginDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
    const { signInWithOTP, verifyOTP } = useAuth();
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        if (!phone.trim() || phone.length < 10) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        const { error } = await signInWithOTP(phone);
        setLoading(false);

        if (error) {
            toast.error(error.message || "Failed to send OTP");
        } else {
            toast.success("OTP sent! Use code: 152615");
            setStep('otp');
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp.trim() || otp.length < 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        const { error } = await verifyOTP(phone, otp);
        setLoading(false);

        if (error) {
            toast.error(error.message || "Invalid OTP");
        } else {
            toast.success("Logged in successfully!");
            onOpenChange(false);
            setStep('phone');
            setPhone("");
            setOtp("");
        }
    };

    const handleClose = (open: boolean) => {
        if (!open) {
            setStep('phone');
            setOtp("");
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-secondary/90 border-primary/20 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-display text-center bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                        {step === 'phone' ? 'Receiver Access' : 'Verify Identity'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        {step === 'phone'
                            ? 'Enter your authorized mobile number'
                            : `Enter the code sent to ${phone}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {step === 'phone' ? (
                        <div className="space-y-2">
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="+91 9919932723"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground ml-1">Include country code (e.g. +91)</p>
                            <Button
                                onClick={handleSendOTP}
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="152615"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    className="pl-10 bg-black/20 border-white/10 focus:border-primary/50 tracking-widest text-center text-lg"
                                />
                            </div>
                            <Button
                                onClick={handleVerifyOTP}
                                className="w-full bg-primary hover:bg-primary/90"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Login"}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setStep('phone')}
                                className="w-full text-xs text-muted-foreground hover:text-white"
                            >
                                Change Phone Number
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
