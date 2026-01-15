"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import { syncTokenWithExtension, clearExtensionAuth } from "@/lib/extension";
import type { User, UserRole } from "@/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setUser(null);
                return;
            }
            const userData = await api.getCurrentUser();
            setUser(userData);

            // Sync token with extension when user refreshes
            await syncTokenWithExtension(token, userData);
        } catch {
            // Token is invalid or expired
            localStorage.removeItem("access_token");
            setUser(null);
        }
    }, []);

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, [refreshUser]);

    const login = async (email: string, password: string) => {
        const tokenData = await api.login({ username: email, password });
        localStorage.setItem("access_token", tokenData.access_token);

        // Get user data and sync with extension
        const userData = await api.getCurrentUser();
        setUser(userData);

        // Sync token with Chrome extension
        await syncTokenWithExtension(tokenData.access_token, userData);
    };

    const signup = async (email: string, password: string, fullName: string, role: UserRole) => {
        await api.signup({ email, password, full_name: fullName, role });
        // Auto-login after signup
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        // Clear extension auth state
        clearExtensionAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
