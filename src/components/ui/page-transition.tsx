import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
    const router = useRouter();

    return (
        <motion.div
            key={router.asPath}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: "tween",
                ease: [0.4, 0.0, 0.2, 1],
                duration: 0.3,
            }}
            className="min-h-screen"
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
