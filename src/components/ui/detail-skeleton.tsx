import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const DetailSkeleton = () => {
    return (
        <div className="bg-background min-h-screen">
            {/* PageNavbar placeholder */}
            <div className="border-b border-border">
                <div className="container py-4">
                    <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
                </div>
            </div>

            <main className="container py-6 pt-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* Titre et localisation skeleton */}
                    <div className="mb-6">
                        <div className="h-8 bg-muted rounded-lg w-3/4 mb-3 animate-pulse"></div>
                        <div className="h-5 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gros bloc à gauche - 2/3 de la largeur */}
                        <div className="lg:col-span-2">
                            {/* Image principale skeleton */}
                            <div className="mb-4">
                                <div className="w-full h-80 md:h-[28rem] bg-muted rounded-lg animate-pulse"></div>
                            </div>

                            {/* Miniatures skeleton */}
                            <div className="flex gap-2 mb-6">
                                <div className="w-20 h-16 bg-muted rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-muted rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-muted rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-muted rounded animate-pulse"></div>
                            </div>

                            {/* Card Détails */}
                            <Card className="mt-6">
                                <div className="p-6">
                                    <div className="h-7 bg-muted rounded w-32 mb-6 animate-pulse"></div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="h-5 bg-muted rounded w-20 animate-pulse"></div>
                                        <div className="h-5 bg-muted rounded w-24 animate-pulse"></div>
                                        <div className="h-5 bg-muted rounded w-28 animate-pulse"></div>
                                        <div className="h-5 bg-muted rounded w-22 animate-pulse"></div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Sidebar à droite - 1/3 de la largeur */}
                        <div className="lg:col-span-1">
                            {/* Card Prix */}
                            <Card className="mb-4">
                                <div className="p-6">
                                    <div className="h-8 bg-muted rounded w-40 mb-6 animate-pulse"></div>
                                    <div className="space-y-3">
                                        <div className="h-11 bg-muted rounded animate-pulse"></div>
                                        <div className="h-11 bg-muted rounded animate-pulse"></div>
                                    </div>
                                </div>
                            </Card>

                            {/* Card Contact */}
                            <Card>
                                <div className="p-6">
                                    <div className="h-6 bg-muted rounded w-48 mb-4 animate-pulse"></div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                                            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                                            <div className="h-4 bg-muted rounded w-36 animate-pulse"></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 bg-muted rounded animate-pulse"></div>
                                            <div className="h-4 bg-muted rounded w-44 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Cards Description et Caractéristiques */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                        <Card>
                            <div className="p-6">
                                <div className="h-6 bg-muted rounded w-40 mb-4 animate-pulse"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded w-4/5 animate-pulse"></div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-6">
                                <div className="h-6 bg-muted rounded w-48 mb-4 animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default DetailSkeleton;
