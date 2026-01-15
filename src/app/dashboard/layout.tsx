"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    GraduationCap,
    LayoutDashboard,
    BookOpen,
    Award,
    BarChart3,
    Settings,
    LogOut,
    Video,
    Plus,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { UserRole } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navigation items based on role
const studentNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "My Courses", icon: BookOpen, href: "/courses" },
    { title: "Certificates", icon: Award, href: "/certificates" },
];

const creatorNavItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "My Courses", icon: Video, href: "/courses" },
    { title: "Import Playlist", icon: Plus, href: "/courses/import" },
    { title: "Analytics", icon: BarChart3, href: "/analytics" },
];

function AppSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = user?.role === UserRole.CREATOR ? creatorNavItems : studentNavItems;

    return (
        <Sidebar className="border-r border-gray-100 bg-white">
            <SidebarHeader className="p-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 shadow-md shadow-rose-200">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                        Credlyse
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-gray-400 uppercase text-xs tracking-wider">
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            className={`transition-all rounded-lg ${isActive
                                                    ? "bg-rose-50 text-rose-600 font-medium"
                                                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <Separator className="mb-4 bg-gray-100" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <Avatar className="h-9 w-9 border border-gray-100">
                                <AvatarFallback className="bg-rose-100 text-rose-600 text-sm font-medium">
                                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-gray-100">
                        <DropdownMenuLabel className="text-gray-500">My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem asChild className="text-gray-700 hover:text-gray-900 focus:bg-gray-50">
                            <Link href="/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-rose-500 hover:text-rose-600 focus:bg-rose-50"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

function LoadingSkeleton() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <div className="w-64 bg-white border-r border-gray-100 p-4 space-y-4">
                <Skeleton className="h-10 w-32" />
                <div className="space-y-2 mt-8">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
            </div>
            <div className="flex-1 p-8">
                <Skeleton className="h-8 w-64 mb-8" />
                <div className="grid grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gray-50/50">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                    {/* Header */}
                    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-6">
                        <SidebarTrigger className="text-gray-400 hover:text-gray-600" />
                        <div className="flex-1" />
                        <div className="flex items-center gap-2 text-sm">
                            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-medium capitalize">
                                {user?.role?.toLowerCase()}
                            </span>
                        </div>
                    </header>

                    {/* Page Content */}
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </SidebarProvider>
    );
}
