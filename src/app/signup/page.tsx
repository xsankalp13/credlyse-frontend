"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, BookOpen, Video, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [isLoading, setIsLoading] = useState(false);
    const { signup, googleLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await signup(email, password, fullName, role);
            toast.success("Verification code sent!", {
                description: "Check your email for the 6-digit code"
            });
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error) {
            toast.error("Signup failed", {
                description: error instanceof Error ? error.message : "Could not create account",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async (idToken: string) => {
        try {
            await googleLogin(idToken);
            toast.success("Welcome!", { description: "You've signed up with Google." });
            router.push("/");
        } catch (error) {
            toast.error("Google signup failed", {
                description: error instanceof Error ? error.message : "Authentication failed",
            });
        }
    };

    return (
        <AuthLayout mode="signup">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-sm text-gray-500 mt-2">
                    Start your learning journey today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                    <div className="relative">
                        <input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none"
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
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none pr-10"
                            minLength={6}
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

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                    <div className="relative group">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="........"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none pr-10"
                            minLength={6}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setRole(UserRole.STUDENT)}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all duration-200 ${role === UserRole.STUDENT
                            ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900/10"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <BookOpen className={`h-5 w-5 mb-1 ${role === UserRole.STUDENT ? "text-gray-900" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold ${role === UserRole.STUDENT ? "text-gray-900" : "text-gray-500"}`}>
                            Student
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole(UserRole.CREATOR)}
                        className={`flex flex-col items-center justify-center p-3 rounded-md border-2 transition-all duration-200 ${role === UserRole.CREATOR
                            ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900/10"
                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        <Video className={`h-5 w-5 mb-1 ${role === UserRole.CREATOR ? "text-gray-900" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold ${role === UserRole.CREATOR ? "text-gray-900" : "text-gray-500"}`}>
                            Creator
                        </span>
                    </button>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md transition-all shadow-lg shadow-gray-200"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Create Account"
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
                onSuccess={handleGoogleSignup}
                onError={(error) => toast.error("Google signup failed", { description: error.message })}
                text="Sign up with Google"
                className="rounded-md border hover:bg-gray-50"
            />

            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-bold text-gray-900 hover:underline transition-all"
                    >
                        Login
                    </Link>
                </p>
            </div>
        </AuthLayout>
    );
}
