"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Video,
    Search,
    BookOpen,
    Users,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    Sparkles,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { type Playlist } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

function CourseCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full mt-4" />
            </div>
        </div>
    );
}

interface CourseWithCreator extends Playlist {
    creator?: {
        full_name: string;
    };
}

export default function ExplorePage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [courses, setCourses] = useState<CourseWithCreator[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [enrollingId, setEnrollingId] = useState<string | null>(null);
    const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch enrolled courses to show "Enrolled" badge
    useEffect(() => {
        async function loadEnrollments() {
            if (!isAuthenticated) return;
            try {
                const enrollments = await api.getEnrollments();
                const ids = new Set(enrollments.map(e => e.playlist_id));
                setEnrolledIds(ids);
            } catch (error) {
                console.error("Failed to load enrollments:", error);
            }
        }
        loadEnrollments();
    }, [isAuthenticated]);

    // Fetch courses
    useEffect(() => {
        async function loadCourses() {
            setIsLoading(true);
            try {
                const data = await api.getPublishedCourses(1, 50, debouncedSearch || undefined);
                setCourses(data.items);
            } catch (error) {
                console.error("Failed to load courses:", error);
                toast.error("Failed to load courses");
            } finally {
                setIsLoading(false);
            }
        }
        loadCourses();
    }, [debouncedSearch]);

    const handleEnroll = async (course: CourseWithCreator) => {
        if (!isAuthenticated) {
            toast.error("Please login to enroll in courses");
            router.push("/login");
            return;
        }

        // Need first video ID to enroll
        const videos = (course as any).videos;
        if (!videos || videos.length === 0) {
            toast.error("This course has no videos yet");
            return;
        }

        setEnrollingId(course.id);
        try {
            await api.enrollInCourse(videos[0].id);
            setEnrolledIds(prev => new Set([...prev, course.id]));
            toast.success(`Enrolled in "${course.title}"!`);
        } catch (error: any) {
            toast.error(error.message || "Failed to enroll");
        } finally {
            setEnrollingId(null);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Back to My Courses</span>
                </Link>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-rose-500" />
                            Explore Courses
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Discover courses from our creators and start learning today
                        </p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by course title or creator name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 py-6 bg-white border-gray-200 rounded-xl text-base focus:border-rose-300 focus:ring-rose-100"
                    />
                    {isLoading && debouncedSearch && (
                        <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                    )}
                </div>
            </div>

            {/* Course Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <CourseCardSkeleton key={i} />
                    ))}
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {debouncedSearch ? "No courses found" : "No courses available"}
                    </h2>
                    <p className="text-gray-500">
                        {debouncedSearch
                            ? `No courses match "${debouncedSearch}". Try a different search.`
                            : "Check back later for new courses from our creators."
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => {
                        const isEnrolled = enrolledIds.has(course.id);
                        const isEnrolling = enrollingId === course.id;
                        const creatorName = course.creator?.full_name || "Unknown Creator";

                        return (
                            <div
                                key={course.id}
                                className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all overflow-hidden flex flex-col"
                            >
                                {/* Thumbnail */}
                                <Link href={`/courses/${course.id}`} className="block">
                                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={course.thumbnail_url}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                <Video className="h-10 w-10 text-gray-300" />
                                            </div>
                                        )}
                                        {course.video_count && (
                                            <div className="absolute bottom-3 right-3">
                                                <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                                                    {course.video_count} videos
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <Link href={`/courses/${course.id}`}>
                                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                                            {course.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
                                        {course.description || "No description provided."}
                                    </p>

                                    {/* Creator & Stats */}
                                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                                        <span className="flex items-center gap-1.5">
                                            <Users className="h-4 w-4" />
                                            {creatorName}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Video className="h-4 w-4" />
                                            {course.video_count || 0} videos
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    {isEnrolled ? (
                                        <Link href={`/courses/${course.id}`}>
                                            <Button
                                                variant="outline"
                                                className="w-full border-green-200 text-green-600 hover:bg-green-50 rounded-xl"
                                            >
                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                Enrolled - Continue Learning
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            onClick={() => handleEnroll(course)}
                                            disabled={isEnrolling}
                                            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                                        >
                                            {isEnrolling ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Enrolling...
                                                </>
                                            ) : (
                                                "Enroll Now"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
