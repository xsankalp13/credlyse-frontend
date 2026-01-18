"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const { login, googleLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(email, password);
            toast.success("Welcome back!", { description: "You've successfully logged in." });
            router.push("/");
        } catch (error) {
            toast.error("Login failed", {
                description: error instanceof Error ? error.message : "Invalid credentials",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (idToken: string) => {
        setIsGoogleLoading(true);
        try {
            await googleLogin(idToken);
            toast.success("Welcome!", { description: "You've signed in with Google." });
            router.push("/");
        } catch (error) {
            toast.error("Google login failed", {
                description: error instanceof Error ? error.message : "Authentication failed",
            });
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50/30">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-rose-100/50">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-200">
                            <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Sign in to your Credlyse account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-white border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700">Password</Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-rose-500 hover:text-rose-600 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || isGoogleLoading}
                                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md shadow-rose-200 transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Sign in
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-3 text-gray-500">or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <GoogleSignInButton
                            onSuccess={handleGoogleLogin}
                            onError={(error) => toast.error("Google login failed", { description: error.message })}
                        />

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Don't have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Minimal footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Secure authentication powered by Credlyse
                </p>
            </motion.div>
        </div>
    );
}
