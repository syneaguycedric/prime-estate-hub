import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BecomeAdvertiserSkeleton = () => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 pt-20">
                <div className="max-w-4xl mx-auto">
                    {/* Header skeleton */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.3 }} 
                        className="text-center mb-8"
                    >
                        <Skeleton className="h-8 w-64 mx-auto mb-2" />
                        <Skeleton className="h-4 w-96 mx-auto" />
                    </motion.div>

                    {/* Avantages Card skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-5 w-5 rounded" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-4 w-80 mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="text-center space-y-3"
                                    >
                                        <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                                        <Skeleton className="h-5 w-32 mx-auto" />
                                        <Skeleton className="h-4 w-full" />
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* CTA Card skeleton */}
                    <Card className="border-border/60 bg-card/80">
                        <CardContent className="p-6">
                            <div className="text-center space-y-4">
                                <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-64 mx-auto" />
                                    <Skeleton className="h-4 w-96 mx-auto" />
                                    <Skeleton className="h-4 w-80 mx-auto mb-4" />
                                </div>
                                <Skeleton className="h-11 w-48 mx-auto" />
                                <Skeleton className="h-3 w-56 mx-auto" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BecomeAdvertiserSkeleton;

