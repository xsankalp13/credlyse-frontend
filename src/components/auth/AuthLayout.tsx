"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
    children: React.ReactNode;
    mode: "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";
}

export function AuthLayout({ children, mode }: AuthLayoutProps) {
    const isLogin = mode === "login" || mode === "forgot-password" || mode === "reset-password" || mode === "verify-email";
    const isForgot = mode === "forgot-password";
    const isReset = mode === "reset-password";
    const isVerify = mode === "verify-email";

    return (
        <div className="min-h-screen w-full flex overflow-hidden bg-background">
            {/* 
        Container for the two halves. 
        We use flex-row-reverse for signup to visually "swap" the sides without complex absolute positioning hacking,
        but to animate the transition smoothy, we might need a more fixed structural approach or use LayoutGroup.
        
        However, simpler: 
        Login: [Form] [Image]
        Signup: [Image] [Form]
      */}
            <div className={`w-full flex ${isLogin ? "flex-row" : "flex-row-reverse"} h-screen transition-all duration-700 ease-in-out`}>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? -20 : 20 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full lg:w-[45%] xl:w-1/3 flex flex-col justify-center items-center p-8 lg:p-12 relative z-10 bg-white dark:bg-black"
                >
                    <div className="w-full max-w-md space-y-8">
                        {children}
                    </div>
                </motion.div>

                {/* Image/Art Side */}
                <motion.div
                    layoutId="auth-image-container"
                    className="hidden lg:flex flex-1 relative bg-black items-center justify-center overflow-hidden"
                >
                    {/* Premium Gradient Background (Interim) */}
                    <div className="absolute inset-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-rose-900 opacity-90 z-0" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent blur-3xl z-1 my-auto" />

                    {/* Abstract Geometric Overlay */}
                    <div className="absolute inset-0 z-0 opacity-30 bg-[image:var(--noise-pattern)] brightness-100 contrast-150 mix-blend-overlay"></div>

                    {/* Logo in the corner */}
                    <div className={`absolute top-8 z-20 ${!isLogin ? 'left-8' : 'right-8'}`}>
                        <Image
                            src="/logo.png"
                            alt="CredLyse Logo"
                            width={120}
                            height={40}
                            className="object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 p-12 text-white max-w-2xl text-center">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                        >
                            {isForgot ? (
                                <>
                                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                                        Secure Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-200">Access</span>
                                    </h1>
                                    <p className="text-xl text-white/80 font-light leading-relaxed">
                                        Recover your account and get back to learning in seconds. We've got your back.
                                    </p>
                                </>
                            ) : isReset ? (
                                <>
                                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                                        New Beginnings <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-lime-200">Await</span>
                                    </h1>
                                    <p className="text-xl text-white/80 font-light leading-relaxed">
                                        Set a new password and regain control of your learning journey.
                                    </p>
                                </>
                            ) : isVerify ? (
                                <>
                                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                                        Verify Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Identity</span>
                                    </h1>
                                    <p className="text-xl text-white/80 font-light leading-relaxed">
                                        One last step to secure your account and unlock your full learning potential.
                                    </p>
                                </>
                            ) : mode === "login" ? (
                                <>
                                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                                        Turn Chaos into <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 to-orange-200">Clarity</span>
                                    </h1>
                                    <p className="text-xl text-white/80 font-light leading-relaxed">
                                        "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h1 className="text-5xl font-bold mb-6 leading-tight tracking-tight">
                                        Join the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-200">Revolution</span>
                                    </h1>
                                    <p className="text-xl text-white/80 font-light leading-relaxed">
                                        Start your journey of structured learning today. Access thousands of curated courses from your favorite creators.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </div>

                    {/* Pyramid/Triangle shape hint (CSS) */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[800px] h-[800px] bg-gradient-to-t from-purple-600/30 to-transparent rotate-45 blur-3xl z-0"></div>

                </motion.div>
            </div>
        </div>
    );
}
