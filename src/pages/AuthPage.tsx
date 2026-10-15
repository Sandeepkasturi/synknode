import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAccount } from "@/context/AccountContext";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/BrandMark";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "/space");

const AuthPage: React.FC = () => {
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));
  const navigate = useNavigate();
  const { account } = useAccount();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (account) navigate(next, { replace: true }); }, [account, next, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${next}` } });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + `/auth?next=${encodeURIComponent(next)}` });
    if (r.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="app-shell min-h-screen bg-background"><Header />
      <main className="app-workspace">
        <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3"><BrandMark /><div><h1 className="text-xl font-bold">{mode === "in" ? "Sign in" : "Create account"}</h1><p className="text-xs text-muted-foreground">Your personal SynkNode space</p></div></div>
          <Button type="button" variant="outline" className="w-full" onClick={google}>Continue with Google</Button>
          <div className="my-4 text-center text-xs text-muted-foreground">or</div>
          <form onSubmit={submit} className="space-y-3">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><Label htmlFor="pw">Password</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} /></div>
            <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Sign up"}</Button>
          </form>
          <button className="mt-4 w-full text-center text-sm text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>
            {mode === "in" ? "New here? Create an account" : "Have an account? Sign in"}
          </button>
        </div>
      </main>
    </div>
  );
};
export default AuthPage;
