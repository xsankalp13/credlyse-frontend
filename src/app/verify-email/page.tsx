"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GraduationCap, Mail, Loader2, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyEmail, resendOtp, pendingEmail } = useAuth();

    const emailParam = searchParams.get("email");
    const email = emailParam || pendingEmail || "";

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Auto-submit when all digits entered
    useEffect(() => {
        const code = otp.join("");
        if (code.length === 6 && !otp.includes("")) {
            handleVerify(code);
        }
    }, [otp]);

    // Redirect if no email
    useEffect(() => {
        if (!email) {
            router.push("/signup");
        }
    }, [email, router]);

    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        // Handle backspace
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
            // Focus the last filled input or the next empty one
            const focusIndex = Math.min(pastedData.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter the complete 6-digit code");
            return;
        }

        setIsVerifying(true);
        try {
            await verifyEmail(email, otpCode);
            toast.success("Email verified!", {
                description: "Welcome to Credlyse!",
                icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            });
            router.push("/");
        } catch (error) {
            toast.error("Verification failed", {
                description: error instanceof Error ? error.message : "Invalid or expired code",
            });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;

        setIsResending(true);
        try {
            const response = await resendOtp(email);
            toast.success("Code sent!", {
                description: "Check your email for the new verification code",
            });
            setCooldown(response.cooldown_seconds || 60);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } catch (error) {
            toast.error("Failed to resend code", {
                description: error instanceof Error ? error.message : "Please try again later",
            });
        } finally {
            setIsResending(false);
        }
    };

    if (!email) return null;

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
                            <Mail className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            Verify your email
                        </CardTitle>
                        <CardDescription className="text-gray-500">
                            We sent a 6-digit code to<br />
                            <span className="font-medium text-gray-700">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
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
                                    className="w-12 h-14 text-center text-2xl font-bold bg-white border-gray-200 focus:border-rose-300 focus:ring-rose-200 text-gray-900"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={() => handleVerify()}
                            disabled={isVerifying || otp.join("").length !== 6}
                            className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-md shadow-rose-200 transition-all mb-4"
                        >
                            {isVerifying ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Verify Email
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>

                        {/* Resend OTP */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-2">
                                Didn't receive the code?
                            </p>
                            <Button
                                variant="ghost"
                                onClick={handleResend}
                                disabled={isResending || cooldown > 0}
                                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                            >
                                {isResending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                )}
                                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Minimal footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    Check your spam folder if you don't see the email
                </p>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
