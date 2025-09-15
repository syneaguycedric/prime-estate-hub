import { motion } from "framer-motion";

interface PropertySkeletonProps {
    view?: "grid" | "list";
    count?: number;
}

const PropertySkeleton = ({ view = "grid", count = 12 }: PropertySkeletonProps) => {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    if (view === "list") {
        return (
            <div className="space-y-4">
                {skeletons.map((_, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="rounded-lg border border-border bg-card p-3"
                    >
                        <div className="flex gap-3">
                            {/* Image skeleton */}
                            <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-md animate-pulse" />

                            {/* Content skeleton */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                                    <div className="h-5 bg-muted rounded-full animate-pulse w-16" />
                                </div>
                                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                                <div className="flex gap-3">
                                    <div className="h-3 bg-muted rounded animate-pulse w-12" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-8" />
                                    <div className="h-3 bg-muted rounded animate-pulse w-8" />
                                </div>
                                <div className="h-5 bg-muted rounded animate-pulse w-20 mt-2" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {skeletons.map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                >
                    {/* Image skeleton */}
                    <div className="w-full h-48 bg-muted animate-pulse" />

                    {/* Content skeleton */}
                    <div className="p-4 space-y-3">
                        <div className="space-y-2">
                            <div className="h-5 bg-muted rounded animate-pulse w-full" />
                            <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
                        </div>

                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />

                        <div className="flex gap-4">
                            <div className="h-4 bg-muted rounded animate-pulse w-12" />
                            <div className="h-4 bg-muted rounded animate-pulse w-8" />
                            <div className="h-4 bg-muted rounded animate-pulse w-8" />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <div className="h-9 bg-muted rounded animate-pulse flex-1" />
                            <div className="h-9 bg-muted rounded animate-pulse flex-1" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default PropertySkeleton;
