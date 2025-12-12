import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mock OTP for authorized users
const MOCK_OTP = "152615";

interface MockUser {
    id: string;
    phone: string;
    isPrimary: boolean;
}

interface AuthContextType {
    user: MockUser | null;
    isLoading: boolean;
    isPrimaryAdmin: boolean;
    signInWithOTP: (phone: string) => Promise<{ error: any }>;
    verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<MockUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingPhone, setPendingPhone] = useState<string | null>(null);

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

    const signInWithOTP = async (phone: string) => {
        try {
            // Normalize phone number
            let normalizedPhone = phone.replace(/\s+/g, '');
            if (!normalizedPhone.startsWith('+')) {
                normalizedPhone = '+91' + normalizedPhone;
            }

            // Check if phone is in authorized_receivers
            const { data: authorized, error } = await supabase
                .from('authorized_receivers')
                .select('id, is_primary')
                .eq('phone_number', normalizedPhone)
                .single();

            if (error || !authorized) {
                return { error: { message: "This phone number is not authorized. Contact admin." } };
            }

            // Store pending phone for OTP verification
            setPendingPhone(normalizedPhone);
            
            // In production, you'd send SMS here. For now, we use mock OTP
            console.log(`Mock OTP for ${normalizedPhone}: ${MOCK_OTP}`);
            
            return { error: null };
        } catch (error: any) {
            console.error("Error in signInWithOTP:", error);
            return { error };
        }
    };

    const verifyOTP = async (phone: string, token: string) => {
        try {
            // Normalize phone
            let normalizedPhone = phone.replace(/\s+/g, '');
            if (!normalizedPhone.startsWith('+')) {
                normalizedPhone = '+91' + normalizedPhone;
            }

            // Check mock OTP
            if (token !== MOCK_OTP) {
                return { error: { message: "Invalid OTP. Please try again." } };
            }

            // Get user info from authorized_receivers
            const { data: authorized, error } = await supabase
                .from('authorized_receivers')
                .select('id, is_primary')
                .eq('phone_number', normalizedPhone)
                .single();

            if (error || !authorized) {
                return { error: { message: "Phone number not authorized." } };
            }

            // Create mock user session
            const mockUser: MockUser = {
                id: authorized.id,
                phone: normalizedPhone,
                isPrimary: authorized.is_primary || false
            };

            setUser(mockUser);
            localStorage.setItem('synknode_user', JSON.stringify(mockUser));
            setPendingPhone(null);

            return { error: null };
        } catch (error: any) {
            console.error("Error verifying OTP:", error);
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
            signInWithOTP, 
            verifyOTP, 
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
