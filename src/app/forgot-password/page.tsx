"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Loader2, ArrowRight, ArrowLeft, KeyRound } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await api.forgotPassword(email);
            toast.success("Reset code sent!", {
                description: "Check your email for the 6-digit code",
            });
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (error) {
            toast.error("Request failed", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-violet-50/30">
            {/* Subtle decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-100/40 rounded-full blur-3xl translate-y-1/2 translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md px-4"
            >
                <Card className="border border-gray-100 bg-white/80 backdrop-blur-sm shadow-xl shadow-purple-100/50">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 shadow-lg shadow-purple-200">
                            <KeyRound className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            Forgot password?
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            No worries, we'll send you a reset code
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-md shadow-purple-200 transition-all"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        Send reset code
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/login"
                                className="inline-flex items-center text-sm text-gray-500 hover:text-purple-600 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
