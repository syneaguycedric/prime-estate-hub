import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode } from "react";

interface PageTransitionProps {
    children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
    const location = useLocation();

    return (
        <motion.div
            key={location.pathname}
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
