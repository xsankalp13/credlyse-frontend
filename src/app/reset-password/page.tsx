"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { KeyRound, Lock, Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<"otp" | "password">(emailParam ? "otp" : "password");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!emailParam) {
            router.push("/forgot-password");
        }
    }, [emailParam, router]);

    const handleInputChange = (index: number, value: string) => {
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newOtp = [...otp];
            pastedData.split("").forEach((char, i) => {
                if (i < 6) newOtp[i] = char;
            });
            setOtp(newOtp);
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerifyOtp = () => {
        const code = otp.join("");
        if (code.length !== 6) {
            toast.error("Please enter the complete 6-digit code");
            return;
        }
        setStep("password");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);
        try {
            await api.resetPassword(email, otp.join(""), newPassword);
            toast.success("Password reset!", {
                description: "You can now log in with your new password",
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            });
            router.push("/login");
        } catch (error) {
            toast.error("Reset failed", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!emailParam) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-violet-50/30 py-8">
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
                            {step === "otp" ? "Enter reset code" : "Create new password"}
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            {step === "otp" ? (
                                <>Code sent to <span className="font-medium text-gray-700">{email}</span></>
                            ) : (
                                "Choose a strong password for your account"
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {step === "otp" ? (
                            <>
                                {/* OTP Input */}
                                <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={(el) => { inputRefs.current[index] = el; }}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-2xl font-bold bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200 text-gray-900"
                                        />
                                    ))}
                                </div>

                                <Button
                                    onClick={handleVerifyOtp}
                                    disabled={otp.join("").length !== 6}
                                    className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white font-medium shadow-md shadow-purple-200 transition-all"
                                >
                                    Continue
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                                        New password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="new-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="pl-10 pr-10 h-11 bg-white border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                                        Confirm password
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="confirm-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                                            Reset password
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
