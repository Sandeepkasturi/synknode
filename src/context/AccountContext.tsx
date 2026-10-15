import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Sender/member accounts (Lovable Cloud auth). Separate from the SRGEC receiver login in AuthContext. */
interface AccountContextType {
  account: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType>({ account: null, session: null, loading: true, signOut: async () => {} });

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AccountContext.Provider value={{ account: session?.user ?? null, session, loading, signOut: async () => { await supabase.auth.signOut(); } }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
