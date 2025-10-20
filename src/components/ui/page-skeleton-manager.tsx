import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import { getSkeletonForRoute, shouldShowSkeleton } from "@/lib/skeleton-config";

/**
 * Gestionnaire central des skeletons de page
 * Affiche automatiquement le bon skeleton selon la route de destination
 */
const PageSkeletonManager = () => {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);
    const [targetRoute, setTargetRoute] = useState<string>("");
    const [SkeletonComponent, setSkeletonComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            console.log("[SKELETON MANAGER] Navigation detected to:", url);

            // Extraire le path sans les query params
            const path = url.split("?")[0];

            // Vérifier si on doit afficher un skeleton pour cette route
            if (!shouldShowSkeleton(path)) {
                console.log("[SKELETON MANAGER] No skeleton for:", path);
                return;
            }

            // Récupérer la configuration du skeleton
            const config = getSkeletonForRoute(path);

            if (config.component) {
                console.log("[SKELETON MANAGER] Showing skeleton type:", config.type);
                setTargetRoute(path);
                setSkeletonComponent(() => config.component);
                setIsNavigating(true);
            }
        };

        const handleRouteChangeComplete = () => {
            console.log("[SKELETON MANAGER] Navigation completed");
            setIsNavigating(false);
            setSkeletonComponent(null);
            setTargetRoute("");
        };

        const handleRouteChangeError = () => {
            console.log("[SKELETON MANAGER] Navigation error");
            setIsNavigating(false);
            setSkeletonComponent(null);
            setTargetRoute("");
        };

        router.events.on("routeChangeStart", handleRouteChangeStart);
        router.events.on("routeChangeComplete", handleRouteChangeComplete);
        router.events.on("routeChangeError", handleRouteChangeError);

        return () => {
            router.events.off("routeChangeStart", handleRouteChangeStart);
            router.events.off("routeChangeComplete", handleRouteChangeComplete);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [router.events]);

    return (
        <AnimatePresence mode="wait">
            {isNavigating && SkeletonComponent && (
                <motion.div
                    key="skeleton-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-background"
                    style={{ pointerEvents: "none" }}
                >
                    <SkeletonComponent />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PageSkeletonManager;
