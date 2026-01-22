"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    Users,
    TrendingUp,
    BookOpen,
    Award,
    Clock,
    ArrowUp,
    ArrowDown,
    ChevronDown,
} from "lucide-react";

import { api } from "@/lib/api";
import { type Playlist, type CourseAnalytics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    color,
}: {
    title: string;
    value: string | number;
    change?: { value: number; positive: boolean };
    icon: React.ElementType;
    color: string;
}) {
    return (
        <Card className="rounded-none border-gray-200 bg-white hover:border-black transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">{title}</p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
                        {change && (
                            <p
                                className={`text-sm mt-1 flex items-center gap-1 font-medium ${change.positive ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                {change.positive ? (
                                    <ArrowUp className="h-3 w-3" />
                                ) : (
                                    <ArrowDown className="h-3 w-3" />
                                )}
                                {change.value}% this week
                            </p>
                        )}
                    </div>
                    <div
                        className={`h-12 w-12 rounded-none bg-linear-to-br ${color} flex items-center justify-center shadow-none`}
                    >
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AnalyticsPage() {
    const [courses, setCourses] = useState<Playlist[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
    const [analytics, setAnalytics] = useState<CourseAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCourses() {
            try {
                const data = await api.getCreatorCourses().catch(() => []);
                setCourses(data);
                if (data.length > 0) {
                    setSelectedCourse(data[0].id);
                }
            } catch (error) {
                console.error("Failed to load courses:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCourses();
    }, []);

    useEffect(() => {
        async function loadAnalytics() {
            if (!selectedCourse) return;
            try {
                const data = await api.getCourseAnalytics(selectedCourse);
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to load analytics:", error);
                setAnalytics(null);
            }
        }
        loadAnalytics();
    }, [selectedCourse]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48 rounded-none" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-none" />
                    ))}
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Analytics</h1>
                <Card className="rounded-none border-gray-200 bg-white border-dashed">
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No courses to analyze</h3>
                        <p className="text-gray-500">
                            Import a YouTube playlist first to see analytics
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Analytics</h1>
                    <p className="text-gray-500 font-medium">
                        Track student engagement across your courses
                    </p>
                </div>

                {/* Course Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Select Course:</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-black transition-all rounded-none text-sm font-bold text-gray-900 min-w-[200px] justify-between group">
                                <span className="truncate max-w-[200px]">
                                    {courses.find(c => c.id === selectedCourse)?.title || "Select Course"}
                                </span>
                                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[240px] rounded-none border-gray-200 bg-white p-0">
                            {courses.map((course) => (
                                <DropdownMenuItem
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course.id)}
                                    className={`rounded-none px-4 py-2.5 cursor-pointer focus:bg-gray-50 focus:text-black ${selectedCourse === course.id ? "bg-gray-50 font-bold text-black" : "text-gray-600"
                                        }`}
                                >
                                    <span className="truncate">{course.title}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Enrollments"
                    value={analytics?.total_enrollments || 0}
                    icon={Users}
                    color="from-purple-600 to-indigo-600"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${analytics?.completion_rate ? Math.round(analytics.completion_rate) : 0}%`}
                    icon={TrendingUp}
                    color="from-emerald-500 to-teal-600"
                />
                <StatCard
                    title="Avg Quiz Score"
                    value={`${analytics?.average_quiz_score ? Math.round(analytics.average_quiz_score) : 0}%`}
                    icon={Award}
                    color="from-rose-500 to-pink-600"
                />
                <StatCard
                    title="Active Students"
                    value={analytics?.enrollments?.filter((e) => e.completion_percentage < 100).length || 0}
                    icon={BookOpen}
                    color="from-blue-500 to-cyan-600"
                />
            </div>

            {/* Enrollments Table */}
            <Card className="rounded-none border-gray-200 bg-white">
                <CardHeader>
                    <CardTitle className="text-gray-900 tracking-tight">Student Enrollments</CardTitle>
                    <CardDescription className="text-gray-500">
                        Detailed breakdown of student progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!analytics?.enrollments || analytics.enrollments.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            No students enrolled yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Enrolled
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Progress
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Avg Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics.enrollments.map((enrollment, index) => (
                                        <motion.tr
                                            key={enrollment.user_email}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                                {enrollment.user_email}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-gray-500">
                                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-none overflow-hidden">
                                                        <div
                                                            className="h-full bg-black rounded-none"
                                                            style={{ width: `${enrollment.completion_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-500 w-10 text-right">
                                                        {Math.round(enrollment.completion_percentage)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={`rounded-none font-bold border-0 ${enrollment.average_quiz_score >= 75
                                                        ? "bg-green-100 text-green-700"
                                                        : enrollment.average_quiz_score >= 50
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {Math.round(enrollment.average_quiz_score)}%
                                                </Badge>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
