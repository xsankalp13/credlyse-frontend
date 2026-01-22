"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";

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
        <AuthLayout mode="forgot-password">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Forgot password?</h2>
                <p className="text-sm text-gray-500 mt-2">
                    No worries, we'll send you a reset code
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
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

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md transition-all shadow-lg shadow-gray-200"
                >
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Send reset code"
                    )}
                </Button>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                </Link>
            </div>
        </AuthLayout>
    );
}
