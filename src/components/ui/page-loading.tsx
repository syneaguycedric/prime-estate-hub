import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageLoadingProps {
    message?: string;
}

const PageLoading = ({ message = "Chargement..." }: PageLoadingProps) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 mx-auto">
                    <Loader2 className="w-12 h-12 text-primary" />
                </motion.div>

                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg">
                    {message}
                </motion.p>

                {/* Points de progression animés */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center space-x-1">
                    {[0, 1, 2].map((index) => (
                        <motion.div
                            key={index}
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                delay: index * 0.2,
                            }}
                            className="w-2 h-2 bg-primary rounded-full"
                        />
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default PageLoading;
