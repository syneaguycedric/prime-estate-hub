import { useState, useEffect } from "react";
import { useRouter } from "next/router";

interface UsePageLoadingOptions {
    delay?: number; // Délai minimum avant d'afficher le loading
    timeout?: number; // Temps maximum de loading
}

export const usePageLoading = (options: UsePageLoadingOptions = {}) => {
    const { delay = 200, timeout = 5000 } = options;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        let delayTimer: NodeJS.Timeout;
        let timeoutTimer: NodeJS.Timeout;

        const handleRouteChangeStart = () => {
            setIsLoading(true);

            // Délai avant d'afficher le loading (évite le flash pour les chargements rapides)
            delayTimer = setTimeout(() => {
                setShowLoading(true);
            }, delay);

            // Timeout de sécurité
            timeoutTimer = setTimeout(() => {
                setIsLoading(false);
                setShowLoading(false);
            }, timeout);
        };

        const handleRouteChangeComplete = () => {
            clearTimeout(delayTimer);
            clearTimeout(timeoutTimer);
            setIsLoading(false);
            setShowLoading(false);
        };

        const handleRouteChangeError = () => {
            clearTimeout(delayTimer);
            clearTimeout(timeoutTimer);
            setIsLoading(false);
            setShowLoading(false);
        };

        router.events.on("routeChangeStart", handleRouteChangeStart);
        router.events.on("routeChangeComplete", handleRouteChangeComplete);
        router.events.on("routeChangeError", handleRouteChangeError);

        return () => {
            clearTimeout(delayTimer);
            clearTimeout(timeoutTimer);
            router.events.off("routeChangeStart", handleRouteChangeStart);
            router.events.off("routeChangeComplete", handleRouteChangeComplete);
            router.events.off("routeChangeError", handleRouteChangeError);
        };
    }, [router.events, delay, timeout]);

    return { isLoading, showLoading };
};
