"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data. Please check your connection and try again.",
    onRetry,
}: ErrorStateProps) {
    return (
        <Card className="border-rose-100 bg-rose-50/30">
            <CardContent className="p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
                {onRetry && (
                    <Button onClick={onRetry} className="bg-rose-500 hover:bg-rose-600 text-white shadow-sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
