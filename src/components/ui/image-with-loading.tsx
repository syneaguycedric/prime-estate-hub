import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon } from "lucide-react";

interface ImageWithLoadingProps {
    src: string;
    alt: string;
    className?: string;
    loading?: "lazy" | "eager";
    priority?: boolean;
    onLoad?: () => void;
    onError?: () => void;
}

const ImageWithLoading = ({ src, alt, className = "", loading = "lazy", priority = false, onLoad, onError }: ImageWithLoadingProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
        onLoad?.();
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
        onError?.();
    };

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Image */}
            <img
                src={src}
                alt={alt}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
            />

            {/* Loading/Error overlay */}
            <AnimatePresence>
                {(isLoading || hasError) && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-muted flex items-center justify-center">
                        {hasError ? (
                            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-2">
                                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                                <p className="text-xs text-muted-foreground">Image non disponible</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center"
                            >
                                <div className="w-4 h-4 bg-primary rounded-full" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ImageWithLoading;
