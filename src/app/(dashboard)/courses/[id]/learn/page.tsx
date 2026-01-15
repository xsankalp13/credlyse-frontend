"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Play,
    Lock,
    ChevronDown,
    ChevronUp,
    Loader2,
    HelpCircle,
    Trophy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface QuizQuestion {
    q: string;
    options: string[];
    answer: string;
}

interface VideoData {
    id: number;
    title: string;
    youtube_video_id: string;
    duration_seconds: number;
    has_quiz: boolean;
    analysis_status: string;
    quiz_data?: {
        has_quiz: boolean;
        questions: QuizQuestion[];
    };
}

interface CourseData {
    id: number;
    title: string;
    description: string;
    total_videos: number;
    is_published: boolean;
    videos: VideoData[];
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function StudySpacePage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<CourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

    useEffect(() => {
        async function loadCourse() {
            try {
                const data = await api.getCourse(courseId) as unknown as CourseData;
                setCourse(data);
                // Set first video as current
                if (data.videos && data.videos.length > 0) {
                    setCurrentVideo(data.videos[0]);
                }
            } catch (error) {
                console.error("Failed to load course:", error);
                toast.error("Failed to load course");
                router.push("/courses");
            } finally {
                setIsLoading(false);
            }
        }
        if (courseId) {
            loadCourse();
        }
    }, [courseId, router]);

    const handleVideoSelect = (video: VideoData) => {
        setCurrentVideo(video);
        setShowQuiz(false);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
    };

    const handleQuizAnswer = (questionIndex: number, answer: string) => {
        setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
    };

    const handleQuizSubmit = async () => {
        if (!currentVideo?.quiz_data?.questions) return;

        setIsSubmittingQuiz(true);

        // Grade locally for now
        const questions = currentVideo.quiz_data.questions;
        let correct = 0;
        questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.answer) {
                correct++;
            }
        });

        const score = Math.round((correct / questions.length) * 100);
        setQuizScore(score);
        setQuizSubmitted(true);
        setIsSubmittingQuiz(false);

        if (score >= 75) {
            toast.success(`Quiz passed! Score: ${score}%`);
        } else {
            toast.error(`Quiz not passed. Score: ${score}%. You need 75% to pass.`);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen flex">
                {/* Video Player Skeleton */}
                <div className="flex-1 bg-black flex items-center justify-center">
                    <Skeleton className="w-full h-full" />
                </div>
                {/* Sidebar Skeleton */}
                <div className="w-80 bg-white border-l p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    if (!course || !currentVideo) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-gray-500">Course not found</p>
            </div>
        );
    }

    const currentVideoIndex = course.videos.findIndex((v) => v.id === currentVideo.id);
    const progressPercent = ((currentVideoIndex + 1) / course.videos.length) * 100;

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Top Bar */}
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href={`/courses/${courseId}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Course</span>
                    </Link>
                    <div className="h-5 w-px bg-gray-200" />
                    <h1 className="text-sm font-semibold text-gray-900 truncate max-w-md">
                        {course.title}
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{currentVideoIndex + 1} of {course.videos.length}</span>
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-rose-500 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Video Player Area */}
                <div className="flex-1 flex flex-col bg-gray-900">
                    {/* YouTube Embed */}
                    <div className="flex-1 relative bg-black">
                        <iframe
                            src={`https://www.youtube.com/embed/${currentVideo.youtube_video_id}?autoplay=0&rel=0`}
                            title={currentVideo.title}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>

                    {/* Video Info & Quiz Toggle */}
                    <div className="bg-white border-t">
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {currentVideo.title}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formatDuration(currentVideo.duration_seconds)}
                                    </p>
                                </div>
                                {currentVideo.has_quiz && currentVideo.quiz_data?.questions && (
                                    <Button
                                        onClick={() => setShowQuiz(!showQuiz)}
                                        variant={showQuiz ? "default" : "outline"}
                                        className={showQuiz ? "bg-rose-500 hover:bg-rose-600" : ""}
                                    >
                                        <HelpCircle className="mr-2 h-4 w-4" />
                                        {showQuiz ? "Hide Quiz" : "Take Quiz"}
                                        {showQuiz ? (
                                            <ChevronUp className="ml-2 h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Quiz Section */}
                        <AnimatePresence>
                            {showQuiz && currentVideo.quiz_data?.questions && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="border-t bg-gray-50 p-6 max-h-96 overflow-y-auto">
                                        <div className="max-w-2xl mx-auto space-y-6">
                                            {currentVideo.quiz_data.questions.map((question, qIdx) => (
                                                <div key={qIdx} className="bg-white rounded-xl p-5 shadow-sm border">
                                                    <p className="font-medium text-gray-900 mb-4">
                                                        {qIdx + 1}. {question.q}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {question.options.map((option, oIdx) => {
                                                            const isSelected = quizAnswers[qIdx] === option;
                                                            const isCorrect = quizSubmitted && option === question.answer;
                                                            const isWrong = quizSubmitted && isSelected && option !== question.answer;

                                                            return (
                                                                <button
                                                                    key={oIdx}
                                                                    onClick={() => !quizSubmitted && handleQuizAnswer(qIdx, option)}
                                                                    disabled={quizSubmitted}
                                                                    className={`w-full text-left p-3 rounded-lg border transition-all ${isCorrect
                                                                        ? "bg-green-50 border-green-400 text-green-800"
                                                                        : isWrong
                                                                            ? "bg-red-50 border-red-400 text-red-800"
                                                                            : isSelected
                                                                                ? "bg-rose-50 border-rose-400"
                                                                                : "bg-white border-gray-200 hover:border-gray-300"
                                                                        }`}
                                                                >
                                                                    <span className="flex items-center gap-3">
                                                                        <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${isSelected
                                                                            ? "border-rose-500 bg-rose-500 text-white"
                                                                            : "border-gray-300 text-gray-500"
                                                                            }`}>
                                                                            {String.fromCharCode(65 + oIdx)}
                                                                        </span>
                                                                        {option}
                                                                        {isCorrect && (
                                                                            <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Submit / Score */}
                                            <div className="flex justify-center pt-4">
                                                {quizSubmitted ? (
                                                    <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${quizScore! >= 75 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                        }`}>
                                                        <Trophy className="h-5 w-5" />
                                                        <span className="font-semibold">
                                                            Score: {quizScore}% - {quizScore! >= 75 ? "Passed!" : "Try Again"}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={handleQuizSubmit}
                                                        disabled={Object.keys(quizAnswers).length !== currentVideo.quiz_data.questions.length || isSubmittingQuiz}
                                                        className="bg-rose-500 hover:bg-rose-600 px-8"
                                                    >
                                                        {isSubmittingQuiz ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Submitting...
                                                            </>
                                                        ) : (
                                                            "Submit Quiz"
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Curriculum Sidebar */}
                <div className="w-80 bg-white border-l flex flex-col">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold text-gray-900">Course Content</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {course.videos.length} videos
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {course.videos.map((video, idx) => {
                            const isActive = video.id === currentVideo.id;
                            const hasQuiz = video.has_quiz && video.quiz_data?.questions?.length;

                            return (
                                <button
                                    key={video.id}
                                    onClick={() => handleVideoSelect(video)}
                                    className={`w-full text-left p-4 border-b transition-colors ${isActive
                                        ? "bg-rose-50 border-l-4 border-l-rose-500"
                                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isActive
                                            ? "bg-rose-500 text-white"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium truncate ${isActive ? "text-rose-700" : "text-gray-900"
                                                }`}>
                                                {video.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-500">
                                                    {formatDuration(video.duration_seconds)}
                                                </span>
                                                {hasQuiz && (
                                                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                        Quiz
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {isActive && (
                                            <Play className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
