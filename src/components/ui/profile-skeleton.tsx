import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileSkeleton = () => {
    return (
        <div className="bg-background min-h-screen">
            {/* PageNavbar placeholder */}
            <div className="border-b border-border">
                <div className="container py-4">
                    <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                </div>
            </div>

            <main className="container py-8 pt-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
                    {/* Header Card avec Avatar */}
                    <div className="rounded-lg border border-border bg-card mb-6 p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Avatar skeleton */}
                            <Skeleton className="h-24 w-24 rounded-full" />

                            {/* Info skeleton */}
                            <div className="flex-1 space-y-2 text-center sm:text-left w-full">
                                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                                <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                                <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                            </div>

                            {/* Button skeleton */}
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </div>

                    {/* Informations personnelles Card */}
                    <div className="rounded-lg border border-border bg-card mb-6">
                        <div className="p-6 border-b border-border">
                            <Skeleton className="h-7 w-64" />
                            <Skeleton className="h-4 w-96 mt-2" />
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Form fields skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-10 w-full" />
                            </div>

                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Sécurité Card */}
                    <div className="rounded-lg border border-border bg-card">
                        <div className="p-6 border-b border-border">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-4 w-80 mt-2" />
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-40" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <Skeleton className="h-10 w-48" />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default ProfileSkeleton;
