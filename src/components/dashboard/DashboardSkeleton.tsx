import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>

            {/* Filters skeleton */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </CardContent>
            </Card>

            {/* Table skeleton */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Table header */}
                            <div className="border-b">
                                <div className="grid grid-cols-7 gap-4 p-4">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>

                            {/* Table rows */}
                            <div className="divide-y">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-7 gap-4 p-4">
                                        <Skeleton className="h-12 w-16" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
