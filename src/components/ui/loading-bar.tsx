import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";

const LoadingBar = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleStart = () => {
            setLoading(true);
            setProgress(0);
        };

        const handleComplete = () => {
            setProgress(100);
            setTimeout(() => {
                setLoading(false);
                setProgress(0);
            }, 200);
        };

        // Animation du progrès
        let interval: NodeJS.Timeout;
        if (loading) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.random() * 10;
                });
            }, 100);
        }

        router.events.on("routeChangeStart", handleStart);
        router.events.on("routeChangeComplete", handleComplete);
        router.events.on("routeChangeError", handleComplete);

        return () => {
            router.events.off("routeChangeStart", handleStart);
            router.events.off("routeChangeComplete", handleComplete);
            router.events.off("routeChangeError", handleComplete);
            if (interval) clearInterval(interval);
        };
    }, [router.events, loading]);

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-primary/20 to-primary/20"
                >
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/20"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingBar;
