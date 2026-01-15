"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, User, Loader2, ArrowRight, BookOpen, Video } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await signup(email, password, fullName, role);
            toast.success("Account created!", { description: "Welcome to Credlyse!" });
            router.push("/");
        } catch (error) {
            toast.error("Signup failed", {
                description: error instanceof Error ? error.message : "Could not create account",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-purple-50/30 py-8">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

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
                            Create your account
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            Start your learning journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="pl-10 bg-white border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-gray-900 placeholder:text-gray-400"
                                        required
                                    />
                                </div>
                            </div>

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
                                <Label htmlFor="password" className="text-gray-700">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 bg-white border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-gray-900 placeholder:text-gray-400"
                                        minLength={6}
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Minimum 6 characters</p>
                            </div>

                            {/* Role Selection - Minimal Cards */}
                            <div className="space-y-2">
                                <Label className="text-gray-700">I am a...</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setRole(UserRole.STUDENT)}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all ${role === UserRole.STUDENT
                                            ? "border-rose-300 bg-rose-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                    >
                                        <BookOpen className={`h-5 w-5 mb-2 ${role === UserRole.STUDENT ? "text-rose-500" : "text-gray-400"}`} />
                                        <span className={`text-sm font-medium ${role === UserRole.STUDENT ? "text-rose-700" : "text-gray-700"}`}>
                                            Student
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole(UserRole.CREATOR)}
                                        className={`flex flex-col items-center p-4 rounded-xl border transition-all ${role === UserRole.CREATOR
                                            ? "border-purple-300 bg-purple-50 shadow-sm"
                                            : "border-gray-200 bg-white hover:border-gray-300"
                                            }`}
                                    >
                                        <Video className={`h-5 w-5 mb-2 ${role === UserRole.CREATOR ? "text-purple-500" : "text-gray-400"}`} />
                                        <span className={`text-sm font-medium ${role === UserRole.CREATOR ? "text-purple-700" : "text-gray-700"}`}>
                                            Creator
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md shadow-rose-200 transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Create account
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-rose-500 hover:text-rose-600 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Minimal footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    By signing up, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
}
