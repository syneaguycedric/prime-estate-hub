import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { Building2, Home, ArrowRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const PromoBanner = () => {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const handleAgencyClick = () => {
        window.open("https://kylimmo.net/", "_blank", "noopener,noreferrer");
    };

    const handleListingClick = () => {
        window.open("https://kylimmo.net/", "_blank", "noopener,noreferrer");
    };

    return (
        <div className="container py-3 md:py-4">
            <Card className="relative overflow-hidden border-0 shadow-lg">
                <div className="relative flex flex-col md:flex-row">
                    {/* Section gauche - Marron avec texte blanc */}
                    <motion.div
                        onClick={handleAgencyClick}
                        className="relative bg-primary p-5 md:p-5 cursor-pointer group flex-1 overflow-hidden"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            clipPath: !isMobile ? "polygon(0 0, calc(50% - 30px) 0, calc(50% + 30px) 100%, 0 100%)" : "none",
                        }}
                    >
                        <div className="flex flex-row items-center justify-center md:justify-start gap-5 md:gap-4 relative z-10">
                            <div className="hidden md:flex flex-shrink-0">
                                <div className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all duration-300 shadow-sm">
                                    <ExternalLink className="h-4 w-4 text-white" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 text-center md:text-left">
                                <h3 className="text-base md:text-sm font-semibold text-white leading-relaxed md:leading-tight group-hover:text-white/95 transition-colors duration-300">
                                    Accéder à l'agence Kylimmo
                                </h3>
                            </div>
                            <div className="flex-shrink-0">
                                <ExternalLink className="h-5 w-5 md:h-4 md:w-4 text-white/80 group-hover:text-white transition-colors duration-300" />
                            </div>
                        </div>
                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Section droite - Blanc avec texte marron */}
                    <motion.div
                        onClick={handleListingClick}
                        className="relative bg-white p-5 md:p-5 cursor-pointer group border-t-2 md:border-t-0 border-primary/30 flex-1 md:absolute md:top-0 md:right-0 md:w-full md:h-full"
                        whileHover={{ scale: 1.01 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            clipPath: !isMobile ? "polygon(calc(50% - 30px) 0, 100% 0, 100% 100%, calc(50% + 30px) 100%)" : "none",
                        }}
                    >
                        <div className="flex flex-row items-center justify-center md:justify-end gap-5 md:gap-4 relative z-10 md:pr-4">
                            <div className="hidden md:flex flex-shrink-0 md:order-1">
                                <div className="p-2.5 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all duration-300 shadow-sm">
                                    <Home className="h-4 w-4 text-primary" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 text-center md:text-right md:order-2">
                                <h3 className="text-base md:text-sm font-semibold text-primary leading-relaxed md:leading-tight group-hover:text-primary/90 transition-colors duration-300 whitespace-nowrap">
                                    Confier un bien à Kylimmo
                                </h3>
                            </div>
                            <div className="flex-shrink-0 md:order-3">
                                <ExternalLink className="h-5 w-5 md:h-4 md:w-4 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                            </div>
                        </div>
                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                </div>
            </Card>
        </div>
    );
};

export default PromoBanner;
