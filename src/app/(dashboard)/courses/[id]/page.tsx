"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Video,
    Play,
    Clock,
    ArrowLeft,
    CheckCircle2,
    Users,
    BookOpen,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    Edit3,
    Save,
    X,
    HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { UserRole, type Playlist } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface QuizQuestion {
    q: string;
    options: string[];
    answer: string; // The correct option text
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

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Playlist | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPublishing, setIsPublishing] = useState(false);
    const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
    const [editingVideo, setEditingVideo] = useState<number | null>(null);
    const [editedQuestions, setEditedQuestions] = useState<QuizQuestion[]>([]);

    const isCreator = user?.role === UserRole.CREATOR;
    const isOwner = course?.creator_id === user?.id;

    useEffect(() => {
        async function loadCourse() {
            try {
                const data = await api.getCourse(courseId);
                setCourse(data);
            } catch (error) {
                console.error("Failed to load course:", error);
                toast.error("Failed to load course details");
            } finally {
                setIsLoading(false);
            }
        }
        if (courseId) {
            loadCourse();
        }
    }, [courseId]);

    const handlePublish = async () => {
        if (!course) return;
        setIsPublishing(true);
        try {
            const updated = await api.publishCourse(courseId);
            setCourse(updated);
            toast.success("Course published successfully!");
        } catch (error) {
            console.error("Failed to publish course:", error);
            toast.error("Failed to publish course");
        } finally {
            setIsPublishing(false);
        }
    };

    const toggleVideoExpand = (videoId: number) => {
        if (expandedVideo === videoId) {
            setExpandedVideo(null);
            setEditingVideo(null);
        } else {
            setExpandedVideo(videoId);
            setEditingVideo(null);
        }
    };

    const startEditingQuiz = (video: VideoData) => {
        setEditingVideo(video.id);
        setEditedQuestions(video.quiz_data?.questions ? [...video.quiz_data.questions] : []);
    };

    const cancelEditing = () => {
        setEditingVideo(null);
        setEditedQuestions([]);
    };

    const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const updated = [...editedQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setEditedQuestions(updated);
    };

    const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
        const updated = [...editedQuestions];
        const newOptions = [...updated[questionIndex].options];
        newOptions[optionIndex] = value;
        updated[questionIndex] = { ...updated[questionIndex], options: newOptions };
        setEditedQuestions(updated);
    };

    const addQuestion = () => {
        setEditedQuestions([
            ...editedQuestions,
            {
                q: "",
                options: ["", "", "", ""],
                answer: "",
            },
        ]);
    };

    const removeQuestion = (index: number) => {
        setEditedQuestions(editedQuestions.filter((_, i) => i !== index));
    };

    const saveQuizChanges = async () => {
        // TODO: Implement API call to save quiz changes
        toast.success("Quiz changes saved! (Demo - API integration needed)");
        setEditingVideo(null);
    };

    const videos = (course as any)?.videos as VideoData[] | undefined;

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <Skeleton className="h-8 w-32 mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                    </div>
                    <Skeleton className="h-80 w-full rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="max-w-4xl mx-auto text-center py-20">
                <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Course not found</h2>
                <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been deleted.</p>
                <Link href="/courses">
                    <Button variant="outline" className="rounded-xl">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Courses
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Back Button */}
            <Link href="/courses" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Courses</span>
            </Link>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Course Info Card */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-6"
                    >
                        {/* Thumbnail */}
                        <div className="aspect-video relative bg-gray-100">
                            {course.thumbnail_url ? (
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-rose-50 to-orange-50">
                                    <Video className="h-12 w-12 text-rose-300" />
                                </div>
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                                <Badge
                                    className={
                                        course.is_published
                                            ? "bg-green-500 text-white shadow-lg"
                                            : "bg-amber-500 text-white shadow-lg"
                                    }
                                >
                                    {course.is_published ? "Published" : "Draft"}
                                </Badge>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-5">
                            <h1 className="text-xl font-bold text-gray-900 mb-2">
                                {course.title}
                            </h1>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                                {course.description || "No description provided."}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-5 pb-5 border-b border-gray-100">
                                <span className="flex items-center gap-1.5">
                                    <Video className="h-4 w-4" />
                                    {course.video_count || videos?.length || 0} videos
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {new Date(course.created_at).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Actions */}
                            {isOwner && !course.is_published && (
                                <Button
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/20"
                                >
                                    {isPublishing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Publishing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Publish Course
                                        </>
                                    )}
                                </Button>
                            )}

                            {course.is_published && (
                                <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-3 rounded-xl justify-center">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Course is live
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Course Content (Videos) */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-rose-500" />
                        Course Content
                        <Badge variant="outline" className="ml-2 text-gray-500">
                            {videos?.length || 0} videos
                        </Badge>
                    </h2>

                    <div className="space-y-3">
                        {videos && videos.length > 0 ? (
                            videos.map((video, index) => (
                                <motion.div
                                    key={video.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                                >
                                    {/* Video Header */}
                                    <div
                                        className={`p-4 flex items-center gap-4 transition-colors ${video.has_quiz ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                        onClick={() => video.has_quiz && toggleVideoExpand(video.id)}
                                    >
                                        <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {video.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                                                </span>
                                                <span className={`flex items-center gap-1 ${video.analysis_status === 'COMPLETED' ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {video.analysis_status === 'COMPLETED' ? (
                                                        <><CheckCircle2 className="h-3 w-3" /> Analyzed</>
                                                    ) : (
                                                        <><Loader2 className="h-3 w-3 animate-spin" /> {video.analysis_status}</>
                                                    )}
                                                </span>
                                            </p>
                                        </div>

                                        {/* Quiz Indicator */}
                                        {video.has_quiz ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`rounded-lg gap-1 ${expandedVideo === video.id ? 'bg-rose-50 text-rose-600' : 'text-rose-500 hover:text-rose-600 hover:bg-rose-50'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleVideoExpand(video.id);
                                                }}
                                            >
                                                <HelpCircle className="h-4 w-4" />
                                                {expandedVideo === video.id ? 'Hide Quiz' : 'View Quiz'}
                                                {expandedVideo === video.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        ) : (
                                            <Badge variant="outline" className="text-gray-400">
                                                No Quiz
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Expanded Quiz Section */}
                                    <AnimatePresence>
                                        {expandedVideo === video.id && video.has_quiz && video.quiz_data && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
                                                    {/* Quiz Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                                            <HelpCircle className="h-4 w-4 text-rose-500" />
                                                            Quiz Questions ({video.quiz_data.questions?.length || 0})
                                                        </h4>
                                                        {isOwner && editingVideo !== video.id && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-gray-500 hover:text-gray-900 rounded-lg gap-1"
                                                                onClick={() => startEditingQuiz(video)}
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                                Edit Quiz
                                                            </Button>
                                                        )}
                                                        {editingVideo === video.id && (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-gray-500 hover:text-gray-900 rounded-lg"
                                                                    onClick={cancelEditing}
                                                                >
                                                                    <X className="h-4 w-4 mr-1" />
                                                                    Cancel
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg"
                                                                    onClick={saveQuizChanges}
                                                                >
                                                                    <Save className="h-4 w-4 mr-1" />
                                                                    Save
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Questions List */}
                                                    <div className="space-y-4">
                                                        {(editingVideo === video.id ? editedQuestions : video.quiz_data.questions)?.map((q, qIndex) => (
                                                            <div key={qIndex} className="bg-white rounded-xl p-4 border border-gray-100">
                                                                {editingVideo === video.id ? (
                                                                    /* Edit Mode */
                                                                    <div className="space-y-3">
                                                                        <div className="flex items-start justify-between gap-2">
                                                                            <div className="flex-1">
                                                                                <Label className="text-xs text-gray-500 mb-1 block">Question {qIndex + 1}</Label>
                                                                                <Input
                                                                                    value={q.q}
                                                                                    onChange={(e) => updateQuestion(qIndex, 'q', e.target.value)}
                                                                                    className="border-gray-200 focus:border-rose-500 rounded-lg"
                                                                                    placeholder="Enter question..."
                                                                                />
                                                                            </div>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg mt-5"
                                                                                onClick={() => removeQuestion(qIndex)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            {q.options.map((opt, optIndex) => (
                                                                                <div key={optIndex} className="flex items-center gap-2">
                                                                                    <input
                                                                                        type="radio"
                                                                                        name={`correct-${video.id}-${qIndex}`}
                                                                                        checked={q.answer === opt}
                                                                                        onChange={() => updateQuestion(qIndex, 'answer', opt)}
                                                                                        className="text-rose-500 focus:ring-rose-500"
                                                                                    />
                                                                                    <Input
                                                                                        value={opt}
                                                                                        onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                                                                        className="flex-1 border-gray-200 focus:border-rose-500 rounded-lg text-sm"
                                                                                        placeholder={`Option ${optIndex + 1}`}
                                                                                    />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    /* View Mode */
                                                                    <>
                                                                        <p className="font-medium text-gray-800 mb-3">
                                                                            <span className="text-rose-500 mr-2">Q{qIndex + 1}.</span>
                                                                            {q.q}
                                                                        </p>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                            {q.options.map((opt, optIndex) => (
                                                                                <div
                                                                                    key={optIndex}
                                                                                    className={`p-2 rounded-lg text-sm ${opt === q.answer
                                                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                                                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                                                                                        }`}
                                                                                >
                                                                                    <span className="font-medium mr-2">
                                                                                        {String.fromCharCode(65 + optIndex)}.
                                                                                    </span>
                                                                                    {opt}
                                                                                    {opt === q.answer && (
                                                                                        <CheckCircle2 className="h-4 w-4 inline ml-2 text-green-500" />
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Add Question Button (Edit Mode) */}
                                                        {editingVideo === video.id && (
                                                            <Button
                                                                variant="outline"
                                                                className="w-full border-dashed border-gray-300 text-gray-500 hover:text-rose-500 hover:border-rose-300 rounded-xl"
                                                                onClick={addQuestion}
                                                            >
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Add Question
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <Video className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No videos in this course yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
