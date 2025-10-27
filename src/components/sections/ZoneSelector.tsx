import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, ChevronRight, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ZoneSelectorProps {
    onZoneSelect: (zone: "abidjan" | "hors-abidjan") => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

const hoverVariants = {
    hover: {
        scale: 1.02,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 20,
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 25,
        },
    },
};

export default function ZoneSelector({ onZoneSelect }: ZoneSelectorProps) {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Où recherchez-vous votre bien immobilier ?
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Sélectionnez votre zone de recherche pour découvrir les meilleures opportunités immobilières
                    </p>
                </motion.div>

                {/* Zone Cards */}
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
                    {/* Abidjan Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="group cursor-pointer"
                        onMouseEnter={() => setHoveredCard("abidjan")}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => onZoneSelect("abidjan")}
                    >
                        <Card className="relative h-80 overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                            <div className="absolute top-4 right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

                            {/* Popular Badge */}
                            <div className="absolute top-6 left-6 z-10">
                                <Badge className="bg-primary text-primary-foreground shadow-lg">
                                    <Star className="w-3 h-3 mr-1" />
                                    Populaire
                                </Badge>
                            </div>

                            <CardContent className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                                {/* Icon */}
                                <motion.div className="mb-6" animate={hoveredCard === "abidjan" ? { rotate: 5 } : { rotate: 0 }} transition={{ type: "spring", stiffness: 200 }}>
                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                        <MapPin className="w-10 h-10 text-primary" />
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Abidjan</h2>

                                {/* Description */}
                                <p className="text-muted-foreground mb-6 leading-relaxed">Découvrez les meilleures opportunités dans la capitale économique de la Côte d'Ivoire</p>

                                {/* Stats */}
                                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-6">
                                    <div className="text-center">
                                        <div className="font-semibold text-foreground">12</div>
                                        <div>Communes</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-foreground">2,500+</div>
                                        <div>Annonces</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <motion.div
                                    className="flex items-center text-primary font-semibold group-hover:text-primary/80 transition-colors duration-300"
                                    animate={hoveredCard === "abidjan" ? { x: 5 } : { x: 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    Sélectionner les communes
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Hors d'Abidjan Card */}
                    <motion.div
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap="tap"
                        className="group cursor-pointer"
                        onMouseEnter={() => setHoveredCard("hors-abidjan")}
                        onMouseLeave={() => setHoveredCard(null)}
                        onClick={() => onZoneSelect("hors-abidjan")}
                    >
                        <Card className="relative h-80 overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 bg-gradient-to-br from-card via-card to-accent/5 backdrop-blur-sm">
                            {/* Background Pattern */}
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
                            <div className="absolute top-4 right-4 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

                            <CardContent className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                                {/* Icon */}
                                <motion.div
                                    className="mb-6"
                                    animate={hoveredCard === "hors-abidjan" ? { rotate: -5 } : { rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                >
                                    <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                                        <Building2 className="w-10 h-10 text-accent-foreground" />
                                    </div>
                                </motion.div>

                                {/* Title */}
                                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-accent-foreground transition-colors duration-300">Hors d'Abidjan</h2>

                                {/* Description */}
                                <p className="text-muted-foreground mb-6 leading-relaxed">Explorez les opportunités dans toutes les autres régions de la Côte d'Ivoire</p>

                                {/* Stats */}
                                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-6">
                                    <div className="text-center">
                                        <div className="font-semibold text-foreground">31</div>
                                        <div>Régions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-foreground">1,200+</div>
                                        <div>Annonces</div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <motion.div
                                    className="flex items-center text-accent-foreground font-semibold group-hover:text-accent-foreground/80 transition-colors duration-300"
                                    animate={hoveredCard === "hors-abidjan" ? { x: 5 } : { x: 0 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    Voir les annonces
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Footer Info */}
                <motion.div className="text-center mt-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
                    <p className="text-sm text-muted-foreground">Plus de 3,700 annonces immobilières disponibles dans toute la Côte d'Ivoire</p>
                </motion.div>
            </div>
        </div>
    );
}
