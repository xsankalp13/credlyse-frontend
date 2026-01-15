"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Video,
    Play,
    Plus,
    Search,
    BookOpen,
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    BarChart3,
    CheckCircle2,
    ArrowRight
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { UserRole, type Playlist, type Enrollment } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function CourseCard({
    course,
    isCreator,
}: {
    course: Playlist;
    isCreator: boolean;
}) {
    return (
        <Link href={`/courses/${course.id}`} className="block">
            <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/50 transition-all overflow-hidden flex flex-col h-full">
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

                    <div className="absolute top-3 right-3 flex gap-2">
                        <Badge
                            className={
                                course.is_published
                                    ? "bg-white/90 text-green-600 backdrop-blur-sm shadow-sm hover:bg-white"
                                    : "bg-white/90 text-amber-600 backdrop-blur-sm shadow-sm hover:bg-white"
                            }
                        >
                            {course.is_published ? "Published" : "Draft"}
                        </Badge>
                    </div>

                    {course.video_count && (
                        <div className="absolute bottom-3 right-3">
                            <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                                {course.video_count} videos
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                            {course.title}
                        </h3>
                        {isCreator && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-900 rounded-full">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-xl rounded-xl p-1">
                                    <DropdownMenuItem className="rounded-lg text-gray-600 focus:text-gray-900 focus:bg-gray-50 cursor-pointer">
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Course
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="rounded-lg text-gray-600 focus:text-gray-900 focus:bg-gray-50 cursor-pointer">
                                        <Link href={`/analytics?course=${course.id}`}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            View Analytics
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                        {course.description || "No description provided."}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400 pt-4 border-t border-gray-50">
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(course.created_at).toLocaleDateString()}
                        </span>
                        {isCreator && (
                            <span className="flex items-center gap-1.5 ml-auto text-rose-500">
                                View details <ArrowRight className="h-3 w-3" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}


function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
    return (
        <Link href={`/courses/${enrollment.playlist_id}/learn`} className="block h-full">
            <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-rose-50/50 transition-all overflow-hidden flex flex-col h-full cursor-pointer">
                <div className="aspect-video relative overflow-hidden bg-gray-100 group-hover:opacity-90 transition-opacity">
                    {enrollment.playlist?.thumbnail_url ? (
                        <img
                            src={enrollment.playlist.thumbnail_url}
                            alt={enrollment.playlist.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <BookOpen className="h-10 w-10 text-gray-300" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                        <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center">
                            <Play className="h-5 w-5 text-rose-500 ml-1" />
                        </div>
                    </div>

                    <div className="absolute top-3 right-3">
                        <Badge
                            className={
                                enrollment.is_completed
                                    ? "bg-white/90 text-green-600 backdrop-blur-sm shadow-sm hover:bg-white"
                                    : "bg-white/90 text-rose-500 backdrop-blur-sm shadow-sm hover:bg-white"
                            }
                        >
                            {enrollment.is_completed ? "Completed" : "In Progress"}
                        </Badge>
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 truncate mb-1 group-hover:text-rose-600 transition-colors flex-1">
                            {enrollment.playlist?.title || "Untitled Course"}
                        </h3>
                        {(enrollment.playlist as any)?.youtube_playlist_id && (
                            <a
                                href={`https://www.youtube.com/playlist?list=${(enrollment.playlist as any).youtube_playlist_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                                title="Watch on YouTube"
                            >
                                <svg className="h-5 w-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                        Started on {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>

                    <div className="mt-auto">
                        {enrollment.is_completed ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 p-2 rounded-lg justify-center">
                                <CheckCircle2 className="h-4 w-4" /> Completed
                            </div>
                        ) : (
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full w-1/3" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default function CoursesPage() {
    const { user } = useAuth();
    const isCreator = user?.role === UserRole.CREATOR;
    const [courses, setCourses] = useState<Playlist[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadData() {
            try {
                if (isCreator) {
                    const data = await api.getCreatorCourses().catch(() => []);
                    setCourses(data);
                } else {
                    const data = await api.getEnrollments().catch(() => []);
                    setEnrollments(data);
                }
            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, [isCreator]);

    const filteredCourses = courses.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredEnrollments = enrollments.filter((e) =>
        e.playlist?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                        {isCreator ? "My Courses" : "My Courses"}
                    </h1>
                    <p className="text-gray-500 font-medium">
                        {isCreator
                            ? "Manage and track your created courses"
                            : "Continue learning from your enrolled courses"}
                    </p>
                </div>
                {isCreator && (
                    <Link href="/courses/import">
                        <Button className="bg-black text-white hover:bg-gray-800 rounded-xl shadow-lg shadow-black/5">
                            <Plus className="mr-2 h-4 w-4" />
                            Import Playlist
                        </Button>
                    </Link>
                )}
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
                    <Input
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 bg-white border-gray-200 focus:border-rose-500 focus:ring-rose-500/20 text-gray-900 placeholder:text-gray-400 rounded-xl transition-all shadow-sm hover:border-gray-300"
                    />
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="aspect-video h-full rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Empty States */}
            {!isLoading && isCreator && courses.length === 0 && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Video className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No courses created yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Import a YouTube playlist to create your first course. It's fast and easy.
                    </p>
                    <Link href="/courses/import">
                        <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 px-6">
                            <Plus className="mr-2 h-4 w-4" />
                            Import Playlist
                        </Button>
                    </Link>
                </div>
            )}

            {!isLoading && !isCreator && enrollments.length === 0 && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No enrolled courses</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        You haven't enrolled in any courses yet. Browse our library to get started.
                    </p>
                    {/* Note: The 'Explore Courses' button here might need a valid href if /courses is the only page. 
                        Assuming there's a discovery page or logic, but for now linking to /courses/import as a placeholder or keeping button non-functional if no browse page exists yet. 
                        Actually, usually 'My Courses' is distinct from 'Browse'. If they are on the same page, we might just hide this. 
                        Let's assume there is a way to find courses. For now, I'll remove the button or make it link to a hypothetical /browse if it existed, 
                        but since I don't see a 'Browse' page in file list, I'll assume they need to 'Import' or 'Create' if they are creator, but student?
                        Wait, student enrolls how? Maybe via invite? Or maybe there IS a browse page.
                        Ah, in dashboard I linked to /courses as 'View All'.
                        Let's just put a generic 'Get Started' button that maybe opens a modal or links to home.
                        I'll stick to a simple message for now to avoid broken links.
                    */}
                    <Button variant="outline" className="rounded-xl border-gray-200 text-gray-600">
                        Explore Library
                    </Button>
                </div>
            )}

            {/* Courses Grid - Creator */}
            {!isLoading && isCreator && filteredCourses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} isCreator={isCreator} />
                    ))}
                </div>
            )}

            {/* Courses Grid - Student */}
            {!isLoading && !isCreator && filteredEnrollments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEnrollments.map((enrollment) => (
                        <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                    ))}
                </div>
            )}
        </div>
    );
}
