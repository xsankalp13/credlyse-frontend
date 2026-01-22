"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/AuthLayout";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const emailParam = searchParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <AuthLayout mode="reset-password">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                    {step === "otp" ? "Enter reset code" : "Create new password"}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                    {step === "otp" ? (
                        <>Code sent to <span className="font-medium text-gray-900">{email}</span></>
                    ) : (
                        "Choose a strong password for your account"
                    )}
                </p>
            </div>

            {step === "otp" ? (
                <div className="w-full">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-2 mb-8" onPaste={handlePaste}>
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
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleVerifyOtp}
                        disabled={otp.join("").length !== 6}
                        className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md shadow-lg shadow-gray-200 transition-all"
                    >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-gray-700 font-medium">
                            New password
                        </Label>
                        <div className="relative group">
                            <input
                                id="new-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="........"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none pr-10"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
                            Confirm password
                        </Label>
                        <div className="relative group">
                            <input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="........"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full h-11 px-4 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-purple-500/20 text-gray-900 placeholder:text-gray-400 transition-all outline-none pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-md shadow-lg shadow-gray-200 transition-all"
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
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
