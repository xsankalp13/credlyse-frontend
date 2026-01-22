"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, RotateCcw, CheckCircle2 } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";

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
        <AuthLayout mode="verify-email">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Verify your email</h2>
                <p className="text-sm text-gray-500 mt-2">
                    We sent a 6-digit code to<br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>
            </div>

            <div className="w-full">
                {/* OTP Input */}
                <div className="flex justify-center gap-2 mb-10" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 outline-none transition-all"
                            disabled={isVerifying}
                        />
                    ))}
                </div>

                <Button
                    onClick={() => handleVerify()}
                    disabled={isVerifying || otp.join("").length !== 6}
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md shadow-lg shadow-gray-200 transition-all mb-6"
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
                    <p className="text-sm text-gray-500 mb-3">
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || cooldown > 0}
                        className="inline-flex items-center text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isResending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <RotateCcw className="h-4 w-4 mr-2" />
                        )}
                        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </button>
                </div>
            </div>

            {/* Minimal footer */}
            <p className="text-center text-xs text-gray-400 mt-8">
                Check your spam folder if you don't see the email
            </p>
        </AuthLayout>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
