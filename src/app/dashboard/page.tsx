"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    Target,
    Sparkles,
    Calendar,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { UserRole, type Playlist, type Enrollment, type Certificate } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
// import { Progress } from "@/components/ui/progress";

// Enhanced Stats Card Component
const StatsCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    color?: string;
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border border-gray-200 bg-white shadow-none hover:border-black transition-all duration-300 rounded-none group h-full">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                                {trend && (
                                    <span className="text-xs font-medium text-black flex items-center gap-0.5 bg-gray-100 px-1 py-0.5 rounded-none">
                                        <TrendingUp className="h-3 w-3" />
                                        {trend}
                                    </span>
                                )}
                            </div>
                            {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium">{subtitle}</p>}
                        </div>
                        <div className="h-10 w-10 text-gray-900 group-hover:text-black transition-colors">
                            <Icon className="h-6 w-6 stroke-[1.5]" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

// Welcome Banner Component
function WelcomeBanner({ name, role }: { name: string; role: string }) {
    const isCreator = role === "CREATOR";
    const greeting = getGreeting();

    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-none bg-black p-8 md:p-10 text-white mb-8 border-b-4 border-rose-500"
        >
            {/* Premium Background from Auth */}
            <div className="absolute inset-0 bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-rose-900 opacity-90 z-0" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent blur-3xl z-1 my-auto" />
            <div className="absolute inset-0 z-0 opacity-30 bg-[image:var(--noise-pattern)] brightness-100 contrast-150 mix-blend-overlay"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">
                            Dashboard
                        </span>
                        <span className="text-sm font-medium text-white/60 uppercase tracking-widest">{greeting}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight leading-tight">
                        Welcome, {name}
                    </h1>
                    <p className="text-white/70 max-w-xl text-lg font-light leading-relaxed">
                        {isCreator
                            ? "Create. Inspire. Educate."
                            : "Your journey to clarity starts here."}
                    </p>
                </div>

                <div className="flex gap-3">
                    {isCreator ? (
                        <>
                            <Link href="/courses/import">
                                <Button className="bg-white text-black hover:bg-gray-100 rounded-none h-12 px-6 font-semibold border-2 border-transparent">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Import Playlist
                                </Button>
                            </Link>
                            <Link href="/analytics">
                                <Button variant="outline" className="bg-transparent border-2 border-white/20 text-white hover:bg-white/10 rounded-none h-12 px-6 font-semibold">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Analytics
                                </Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/courses">
                                <Button className="bg-white text-black hover:bg-gray-100 rounded-none h-12 px-6 font-semibold border-2 border-transparent">
                                    <Play className="mr-2 h-4 w-4" />
                                    Explore
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Student Dashboard
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
    const inProgressCourses = enrollments.filter((e) => !e.is_completed).length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Enrolled"
                    value={enrollments.length}
                    subtitle="Total courses"
                    icon={BookOpen}
                    color="rose"
                />
                <StatsCard
                    title="In Progress"
                    value={inProgressCourses}
                    subtitle="Keep learning!"
                    icon={Clock}
                    color="blue"
                />
                <StatsCard
                    title="Completed"
                    value={completedCourses}
                    subtitle={enrollments.length > 0 ? `${Math.round((completedCourses / enrollments.length) * 100)}% completion` : undefined}
                    icon={Target}
                    color="green"
                />
                <StatsCard
                    title="Certificates"
                    value={certificates.length}
                    subtitle="Earned credentials"
                    icon={Award}
                    color="purple"
                />
            </div>

            {/* Continue Learning Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
                    <Link href="/courses">
                        <Button variant="ghost" className="text-gray-500 hover:text-gray-900 text-sm">
                            View all <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {inProgressCourses === 0 ? (
                    <Card className="border-gray-200 border-dashed bg-gray-50/50 rounded-none">
                        <CardContent className="p-10 text-center">
                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                <BookOpen className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">Start Your Learning Journey</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Discover courses from top creators and earn verified credentials
                            </p>
                            <Link href="/courses">
                                <Button className="bg-black text-white hover:bg-gray-800 rounded-none px-6">
                                    <Play className="mr-2 h-4 w-4" />
                                    Explore Courses
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments
                            .filter((e) => !e.is_completed)
                            .slice(0, 3)
                            .map((enrollment) => (
                                <Card
                                    key={enrollment.id}
                                    className="border-gray-200 bg-white hover:border-black transition-all duration-200 group cursor-pointer overflow-hidden rounded-none"
                                >
                                    <CardContent className="p-0">
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
                                                <div className="w-12 h-12 bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                                    <Play className="h-5 w-5 text-black ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-gray-900 truncate mb-3 text-lg">
                                                {enrollment.playlist?.title || "Course"}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-gray-100 text-black border-0 text-[10px] uppercase tracking-wider rounded-none px-2 font-bold">
                                                    In Progress
                                                </Badge>
                                                <span className="text-xs text-gray-500 font-medium">Continue →</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </div>
                )}
            </section>
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
                        <Skeleton key={i} className="h-28 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard title="Total Courses" value={courses.length} subtitle="Created by you" icon={Video} color="rose" />
                <StatsCard title="Published" value={publishedCourses} subtitle="Live courses" icon={Play} color="green" />
                <StatsCard title="Drafts" value={draftCourses} subtitle="Work in progress" icon={BookOpen} color="amber" />
                <StatsCard title="Students" value="—" subtitle="Enrolled learners" icon={Users} color="purple" />
            </div>

            {/* Quick Actions */}
            <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/courses/import">
                        <Card className="border-gray-100 hover:border-rose-200 hover:shadow-md transition-all cursor-pointer group h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-200/50 group-hover:scale-105 transition-transform">
                                    <Plus className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">Import YouTube Playlist</h3>
                                    <p className="text-sm text-gray-500">Convert your content into courses</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/analytics">
                        <Card className="border-gray-100 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group h-full">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200/50 group-hover:scale-105 transition-transform">
                                    <BarChart3 className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">View Analytics</h3>
                                    <p className="text-sm text-gray-500">Track student engagement</p>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </section>

            {/* My Courses */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
                    <Link href="/courses">
                        <Button variant="ghost" className="text-gray-500 hover:text-gray-900 text-sm">
                            View all <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <Card className="border-gray-200 border-dashed bg-gray-50/50 rounded-none">
                        <CardContent className="p-10 text-center">
                            <div className="w-16 h-16 bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-gray-200">
                                <Video className="h-8 w-8 text-gray-500" />
                            </div>
                            <h3 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">Create Your First Course</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                Import a YouTube playlist and transform it into an interactive learning experience
                            </p>
                            <Link href="/courses/import">
                                <Button className="bg-black hover:bg-gray-800 text-white rounded-none px-6 h-11">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Import Playlist
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.slice(0, 3).map((course) => (
                            <Card key={course.id} className="border-gray-200 bg-white hover:border-black transition-all duration-200 overflow-hidden rounded-none group">
                                <CardContent className="p-0">
                                    <div className="aspect-video bg-gray-100 overflow-hidden relative">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Video className="h-10 w-10 text-gray-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge
                                                className={
                                                    course.is_published
                                                        ? "bg-green-100 text-green-700 border-0 text-[10px] uppercase font-bold tracking-wider rounded-none"
                                                        : "bg-yellow-100 text-yellow-700 border-0 text-[10px] uppercase font-bold tracking-wider rounded-none"
                                                }
                                            >
                                                {course.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-gray-900 truncate mb-1 text-lg">{course.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium">{course.video_count || 0} VIDEOS</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useAuth();
    const firstName = user?.full_name?.split(" ")[0] || "there";

    return (
        <div className="max-w-6xl mx-auto">
            <WelcomeBanner name={firstName} role={user?.role || "STUDENT"} />
            {user?.role === UserRole.CREATOR ? <CreatorDashboard /> : <StudentDashboard />}
        </div>
    );
}
