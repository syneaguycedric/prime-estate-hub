import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home, Euro, Bed, Bath, Ruler } from "lucide-react";
import { PropertyFilters } from "@/lib/directus-api";

interface SearchFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    onFiltersChange?: (count: number) => void;
    onReset?: () => void;
    onApplyFilters?: (filters: PropertyFilters) => void;
    currentFilters?: PropertyFilters; // Ajouter les filtres actuels
}

const SearchFilters = ({ isOpen, onClose, onFiltersChange, onReset, onApplyFilters, currentFilters }: SearchFiltersProps) => {
    const [filters, setFilters] = useState({
        location: "",
        transaction: "",
        propertyType: "",
        minPrice: "",
        maxPrice: "",
        minSurface: "",
        maxSurface: "",
        rooms: "",
        bathrooms: "",
    });

    // Synchroniser l'état local avec les filtres actuels
    useEffect(() => {
        if (currentFilters) {
            setFilters({
                location: currentFilters.location || "",
                transaction: currentFilters.contractType || "",
                propertyType: currentFilters.type || "",
                minPrice: currentFilters.minPrice?.toString() || "",
                maxPrice: currentFilters.maxPrice?.toString() || "",
                minSurface: currentFilters.minSurface?.toString() || "",
                maxSurface: currentFilters.maxSurface?.toString() || "",
                rooms: currentFilters.rooms?.toString() || "",
                bathrooms: currentFilters.bathrooms?.toString() || "",
            });
        }
    }, [currentFilters]);

    // Gérer l'overlay et le scroll selon la taille d'écran
    useEffect(() => {
        if (isOpen) {
            // Fonction pour gérer le scroll selon la taille d'écran
            const handleScrollManagement = () => {
                // Vérification SSR-safe
                if (typeof window === "undefined") return;

                const isMobile = window.innerWidth < 768; // Seuil mobile à 768px

                if (isMobile) {
                    // Sauvegarder la position de scroll actuelle
                    const scrollY = window.scrollY;

                    // Empêcher le scroll horizontal et vertical sur mobile uniquement
                    document.body.style.overflow = "hidden";
                    document.body.style.position = "fixed";
                    document.body.style.top = `-${scrollY}px`;
                    document.body.style.width = "100%";

                    return scrollY;
                } else {
                    // Sur tablette/desktop, empêcher seulement le scroll horizontal
                    document.body.style.overflowX = "hidden";

                    return null;
                }
            };

            // Appliquer la gestion du scroll
            const savedScrollY = handleScrollManagement();

            // Écouter les changements de taille d'écran
            const handleResize = () => {
                // Nettoyer les styles existants
                document.body.style.overflow = "";
                document.body.style.overflowX = "";
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";

                // Restaurer la position si elle était sauvegardée
                if (savedScrollY !== null && typeof window !== "undefined") {
                    window.scrollTo(0, savedScrollY);
                }

                // Réappliquer la gestion du scroll
                handleScrollManagement();
            };

            // Vérification SSR-safe
            if (typeof window !== "undefined") {
                window.addEventListener("resize", handleResize);
            }

            // Cleanup function
            return () => {
                if (typeof window !== "undefined") {
                    window.removeEventListener("resize", handleResize);
                }
                document.body.style.overflow = "";
                document.body.style.overflowX = "";
                document.body.style.position = "";
                document.body.style.top = "";
                document.body.style.width = "";

                // Restaurer la position si elle était sauvegardée
                if (savedScrollY !== null && typeof window !== "undefined") {
                    window.scrollTo(0, savedScrollY);
                }
            };
        }
    }, [isOpen]);

    const countActiveFilters = () => {
        return Object.values(filters).filter((value) => value && value.trim() !== "").length;
    };

    useEffect(() => {
        const count = countActiveFilters();
        onFiltersChange?.(count);
    }, [filters, onFiltersChange]);

    const updateFilter = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        // Convertir les filtres string vers PropertyFilters
        const propertyFilters: PropertyFilters = {};

        if (filters.location) propertyFilters.location = filters.location;

        // Mapper les valeurs de transaction
        if (filters.transaction) {
            const transactionMap: Record<string, string> = {
                achat: "selling",
                location: "leasing",
            };
            propertyFilters.contractType = transactionMap[filters.transaction] || filters.transaction;
        }

        // Mapper les types de biens
        if (filters.propertyType) {
            const propertyTypeMap: Record<string, string> = {
                appartement: "appartment",
                maison: "house",
                villa: "villa",
                terrain: "land",
                commercial: "commercial",
            };
            propertyFilters.propertyType = propertyTypeMap[filters.propertyType] || filters.propertyType;
        }

        // Convertir les prix
        if (filters.minPrice) {
            const minPrice = parseFloat(filters.minPrice);
            if (!isNaN(minPrice)) propertyFilters.minPrice = minPrice;
        }
        if (filters.maxPrice) {
            const maxPrice = parseFloat(filters.maxPrice);
            if (!isNaN(maxPrice)) propertyFilters.maxPrice = maxPrice;
        }

        // Convertir les surfaces
        if (filters.minSurface) {
            const minSurface = parseFloat(filters.minSurface);
            if (!isNaN(minSurface)) propertyFilters.minSurface = minSurface;
        }
        if (filters.maxSurface) {
            const maxSurface = parseFloat(filters.maxSurface);
            if (!isNaN(maxSurface)) propertyFilters.maxSurface = maxSurface;
        }

        // Convertir les nombres
        if (filters.rooms) {
            const rooms = parseInt(filters.rooms);
            if (!isNaN(rooms)) propertyFilters.rooms = rooms;
        }
        if (filters.bathrooms) {
            const bathrooms = parseInt(filters.bathrooms);
            if (!isNaN(bathrooms)) propertyFilters.bathrooms = bathrooms;
        }

        // Appeler la callback avec les filtres convertis
        if (onApplyFilters) {
            onApplyFilters(propertyFilters);
        }

        // Fermer le panneau de filtres
        onClose();
    };

    const resetFilters = () => {
        setFilters({
            location: "",
            transaction: "",
            propertyType: "",
            minPrice: "",
            maxPrice: "",
            minSurface: "",
            maxSurface: "",
            rooms: "",
            bathrooms: "",
        });
        // Appeler la fonction de réinitialisation du parent
        if (onReset) {
            onReset();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay sombre transparent - uniquement sur mobile */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300" onClick={onClose} aria-hidden="true" />

            {/* Sidebar des filtres */}
            <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 sm:w-80 max-w-[90vw] bg-card border-r border-border shadow-lg z-40 animate-in slide-in-from-left duration-300 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Filtres de recherche</h2>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Localisation */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Localisation
                        </label>
                        <Input placeholder="Ville, département, code postal..." value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} />
                    </div>

                    <Separator />

                    {/* Type de transaction */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">Type de transaction</label>
                        <Select value={filters.transaction} onValueChange={(value) => updateFilter("transaction", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Achat ou Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="achat">Achat</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type de bien */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            Type de bien
                        </label>
                        <Select value={filters.propertyType} onValueChange={(value) => updateFilter("propertyType", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appartment">Appartement</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="land">Terrain</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Prix */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Euro className="h-4 w-4 mr-2" />
                            Budget
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Prix min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} />
                            <Input placeholder="Prix max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
                        </div>
                        <div className="px-2">
                            <Slider defaultValue={[82500000]} max={412500000} min={20625000} step={4125000} className="w-full" />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>20M FCFA</span>
                                <span>412M FCFA</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Surface */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Ruler className="h-4 w-4 mr-2" />
                            Surface (m²)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Min" value={filters.minSurface} onChange={(e) => updateFilter("minSurface", e.target.value)} />
                            <Input placeholder="Max" value={filters.maxSurface} onChange={(e) => updateFilter("maxSurface", e.target.value)} />
                        </div>
                    </div>

                    {/* Nombre de pièces */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Bed className="h-4 w-4 mr-2" />
                            Nombre de pièces
                        </label>
                        <Select value={filters.rooms} onValueChange={(value) => updateFilter("rooms", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Indifférent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 pièce</SelectItem>
                                <SelectItem value="2">2 pièces</SelectItem>
                                <SelectItem value="3">3 pièces</SelectItem>
                                <SelectItem value="4">4 pièces</SelectItem>
                                <SelectItem value="5">5+ pièces</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Salles de bain */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Bath className="h-4 w-4 mr-2" />
                            Salles de bain
                        </label>
                        <Select value={filters.bathrooms} onValueChange={(value) => updateFilter("bathrooms", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Indifférent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 salle de bain</SelectItem>
                                <SelectItem value="2">2 salles de bain</SelectItem>
                                <SelectItem value="3">3+ salles de bain</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Boutons d'action */}
                    <div className="flex flex-col gap-2 pt-4">
                        <Button variant="default" className="w-full" onClick={applyFilters}>
                            Appliquer les filtres
                        </Button>
                        <Button variant="outline" className="w-full" onClick={resetFilters}>
                            Réinitialiser
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SearchFilters;
