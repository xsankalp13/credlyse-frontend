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
} from "lucide-react";

import { api } from "@/lib/api";
import { type Playlist, type CourseAnalytics } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

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
        <Card className="border-white/5 bg-slate-900/50">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">{title}</p>
                        <p className="text-3xl font-bold text-white">{value}</p>
                        {change && (
                            <p
                                className={`text-sm mt-1 flex items-center gap-1 ${change.positive ? "text-green-400" : "text-red-400"
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
                        className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}
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
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>
                <Card className="border-white/5 bg-slate-900/50 border-dashed">
                    <CardContent className="p-12 text-center">
                        <BarChart3 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">No courses to analyze</h3>
                        <p className="text-slate-400">
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
                    <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
                    <p className="text-slate-400">
                        Track student engagement across your courses
                    </p>
                </div>

                {/* Course Selector */}
                <div className="flex gap-2 flex-wrap">
                    {courses.map((course) => (
                        <button
                            key={course.id}
                            onClick={() => setSelectedCourse(course.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCourse === course.id
                                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                    : "bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-800"
                                }`}
                        >
                            {course.title.slice(0, 20)}
                            {course.title.length > 20 && "..."}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Enrollments"
                    value={analytics?.total_enrollments || 0}
                    icon={Users}
                    color="from-purple-500 to-purple-600"
                />
                <StatCard
                    title="Completion Rate"
                    value={`${analytics?.completion_rate ? Math.round(analytics.completion_rate) : 0}%`}
                    icon={TrendingUp}
                    color="from-green-500 to-green-600"
                />
                <StatCard
                    title="Avg Quiz Score"
                    value={`${analytics?.average_quiz_score ? Math.round(analytics.average_quiz_score) : 0}%`}
                    icon={Award}
                    color="from-red-500 to-red-600"
                />
                <StatCard
                    title="Active Students"
                    value={analytics?.enrollments?.filter((e) => e.completion_percentage < 100).length || 0}
                    icon={BookOpen}
                    color="from-blue-500 to-blue-600"
                />
            </div>

            {/* Enrollments Table */}
            <Card className="border-white/5 bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-white">Student Enrollments</CardTitle>
                    <CardDescription className="text-slate-400">
                        Detailed breakdown of student progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!analytics?.enrollments || analytics.enrollments.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No students enrolled yet
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Email
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Enrolled
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                            Progress
                                        </th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
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
                                            className="border-b border-white/5 hover:bg-white/5"
                                        >
                                            <td className="py-3 px-4 text-sm text-white">
                                                {enrollment.user_email}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-slate-400">
                                                {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-purple-500 to-red-500 rounded-full"
                                                            style={{ width: `${enrollment.completion_percentage}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-slate-400 w-12 text-right">
                                                        {Math.round(enrollment.completion_percentage)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge
                                                    variant="secondary"
                                                    className={
                                                        enrollment.average_quiz_score >= 75
                                                            ? "bg-green-500/10 text-green-400 border-0"
                                                            : enrollment.average_quiz_score >= 50
                                                                ? "bg-yellow-500/10 text-yellow-400 border-0"
                                                                : "bg-red-500/10 text-red-400 border-0"
                                                    }
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
