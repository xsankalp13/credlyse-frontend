"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    Award,
    Download,
    ExternalLink,
    Calendar,
    FileCheck,
    CheckCircle2,
    ArrowRight
} from "lucide-react";

import { api } from "@/lib/api";
import { type Certificate } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function CertificateCard({ certificate, index }: { certificate: Certificate; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-rose-50/50 transition-all overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="p-6 relative">
                    <div className="flex items-start gap-5">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-50 flex items-center justify-center shrink-0 shadow-inner">
                            <Award className="h-8 w-8 text-rose-500" />
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-bold text-lg text-gray-900 mb-1 truncate group-hover:text-rose-600 transition-colors">
                                {certificate.playlist?.title || "Course Certificate"}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Issued {new Date(certificate.issued_at).toLocaleDateString()}
                                </span>
                                <Badge className="bg-green-50 text-green-600 border-0 hover:bg-green-100">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3">
                                {certificate.pdf_url && (
                                    <a
                                        href={certificate.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex"
                                    >
                                        <Button
                                            size="sm"
                                            className="bg-gray-900 text-white hover:bg-black rounded-lg shadow-md shadow-gray-200"
                                        >
                                            <Download className="h-3.5 w-3.5 mr-2" />
                                            Download PDF
                                        </Button>
                                    </a>
                                )}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg"
                                >
                                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadCertificates() {
            try {
                const data = await api.getCertificates().catch(() => []);
                setCertificates(data);
            } catch (error) {
                console.error("Failed to load certificates:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCertificates();
    }, []);

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">My Certificates</h1>
                <p className="text-gray-500 font-medium">
                    View and download your earned certificates
                </p>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-44 rounded-2xl" />
                    ))}
                </div>
            )}

            {!isLoading && certificates.length === 0 && (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 text-center">
                    <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Award className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No certificates yet</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        Complete courses and pass all quizzes to earn your first certificate!
                    </p>
                    <Link href="/courses">
                        <Button className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-10 px-6 shadow-lg shadow-rose-100">
                            <ArrowRight className="mr-2 h-4 w-4" />
                            Browse Courses
                        </Button>
                    </Link>
                </div>
            )}

            {!isLoading && certificates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((certificate, index) => (
                        <CertificateCard key={certificate.id} certificate={certificate} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
