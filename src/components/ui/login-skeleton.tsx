import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LoginSkeleton = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            {/* Background pattern */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Login Card Skeleton */}
            <div className="w-full max-w-md relative z-10">
                <Card className="shadow-xl">
                    <CardHeader className="space-y-4 text-center pb-6">
                        {/* Logo skeleton */}
                        <div className="flex justify-center mb-2">
                            <Skeleton className="h-20 w-20 rounded-full" />
                        </div>

                        {/* Title skeleton */}
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48 mx-auto" />
                            <Skeleton className="h-4 w-64 mx-auto" />
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* Form skeleton */}
                        <div className="space-y-4">
                            {/* Email field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-12" />
                                <div className="relative">
                                    <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                                    <Skeleton className="h-10 w-full pl-10" />
                                </div>
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <div className="relative">
                                    <Skeleton className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                                    <Skeleton className="h-10 w-full pl-10" />
                                </div>
                            </div>

                            {/* Remember me checkbox */}
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>

                            {/* Login button */}
                            <Skeleton className="h-10 w-full" />

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <Skeleton className="w-full h-px" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <Skeleton className="h-4 w-16 bg-background px-2" />
                                </div>
                            </div>

                            {/* Register link */}
                            <div className="text-center">
                                <Skeleton className="h-4 w-48 mx-auto" />
                            </div>

                            {/* Back to home link */}
                            <div className="text-center">
                                <Skeleton className="h-4 w-32 mx-auto" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer text skeleton */}
                <div className="text-center mt-6">
                    <Skeleton className="h-4 w-80 mx-auto" />
                </div>
            </div>
        </div>
    );
};

export default LoginSkeleton;
