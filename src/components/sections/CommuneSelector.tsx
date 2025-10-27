import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface Commune {
    id: string;
    name: string;
    count: number;
}

interface CommuneSelectorProps {
    onBack: () => void;
    onSearch: (communes: string[]) => void;
}

const ABIDJAN_COMMUNES: Commune[] = [
    { id: "abobo", name: "Abobo", count: 245 },
    { id: "adjame", name: "Adjamé", count: 189 },
    { id: "attecoube", name: "Attécoubé", count: 156 },
    { id: "cocody", name: "Cocody", count: 412 },
    { id: "koumassi", name: "Koumassi", count: 178 },
    { id: "marcory", name: "Marcory", count: 298 },
    { id: "plateau", name: "Plateau", count: 567 },
    { id: "port-bouet", name: "Port-Bouët", count: 203 },
    { id: "treichville", name: "Treichville", count: 234 },
    { id: "yopougon", name: "Yopougon", count: 321 },
    { id: "bingerville", name: "Bingerville", count: 98 },
    { id: "songon", name: "Songon", count: 67 },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
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

export default function CommuneSelector({ onBack, onSearch }: CommuneSelectorProps) {
    const [selectedCommunes, setSelectedCommunes] = useState<string[]>([]);

    const handleCommuneToggle = (communeId: string) => {
        setSelectedCommunes((prev) => (prev.includes(communeId) ? prev.filter((id) => id !== communeId) : [...prev, communeId]));
    };

    const handleSelectAll = () => {
        setSelectedCommunes(ABIDJAN_COMMUNES.map((c) => c.id));
    };

    const handleDeselectAll = () => {
        setSelectedCommunes([]);
    };

    const handleSearch = () => {
        if (selectedCommunes.length > 0) {
            onSearch(selectedCommunes);
        }
    };

    const selectedCount = selectedCommunes.length;
    const totalCount = ABIDJAN_COMMUNES.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
            <div className="w-full max-w-6xl mx-auto">
                {/* Header */}
                <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    {/* Breadcrumb */}
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
                        <button onClick={onBack} className="hover:text-foreground transition-colors duration-200 flex items-center">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Retour
                        </button>
                        <span>/</span>
                        <span className="text-foreground font-medium">Abidjan</span>
                        <span>/</span>
                        <span className="text-primary font-medium">Communes</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Sélectionnez vos communes</h1>
                    <p className="text-lg text-muted-foreground">Choisissez les communes d'Abidjan où vous souhaitez rechercher des biens immobiliers</p>
                </motion.div>

                {/* Action Bar */}
                <motion.div
                    className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-8 sticky top-4 z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={selectedCount === totalCount}>
                                Tout sélectionner
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleDeselectAll} disabled={selectedCount === 0}>
                                Tout déselectionner
                            </Button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Badge variant="secondary" className="text-sm">
                                {selectedCount} commune{selectedCount > 1 ? "s" : ""} sélectionnée{selectedCount > 1 ? "s" : ""}
                            </Badge>

                            <Button onClick={handleSearch} disabled={selectedCount === 0} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                                <Search className="w-4 h-4 mr-2" />
                                Rechercher dans {selectedCount} commune{selectedCount > 1 ? "s" : ""}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Communes Grid */}
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" variants={containerVariants} initial="hidden" animate="visible">
                    {ABIDJAN_COMMUNES.map((commune) => {
                        const isSelected = selectedCommunes.includes(commune.id);

                        return (
                            <motion.div key={commune.id} variants={cardVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Card
                                    className={`cursor-pointer transition-all duration-300 border-2 ${
                                        isSelected ? "border-primary bg-primary/5 shadow-lg" : "border-border hover:border-primary/50 hover:shadow-md"
                                    }`}
                                    onClick={() => handleCommuneToggle(commune.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleCommuneToggle(commune.id)}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <h3 className="font-semibold text-foreground text-lg">{commune.name}</h3>
                                            </div>

                                            <AnimatePresence>
                                                {isSelected && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ type: "spring", stiffness: 300 }}
                                                    >
                                                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-primary-foreground" />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                {commune.count} annonce{commune.count > 1 ? "s" : ""}
                                            </div>

                                            <Badge variant={isSelected ? "default" : "secondary"} className="text-xs">
                                                {commune.count}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Footer Stats */}
                <motion.div className="text-center mt-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.6 }}>
                    <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-lg p-6 max-w-2xl mx-auto">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Statistiques d'Abidjan</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">12</div>
                                <div className="text-muted-foreground">Communes</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">2,500+</div>
                                <div className="text-muted-foreground">Annonces</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">4.2M</div>
                                <div className="text-muted-foreground">Habitants</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-primary text-xl">211</div>
                                <div className="text-muted-foreground">km²</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
