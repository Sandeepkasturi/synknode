import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFriends } from "@/hooks/useFriends";
import { useChat } from "@/hooks/useChat";
import { useCall } from "@/hooks/useCall";
import { BottomNavLayout } from "@/components/layout/BottomNavLayout";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { SenderForm } from "@/components/sender/SenderForm";
import { ReceiverPanel } from "@/components/receiver/ReceiverPanel";
import { FriendsTab } from "@/components/friends/FriendsTab";
import { ChatList } from "@/components/chat/ChatList";
import { ConversationScreen } from "@/components/chat/ConversationScreen";
import { ProfileScreen } from "@/components/profile/ProfileScreen";
import { QRPairScreen } from "@/components/qr/QRPairScreen";
import { AIAssistantButton } from "@/components/ai/AIAssistantButton";
import { IncomingCallSheet } from "@/components/call/IncomingCallSheet";
import { ActiveCallScreen } from "@/components/call/ActiveCallScreen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Upload, Download, LogIn } from "lucide-react";
import { UserProfile } from "@/context/AuthContext";

// ─── SHARE TAB (Send + Receive sub-tabs) ──────────────────────────────────────
const ShareTab: React.FC<{ showLogin: () => void }> = ({ showLogin }) => {
  const { user } = useAuth();
  return (
    <div className="px-4 pt-4 pb-2">
      {/* App wordmark */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xl font-display font-bold text-gradient-teal">SynkDrop</span>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 text-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">SynkDrop</h2>
            <p className="text-sm text-muted-foreground">Sign in to start sharing files at the speed of intent.</p>
          </div>
          <Button onClick={showLogin} className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="send">
          <TabsList className="w-full mb-5 bg-secondary/30 border border-border/50 rounded-xl">
            <TabsTrigger value="send" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Upload className="h-3.5 w-3.5 mr-1.5" /> Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="flex-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg">
              <Download className="h-3.5 w-3.5 mr-1.5" /> Receive
            </TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="mt-0">
            <SenderForm />
          </TabsContent>
          <TabsContent value="receive" className="mt-0">
            <ReceiverPanel />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// ─── MAIN INDEX ───────────────────────────────────────────────────────────────

const Index: React.FC = () => {
  const { user, profile, isLoading, isNewUser } = useAuth();
  const { friends } = useFriends();
  const {
    callState,
    incomingCall,
    acceptCall,
    declineCall,
    endCall,
    isMuted,
    connectionQuality,
    toggleMute,
  } = useCall();
  const {
    conversations,
    openConversation,
    messages,
    activeConversationUid,
  } = useChat();

  const [loginOpen, setLoginOpen] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(() => {
    return localStorage.getItem("synkdrop_onboarded") === "true";
  });
  const [activeChatUid, setActiveChatUid] = useState<string | null>(null);

  // Show onboarding for truly new users
  const showOnboarding = !isLoading && !user && !onboardingComplete;

  const handleOnboardingComplete = () => {
    localStorage.setItem("synkdrop_onboarded", "true");
    setOnboardingComplete(true);
  };

  // Derive remote profile for active call
  const remoteCallProfile = incomingCall?.callerProfile ?? null;
  const friendForActiveCall = friends.find((f) => {
    if (callState === "calling" || callState === "connected") {
      return activeCallee === f.uid;
    }
    return incomingCall?.callerId === f.uid;
  }) ?? null;

  const [activeCallee, setActiveCallee] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
        >
          <Zap className="h-5 w-5 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />

      {/* Incoming call sheet — COMING SOON: held until audio calls launch */}
      <IncomingCallSheet
        open={false /* callState === "ringing" — calls coming soon */}
        callerProfile={incomingCall?.callerProfile}
        onAccept={acceptCall}
        onDecline={declineCall}
      />

      {/* Active call overlay — COMING SOON: disabled until audio calls launch */}
      <AnimatePresence>
        {false /* (callState === "connected" || callState === "calling") — calls coming soon */ && (
          <ActiveCallScreen
            remoteProfile={friendForActiveCall ?? remoteCallProfile}
            isMuted={isMuted}
            connectionQuality={connectionQuality}
            onToggleMute={toggleMute}
            onEndCall={endCall}
          />
        )}
      </AnimatePresence>

      {/* Conversation fullscreen */}
      <AnimatePresence>
        {activeChatUid && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-30 bg-background flex flex-col"
          >
            <ConversationScreen
              participantUid={activeChatUid}
              participantProfile={
                conversations.find((c) => c.participantUid === activeChatUid)?.participantProfile ?? null
              }
              onBack={() => setActiveChatUid(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavLayout>
        {(tab) => {
          switch (tab) {
            case "share":
              return <ShareTab showLogin={() => setLoginOpen(true)} />;

            case "friends":
              return (
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-5">
                    <h1 className="text-xl font-display font-bold text-foreground">Friends</h1>
                  </div>
                  <FriendsTab
                    onChat={(uid) => { openConversation(uid); setActiveChatUid(uid); }}
                    onCall={(uid) => {
                      setActiveCallee(uid);
                      // initiateCall is passed from useCall — accessed here through context if you wish
                    }}
                  />
                </div>
              );

            case "chat":
              return (
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-5">
                    <h1 className="text-xl font-display font-bold text-foreground">Messages</h1>
                  </div>
                  <ChatList
                    onOpenConversation={(uid) => { openConversation(uid); setActiveChatUid(uid); }}
                  />
                </div>
              );

            case "qr":
              return (
                <div className="px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2 mb-5">
                    <h1 className="text-xl font-display font-bold text-foreground">QR Pair</h1>
                  </div>
                  <QRPairScreen />
                </div>
              );

            case "profile":
              return (
                <div className="px-4 pt-4 pb-2">
                  <ProfileScreen />
                </div>
              );

            default:
              return null;
          }
        }}
      </BottomNavLayout>

      {/* AI FAB — always visible */}
      {user && (
        <AIAssistantButton
          context={{
            onlineFriendsCount: friends.filter((f) => f.online).length,
          }}
        />
      )}
    </>
  );
};

export default Index;
