"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";
import { syncTokenWithExtension, clearExtensionAuth } from "@/lib/extension";
import type { User, UserRole, SignupResponse } from "@/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    pendingEmail: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string, role: UserRole) => Promise<SignupResponse>;
    verifyEmail: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<{ cooldown_seconds: number | null }>;
    googleLogin: (idToken: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    setPendingEmail: (email: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pendingEmail, setPendingEmail] = useState<string | null>(null);

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

    const signup = async (email: string, password: string, fullName: string, role: UserRole): Promise<SignupResponse> => {
        const response = await api.signup({ email, password, full_name: fullName, role });
        // Don't auto-login - user needs to verify email first
        setPendingEmail(email);
        return response;
    };

    const verifyEmail = async (email: string, otp: string) => {
        const tokenData = await api.verifyEmail(email, otp);
        localStorage.setItem("access_token", tokenData.access_token);

        // Get user data and sync with extension
        const userData = await api.getCurrentUser();
        setUser(userData);
        setPendingEmail(null);

        // Sync token with Chrome extension
        await syncTokenWithExtension(tokenData.access_token, userData);
    };

    const resendOtp = async (email: string) => {
        const response = await api.resendOtp(email);
        return { cooldown_seconds: response.cooldown_seconds };
    };

    const googleLogin = async (idToken: string) => {
        const tokenData = await api.googleAuth(idToken);
        localStorage.setItem("access_token", tokenData.access_token);

        // Get user data and sync with extension
        const userData = await api.getCurrentUser();
        setUser(userData);

        // Sync token with Chrome extension
        await syncTokenWithExtension(tokenData.access_token, userData);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        setPendingEmail(null);
        // Clear extension auth state
        clearExtensionAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                pendingEmail,
                login,
                signup,
                verifyEmail,
                resendOtp,
                googleLogin,
                logout,
                refreshUser,
                setPendingEmail,
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
