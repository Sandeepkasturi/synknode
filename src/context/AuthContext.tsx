import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AppUser {
    id: string;
    username: string;
    isPrimary: boolean;
}

interface AuthContextType {
    user: AppUser | null;
    isLoading: boolean;
    isPrimaryAdmin: boolean;
    login: (username: string, password: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session in localStorage
        const storedUser = localStorage.getItem('synknode_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('synknode_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        try {
            // Check credentials against authorized_receivers table
            const { data: authorized, error } = await supabase
                .from('authorized_receivers')
                .select('id, username, is_primary, password_hash')
                .eq('username', username)
                .maybeSingle();

            if (error) {
                console.error("Login error:", error);
                return { error: { message: "Login failed. Please try again." } };
            }

            if (!authorized) {
                return { error: { message: "Invalid username. Please check your credentials." } };
            }

            // Check password
            if (authorized.password_hash !== password) {
                return { error: { message: "Invalid password. Please try again." } };
            }

            // Create user session
            const appUser: AppUser = {
                id: authorized.id,
                username: authorized.username || username,
                isPrimary: authorized.is_primary || false
            };

            setUser(appUser);
            localStorage.setItem('synknode_user', JSON.stringify(appUser));

            return { error: null };
        } catch (error: any) {
            console.error("Error in login:", error);
            return { error };
        }
    };

    const signOut = async () => {
        try {
            setUser(null);
            localStorage.removeItem('synknode_user');
            toast.success("Signed out successfully");
        } catch (error) {
            console.error("Error signing out:", error);
            toast.error("Error signing out");
        }
    };

    const isPrimaryAdmin = user?.isPrimary || false;

    return (
        <AuthContext.Provider value={{ 
            user, 
            isLoading, 
            isPrimaryAdmin,
            login, 
            signOut 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
