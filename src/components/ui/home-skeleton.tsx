import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const HomeSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Header skeleton - déjà géré par HomeHeader */}
            
            {/* Bandeau de recherche skeleton */}
            <div className="container py-6">
                <Card className="border-border/60 bg-card/80 backdrop-blur">
                    <CardContent className="p-4 md:p-6">
                        {/* Radios skeleton */}
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="h-4 w-24" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-8 w-20 rounded-full" />
                            </div>
                        </div>

                        {/* Ligne des filtres skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            <div className="md:col-span-4">
                                <Skeleton className="h-3 w-12 mb-1" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="md:col-span-6">
                                <Skeleton className="h-3 w-32 mb-1" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="md:col-span-2 flex md:justify-end">
                                <Skeleton className="h-10 w-full md:w-auto mt-6 md:mt-5" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contenu principal skeleton */}
            <div className="container grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                {/* Colonne gauche - En vedette skeleton */}
                <aside className="order-2 lg:order-1">
                    <Card className="border-2 border-primary/30 bg-white shadow-lg">
                        <CardContent className="p-6">
                            {/* Header skeleton */}
                            <div className="flex items-center justify-between mb-6">
                                <Skeleton className="h-8 w-32" />
                            </div>

                            {/* Section Grand Abidjan skeleton */}
                            <div className="mb-8">
                                <div className="flex items-center justify-center mb-4">
                                    <Skeleton className="h-px flex-1" />
                                    <Skeleton className="h-6 w-32 mx-4" />
                                    <Skeleton className="h-px flex-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <motion.div
                                            key={`ga-${i}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="rounded-lg border border-border bg-card overflow-hidden relative"
                                        >
                                            {/* Badge skeleton */}
                                            <Skeleton className="absolute top-2 right-2 h-5 w-16 rounded-full" />
                                            {/* Image skeleton */}
                                            <Skeleton className="w-full h-48" />
                                            {/* Content skeleton */}
                                            <div className="p-4 space-y-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-full" />
                                                    <Skeleton className="h-5 w-3/4" />
                                                </div>
                                                <Skeleton className="h-4 w-1/2" />
                                                <div className="flex gap-4">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-4 w-8" />
                                                    <Skeleton className="h-4 w-8" />
                                                </div>
                                                <Skeleton className="h-9 w-full mt-2" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Section Hors d'Abidjan skeleton */}
                            <div>
                                <div className="flex items-center justify-center mb-4">
                                    <Skeleton className="h-px flex-1" />
                                    <Skeleton className="h-6 w-36 mx-4" />
                                    <Skeleton className="h-px flex-1" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <motion.div
                                            key={`ha-${i}`}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="rounded-lg border border-border bg-card overflow-hidden relative"
                                        >
                                            {/* Badge skeleton */}
                                            <Skeleton className="absolute top-2 right-2 h-5 w-16 rounded-full" />
                                            {/* Image skeleton */}
                                            <Skeleton className="w-full h-48" />
                                            {/* Content skeleton */}
                                            <div className="p-4 space-y-3">
                                                <div className="space-y-2">
                                                    <Skeleton className="h-5 w-full" />
                                                    <Skeleton className="h-5 w-3/4" />
                                                </div>
                                                <Skeleton className="h-4 w-1/2" />
                                                <div className="flex gap-4">
                                                    <Skeleton className="h-4 w-12" />
                                                    <Skeleton className="h-4 w-8" />
                                                    <Skeleton className="h-4 w-8" />
                                                </div>
                                                <Skeleton className="h-9 w-full mt-2" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer skeleton */}
                            <div className="mt-8 pt-6 border-t-2 border-primary/20">
                                <div className="flex justify-center">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </aside>

                {/* Colonne droite - Annonces VIP skeleton */}
                <main className="order-1 lg:order-2">
                    <Card className="border-2 border-primary/30 bg-white shadow-lg">
                        <CardContent className="p-6">
                            {/* Header skeleton */}
                            <div className="flex items-center justify-between mb-6">
                                <Skeleton className="h-8 w-48" />
                            </div>

                            {/* Grille des annonces VIP skeleton */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="rounded-lg border border-border bg-card overflow-hidden relative"
                                    >
                                        {/* Badge skeleton */}
                                        <Skeleton className="absolute top-2 right-2 h-5 w-16 rounded-full" />
                                        {/* Image skeleton */}
                                        <Skeleton className="w-full h-48" />
                                        {/* Content skeleton */}
                                        <div className="p-4 space-y-3">
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-full" />
                                                <Skeleton className="h-5 w-3/4" />
                                            </div>
                                            <Skeleton className="h-4 w-1/2" />
                                            <div className="flex gap-4">
                                                <Skeleton className="h-4 w-12" />
                                                <Skeleton className="h-4 w-8" />
                                                <Skeleton className="h-4 w-8" />
                                            </div>
                                            <Skeleton className="h-9 w-full mt-2" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer skeleton */}
                            <div className="mt-8 pt-6 border-t-2 border-primary/20">
                                <div className="flex justify-center">
                                    <Skeleton className="h-10 w-32" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};

export default HomeSkeleton;

