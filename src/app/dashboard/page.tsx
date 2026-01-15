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
function StatsCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    color = "rose",
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    trend?: string;
    color?: "rose" | "purple" | "green" | "blue" | "amber";
}) {
    const colorClasses = {
        rose: "bg-rose-50 text-rose-500 border-rose-100",
        purple: "bg-purple-50 text-purple-500 border-purple-100",
        green: "bg-green-50 text-green-500 border-green-100",
        blue: "bg-blue-50 text-blue-500 border-blue-100",
        amber: "bg-amber-50 text-amber-500 border-amber-100",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-gray-900">{value}</p>
                                {trend && (
                                    <span className="text-xs font-medium text-green-600 flex items-center gap-0.5">
                                        <TrendingUp className="h-3 w-3" />
                                        {trend}
                                    </span>
                                )}
                            </div>
                            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                        </div>
                        <div className={`h-11 w-11 rounded-xl ${colorClasses[color]} border flex items-center justify-center`}>
                            <Icon className="h-5 w-5" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

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
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600 p-6 md:p-8 text-white mb-8"
        >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-sm font-medium text-white/80">{greeting}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome back, {name}! 👋
                </h1>
                <p className="text-white/80 max-w-lg">
                    {isCreator
                        ? "Ready to create amazing learning experiences? Your courses are making an impact."
                        : "Continue your learning journey and earn credentials that matter."}
                </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap gap-3">
                {isCreator ? (
                    <>
                        <Link href="/courses/import">
                            <Button className="bg-white text-rose-600 hover:bg-white/90 shadow-lg">
                                <Plus className="mr-2 h-4 w-4" />
                                Import Playlist
                            </Button>
                        </Link>
                        <Link href="/analytics">
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View Analytics
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/courses">
                            <Button className="bg-white text-rose-600 hover:bg-white/90 shadow-lg">
                                <Play className="mr-2 h-4 w-4" />
                                Explore Courses
                            </Button>
                        </Link>
                        <Link href="/certificates">
                            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                                <Award className="mr-2 h-4 w-4" />
                                My Certificates
                            </Button>
                        </Link>
                    </>
                )}
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
                    <Card className="border-gray-200 border-dashed bg-gray-50/50">
                        <CardContent className="p-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="h-8 w-8 text-rose-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 mb-2">Start Your Learning Journey</h3>
                            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                                Discover courses from top creators and earn verified credentials
                            </p>
                            <Link href="/courses">
                                <Button className="bg-rose-500 hover:bg-rose-600 text-white shadow-md">
                                    <Play className="mr-2 h-4 w-4" />
                                    Explore Courses
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {enrollments
                            .filter((e) => !e.is_completed)
                            .slice(0, 3)
                            .map((enrollment) => (
                                <Card
                                    key={enrollment.id}
                                    className="border-gray-100 bg-white hover:shadow-lg transition-all duration-200 group cursor-pointer overflow-hidden"
                                >
                                    <CardContent className="p-0">
                                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/10 transition-colors">
                                                <div className="w-14 h-14 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Play className="h-6 w-6 text-rose-500 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 truncate mb-2">
                                                {enrollment.playlist?.title || "Course"}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <Badge className="bg-rose-50 text-rose-600 border-0 text-xs">
                                                    In Progress
                                                </Badge>
                                                <span className="text-xs text-gray-400">Continue →</span>
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
                    <Card className="border-gray-200 border-dashed bg-gray-50/50">
                        <CardContent className="p-10 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                                <Video className="h-8 w-8 text-purple-400" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-800 mb-2">Create Your First Course</h3>
                            <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
                                Import a YouTube playlist and transform it into an interactive learning experience
                            </p>
                            <Link href="/courses/import">
                                <Button className="bg-rose-500 hover:bg-rose-600 text-white shadow-md">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Import Playlist
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.slice(0, 3).map((course) => (
                            <Card key={course.id} className="border-gray-100 bg-white hover:shadow-lg transition-all duration-200 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                                        {course.thumbnail_url ? (
                                            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Video className="h-10 w-10 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 truncate mb-2">{course.title}</h3>
                                        <div className="flex items-center justify-between">
                                            <Badge
                                                className={
                                                    course.is_published
                                                        ? "bg-green-50 text-green-600 border-green-100 text-xs"
                                                        : "bg-amber-50 text-amber-600 border-amber-100 text-xs"
                                                }
                                            >
                                                {course.is_published ? "Published" : "Draft"}
                                            </Badge>
                                            <span className="text-xs text-gray-400">{course.video_count || 0} videos</span>
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
