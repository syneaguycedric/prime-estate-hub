import { motion } from "framer-motion";
import { Card, CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends CardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    index?: number;
}

const AnimatedCard = ({ children, className, delay = 0, index = 0, ...props }: AnimatedCardProps) => {
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95,
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                delay: delay + index * 0.1,
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
        hover: {
            y: -4,
            scale: 1.02,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            transition: {
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94],
            },
        },
    };

    return (
        <motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className="h-full">
            <Card
                className={cn(
                    "relative overflow-hidden backdrop-blur-sm bg-card/80 border-border/50",
                    "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100",
                    "before:transition-opacity before:duration-300",
                    className
                )}
                {...props}
            >
                {children}
            </Card>
        </motion.div>
    );
};

export default AnimatedCard;
