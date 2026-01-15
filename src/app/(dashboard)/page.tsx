"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BookOpen,
    Award,
    TrendingUp,
    Play,
    ArrowRight,
    Video,
    Users,
    BarChart3,
    Plus,
    Clock,
    MoreHorizontal,
    CheckCircle2
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { UserRole, type Playlist, type Enrollment, type Certificate } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// --- Styled Components for Sundays Theme ---

function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    color = "rose",
}: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    color?: "rose" | "purple" | "green" | "blue" | "orange";
}) {
    const colors = {
        rose: "bg-rose-50 text-rose-500",
        purple: "bg-purple-50 text-purple-500",
        green: "bg-green-50 text-green-500",
        blue: "bg-blue-50 text-blue-500",
        orange: "bg-orange-50 text-orange-500",
    };

    return (
        <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-gray-100/50 hover:shadow-sm hover:border-gray-200 transition-all group">
            <div className={`h-12 w-12 rounded-xl ${colors[color]} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-0.5">{title}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-xl font-bold text-gray-900 leading-none">{value}</h3>
                    {trend && (
                        <span className="text-xs font-medium text-green-600 flex items-center mb-0.5">
                            <TrendingUp className="h-3 w-3 mr-0.5" />
                            {trend}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function CourseRow({
    title,
    subtitle,
    status,
    progress,
    thumbnail,
    href
}: {
    title: string;
    subtitle: string;
    status: "In Progress" | "Completed" | "Draft" | "Published";
    progress?: number;
    thumbnail?: string;
    href: string;
}) {
    const statusStyles = {
        "In Progress": "bg-orange-100 text-orange-700",
        "Completed": "bg-green-100 text-green-700",
        "Draft": "bg-gray-100 text-gray-700",
        "Published": "bg-blue-100 text-blue-700",
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-gray-200 transition-all mb-3">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {thumbnail ? (
                        <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50">
                            <Play className="h-4 w-4 text-gray-400" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate mb-0.5 group-hover:text-rose-600 transition-colors">
                        <Link href={href}>{title}</Link>
                    </h4>
                    <p className="text-xs text-gray-500 truncate font-medium">{subtitle}</p>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-6 ml-4">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${statusStyles[status]}`}>
                    {status}
                </span>

                <div className="flex items-center gap-2 min-w-[100px]">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500 font-medium">Self-paced</span>
                </div>

                {progress !== undefined && (
                    <div className="flex items-center gap-3 w-32">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 w-8">{progress}%</span>
                    </div>
                )}
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-gray-900 ml-4 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </div>
    );
}

// --- Dashboards ---

function StudentDashboard() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [enrollmentsData, certificatesData] = await Promise.all([
                    api.getEnrollments().catch(() => []),
                    api.getCertificates().catch(() => []),
                ]);
                setEnrollments(enrollmentsData);
                setCertificates(certificatesData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const completedCourses = enrollments.filter((e) => e.is_completed).length;
    const inProgressEnrollments = enrollments.filter((e) => !e.is_completed);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Enrolled Courses"
                    value={enrollments.length}
                    icon={BookOpen}
                    color="orange"
                />
                <StatsCard
                    title="Completed"
                    value={completedCourses}
                    icon={CheckCircle2}
                    trend={enrollments.length > 0 ? `${Math.round((completedCourses / enrollments.length) * 100)}%` : undefined}
                    color="green"
                />
                <StatsCard
                    title="Certificates"
                    value={certificates.length}
                    icon={Award}
                    color="purple"
                />
            </div>

            {/* In Progress Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        In Progress
                    </h2>
                    <Link href="/courses">
                        <Button className="h-9 rounded-xl bg-black text-white hover:bg-gray-800 font-medium px-4 shadow-lg shadow-black/5 text-xs">
                            <Plus className="mr-2 h-3.5 w-3.5" /> Explore New
                        </Button>
                    </Link>
                </div>

                {inProgressEnrollments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <BookOpen className="h-6 w-6 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">No courses in progress</h3>
                        <p className="text-xs text-gray-500 mb-4">Jump back in or start something new.</p>
                        <Link href="/courses">
                            <Button size="sm" variant="outline" className="rounded-xl border-gray-200">
                                Browse Library
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {inProgressEnrollments.map((enrollment) => (
                            <CourseRow
                                key={enrollment.id}
                                title={enrollment.playlist?.title || "Untitled Course"}
                                subtitle="Video Course"
                                status="In Progress"
                                progress={35} // Mock progress as backend doesn't provide % yet
                                href={`/courses/${enrollment.playlist?.id}`}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* Completed Section (if any) */}
            {completedCourses > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4 mt-8">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                            Completed
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {enrollments.filter(e => e.is_completed).map((enrollment) => (
                            <CourseRow
                                key={enrollment.id}
                                title={enrollment.playlist?.title || "Untitled Course"}
                                subtitle="Completed"
                                status="Completed"
                                progress={100}
                                href={`/courses/${enrollment.playlist?.id}`}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

// Creator Dashboard
function CreatorDashboard() {
    const [courses, setCourses] = useState<Playlist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const coursesData = await api.getCreatorCourses().catch(() => []);
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to load creator data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    const publishedCourses = courses.filter((c) => c.is_published).length;
    const draftCourses = courses.filter((c) => !c.is_published).length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatsCard title="Total Courses" value={courses.length} icon={Video} color="rose" />
                <StatsCard title="Published" value={publishedCourses} icon={Play} color="green" />
                <StatsCard title="Drafts" value={draftCourses} icon={BookOpen} color="blue" />
                <StatsCard title="Students" value="—" icon={Users} color="purple" />
            </div>

            {/* Quick Actions & Recent */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Quick Actions
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <Link href="/courses/import">
                        <div className="group flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-50 transition-all cursor-pointer">
                            <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                                <Plus className="h-7 w-7 text-rose-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">Import Playlist</h3>
                                <p className="text-sm text-gray-500 font-medium">Create from YouTube</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-rose-500 transition-colors" />
                        </div>
                    </Link>

                    <Link href="/analytics">
                        <div className="group flex items-center gap-4 p-6 bg-white rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-50 transition-all cursor-pointer">
                            <div className="h-14 w-14 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                                <BarChart3 className="h-7 w-7 text-purple-500 group-hover:text-white transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 leading-tight">View Analytics</h3>
                                <p className="text-sm text-gray-500 font-medium">Track engagement</p>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        Recent Uploads
                    </h2>
                    <Link href="/courses">
                        <Button variant="ghost" className="text-xs font-medium text-gray-500 hover:text-gray-900">
                            View All
                        </Button>
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-1">No courses created yet</h3>
                        <Link href="/courses/import">
                            <Button size="sm" className="mt-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
                                Import First Course
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {courses.slice(0, 5).map((course) => (
                            <CourseRow
                                key={course.id}
                                title={course.title}
                                subtitle={course.is_published ? "Published on " + new Date().toLocaleDateString() : "Draft - Not visible"}
                                status={course.is_published ? "Published" : "Draft"}
                                thumbnail={course.thumbnail_url}
                                href={`/courses/${course.id}`}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        Welcome back, {user?.full_name?.split(" ")[0]}
                    </p>
                </div>
            </div>

            {user?.role === UserRole.CREATOR ? <CreatorDashboard /> : <StudentDashboard />}
        </div>
    );
}
