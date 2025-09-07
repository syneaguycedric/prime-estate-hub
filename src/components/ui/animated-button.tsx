import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends ButtonProps {
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "hero" | "accent";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
}

const AnimatedButton = ({ children, className, variant = "default", size = "default", asChild = false, ...props }: AnimatedButtonProps) => {
    const buttonVariants = {
        initial: {
            scale: 1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        },
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: {
                duration: 0.2,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
        tap: {
            scale: 0.98,
            transition: {
                duration: 0.1,
            },
        },
    };

    const rippleVariants = {
        initial: {
            scale: 0,
            opacity: 0,
        },
        animate: {
            scale: 1,
            opacity: [0, 0.3, 0],
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    return (
        <motion.div className="relative inline-block" variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap">
            <Button variant={variant} size={size} className={cn("relative overflow-hidden", className)} asChild={asChild} {...props}>
                {children}

                {/* Effet de ripple sophistiqué */}
                <motion.div className="absolute inset-0 bg-white/20 rounded-md" variants={rippleVariants} initial="initial" whileTap="animate" />
            </Button>
        </motion.div>
    );
};

export default AnimatedButton;
