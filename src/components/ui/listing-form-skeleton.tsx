import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ListingFormSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* PageNavbar skeleton - déjà géré par PageNavbar */}
            
            <div className="container mx-auto px-4 py-8 pt-24">
                <div className="max-w-4xl mx-auto">
                    {/* Header skeleton */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <Skeleton className="h-6 w-6 rounded" />
                            <Skeleton className="h-8 w-48" />
                        </div>
                        <Skeleton className="h-4 w-96" />
                    </motion.div>

                    {/* Sélection de zone et commune skeleton */}
                    <Card className="border-border/60 bg-card/80 backdrop-blur mb-6">
                        <CardContent className="p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                <div className="md:col-span-4">
                                    <Skeleton className="h-3 w-12 mb-1" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="md:col-span-8">
                                    <Skeleton className="h-3 w-32 mb-1" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations de base skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-48" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-64" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prix et surface skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-40" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-10 flex-1" />
                                        <Skeleton className="h-10 w-24" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Détails du bien skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-36" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Localisation skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-32" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Photos skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-24" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-48" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative aspect-square rounded-lg overflow-hidden border border-border"
                                    >
                                        <Skeleton className="w-full h-full" />
                                    </motion.div>
                                ))}
                            </div>
                            <Skeleton className="h-10 w-48" />
                        </CardContent>
                    </Card>

                    {/* Caractéristiques skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-6 w-40" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-56" />
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex gap-2">
                                        <Skeleton className="h-10 flex-1" />
                                        <Skeleton className="h-10 flex-1" />
                                    </div>
                                ))}
                            </div>
                            <Skeleton className="h-10 w-32" />
                        </CardContent>
                    </Card>

                    {/* Bouton de soumission skeleton */}
                    <div className="flex justify-end gap-4 mb-8">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingFormSkeleton;

