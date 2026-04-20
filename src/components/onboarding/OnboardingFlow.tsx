import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Zap, Users, Shield, QrCode } from "lucide-react";

interface OnboardingStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const STEPS: OnboardingStep[] = [
  {
    icon: <Zap className="h-12 w-12 text-primary" />,
    title: "Share at the\nspeed of intent",
    description: "Drop files to friends instantly over end-to-end encrypted P2P connections. No cloud. No waiting.",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: (
      <motion.div
        animate={{ rotateY: [0, 20, -20, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center"
      >
        <span className="text-4xl">📱</span>
      </motion.div>
    ),
    title: "Turn to Share",
    description: "Tilt your phone towards a friend to send files. Our gesture engine detects intent and fires the transfer.",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: <Users className="h-12 w-12 text-primary" />,
    title: "Friends-first\nsocial sharing",
    description: "Add friends, chat with E2E encryption, make audio calls, and share files — all in one place.",
    gradient: "from-primary/20 to-transparent",
  },
  {
    icon: <Shield className="h-12 w-12 text-primary" />,
    title: "Built for privacy",
    description: "SHA-256 integrity checks, ECDH encryption, and zero server access to your files. Always.",
    gradient: "from-primary/20 to-transparent",
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { profile, signInWithGoogle } = useAuth();
  const [step, setStep] = useState(0);
  const [signingIn, setSigningIn] = useState(false);

  const isLastStep = step === STEPS.length - 1;
  const currentStep = STEPS[step];

  const handleNext = () => {
    if (isLastStep) {
      // Show sign-in or complete
      handleGoogleSignIn();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
      onComplete();
    } catch {
      // handled in AuthContext
    } finally {
      setSigningIn(false);
    }
  };

  const handleSkip = () => onComplete();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between px-6 py-12">
      {/* Skip button */}
      <div className="w-full flex justify-end">
        {!isLastStep && (
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        )}
      </div>

      {/* Animated step area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Icon area */}
            <div className={`w-32 h-32 rounded-[2rem] bg-gradient-to-br ${currentStep.gradient} border border-primary/15 flex items-center justify-center`}>
              {currentStep.icon}
            </div>

            {/* Text */}
            <div className="space-y-3 text-center">
              <h2 className="text-3xl font-display font-bold text-foreground whitespace-pre-line leading-tight">
                {currentStep.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom action */}
      <div className="w-full max-w-sm space-y-4">
        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 h-2 bg-primary"
                  : i < step
                    ? "w-2 h-2 bg-primary/40"
                    : "w-2 h-2 bg-border/60"
              }`}
            />
          ))}
        </div>

        {isLastStep ? (
          <div className="space-y-3">
            <Button
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              className="w-full h-13 bg-white text-gray-900 hover:bg-gray-100 font-semibold flex items-center justify-center gap-3 rounded-xl"
            >
              {signingIn ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full"
                />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleNext}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};
