"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
        try {
            await googleLogin(idToken);
            toast.success("Welcome!", { description: "You've signed in with Google." });
            router.push("/");
        } catch (error) {
            toast.error("Google login failed", {
                description: error instanceof Error ? error.message : "Authentication failed",
            });
        }
    };

    return (
        <AuthLayout mode="login">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Login</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Enter your credentials to get in
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <div className="relative group">
                        <input
                            id="email"
                            type="email"
                            placeholder="aimerpaix@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-rose-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                            required
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                    <div className="relative group">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="........"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-rose-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <input type="checkbox" id="remember" className="rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
                        <label htmlFor="remember" className="text-sm text-gray-600">Remember me</label>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md transition-all shadow-lg shadow-gray-200"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Login"
                    )}
                </Button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-400">or continue with</span>
                </div>
            </div>

            <GoogleSignInButton
                onSuccess={handleGoogleLogin}
                onError={(error) => toast.error("Google login failed", { description: error.message })}
                className="rounded-md border hover:bg-gray-50"
            />

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Not a member?{" "}
                    <Link
                        href="/signup"
                        className="font-bold text-gray-900 hover:underline transition-all"
                    >
                        Create an account
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
