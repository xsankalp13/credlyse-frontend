"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Youtube,
    Loader2,
    ArrowRight,
    Link2,
    Video,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImportPlaylistPage() {
    const [playlistUrl, setPlaylistUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [importedCourse, setImportedCourse] = useState<{ id: string; title: string } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();

    // Extract playlist ID from various YouTube URL formats
    const extractPlaylistId = (url: string): string | null => {
        const patterns = [
            /[?&]list=([a-zA-Z0-9_-]+)/,
            /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }

        // If it's just the ID itself
        if (/^[a-zA-Z0-9_-]{13,}$/.test(url.trim())) {
            return url.trim();
        }

        return null;
    };

    const handleImport = async (e: React.FormEvent) => {
        e.preventDefault();

        const playlistId = extractPlaylistId(playlistUrl);
        if (!playlistId) {
            toast.error("Invalid URL", {
                description: "Please enter a valid YouTube playlist URL or ID",
            });
            return;
        }

        setIsImporting(true);
        try {
            // Ensure we send a valid URL to the backend
            const importUrl = playlistUrl.includes("youtube.com") || playlistUrl.includes("youtu.be")
                ? playlistUrl
                : `https://youtube.com/playlist?list=${playlistId}`;

            const course = await api.importPlaylist(importUrl);
            setImportedCourse({ id: course.id, title: course.title });
            toast.success("Playlist imported!", {
                description: `"${course.title}" is ready for AI analysis`,
            });
        } catch (error) {
            toast.error("Import failed", {
                description: error instanceof Error ? error.message : "Could not import playlist",
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!importedCourse) return;

        setIsAnalyzing(true);
        try {
            await api.analyzeCourse(importedCourse.id);
            toast.success("Analysis started!", {
                description: "AI is generating quizzes. This may take a few minutes.",
            });
            router.push("/courses");
        } catch (error) {
            toast.error("Analysis failed", {
                description: error instanceof Error ? error.message : "Could not start analysis",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Import Playlist</h1>
                <p className="text-gray-500">
                    Transform a YouTube playlist into a structured course with AI-generated quizzes
                </p>
            </div>

            {!importedCourse ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-rose-50/50 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-50 pointer-events-none" />

                        <div className="p-8 relative">
                            <div className="flex items-center gap-5 mb-8">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-200">
                                    <Youtube className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">YouTube Playlist</h2>
                                    <p className="text-gray-500">
                                        Paste the playlist URL or ID
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleImport} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="playlist" className="text-gray-700 font-medium ml-1">
                                        Playlist URL or ID
                                    </Label>
                                    <div className="relative">
                                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="playlist"
                                            type="text"
                                            placeholder="https://youtube.com/playlist?list=PLxxxxxx"
                                            value={playlistUrl}
                                            onChange={(e) => setPlaylistUrl(e.target.value)}
                                            className="pl-12 h-12 bg-gray-50 border-gray-200 focus:border-rose-500 focus:ring-rose-100 text-gray-900 rounded-xl placeholder:text-gray-400"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 ml-1">
                                        Supported: Full URL, playlist ID, or video URL with playlist
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isImporting || !playlistUrl}
                                    className="w-full h-12 bg-gray-900 hover:bg-black text-white font-medium rounded-xl shadow-lg shadow-gray-200 transition-all hover:scale-[1.01]"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            Import Playlist
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* How it works */}
                            <div className="mt-10 pt-8 border-t border-gray-100">
                                <h4 className="text-sm font-semibold text-gray-900 mb-5 text-center bg-gray-50 inline-block px-3 py-1 rounded-full mx-auto block w-fit">How it works</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { step: 1, text: "Fetch metadata" },
                                        { step: 2, text: "Analyze & Quiz" },
                                        { step: 3, text: "Publish Course" },
                                    ].map((item) => (
                                        <div key={item.step} className="flex flex-col items-center text-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-sm font-bold">
                                                {item.step}
                                            </div>
                                            <span className="text-gray-600 text-sm font-medium">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-green-50/50">
                        <div className="p-10 text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-50 shadow-inner">
                                <CheckCircle2 className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Playlist Imported!</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                <strong className="text-gray-900">"{importedCourse.title}"</strong> has been imported successfully.
                                Now let AI analyze the videos and generate quizzes.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="h-11 bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-8 shadow-lg shadow-rose-200"
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Starting Analysis...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Quizzes with AI
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/courses")}
                                    className="h-11 border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-6"
                                >
                                    Skip for now
                                </Button>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-2 px-4 rounded-full w-fit mx-auto">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                AI analysis may take 1-5 minutes depending on video count
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
