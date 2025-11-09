import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home, Banknote, Bed, Bath, Ruler, Search } from "lucide-react";
import { PropertyFilters, GeoZone } from "@/lib/directus-api";

interface SearchFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    onFiltersChange?: (count: number) => void;
    onReset?: () => void;
    onApplyFilters?: (filters: PropertyFilters) => void;
    currentFilters?: PropertyFilters; // Ajouter les filtres actuels
    geoZones: GeoZone[]; // Zones géographiques
}

const SearchFilters = ({ isOpen, onClose, onFiltersChange, onReset, onApplyFilters, currentFilters, geoZones }: SearchFiltersProps) => {
    const [filters, setFilters] = useState({
        zone: "",
        areas: [] as string[],
        transaction: "",
        propertyType: "",
        minPrice: "",
        maxPrice: "",
        minSurface: "",
        maxSurface: "",
        rooms: "",
        bathrooms: "",
    });
    const [areasOpen, setAreasOpen] = useState(false);

    // Mapping entre les valeurs simplifiées (pour l'URL) et les IDs réels des zones
    const getZoneMapping = () => {
        const mapping: Record<string, { id: string; zone: GeoZone | null }> = {};
        
        // Trouver "Grand Abidjan" et "Hors Abidjan" dans les zones récupérées
        const grandAbidjan = geoZones.find(z => z.name === "Grand Abidjan");
        const horsAbidjan = geoZones.find(z => z.name === "Hors Abidjan");
        
        mapping["grand-abidjan"] = {
            id: grandAbidjan?.id || "",
            zone: grandAbidjan || null,
        };
        
        mapping["hors-abidjan"] = {
            id: horsAbidjan?.id || "",
            zone: horsAbidjan || null,
        };
        
        return mapping;
    };

    const zoneMapping = getZoneMapping();

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return zoneMapping[zoneValue]?.zone || null;
    };

    // Obtenir la zone actuellement sélectionnée
    const selectedZone = filters.zone ? getZoneByValue(filters.zone) : null;

    // Obtenir les towns de la zone sélectionnée
    const getTownsForSelectedZone = () => {
        if (!selectedZone) return [];
        return selectedZone.towns || [];
    };

    const getAreaName = (id: string) => {
        if (!selectedZone) return "";
        // Chercher dans les towns de la zone sélectionnée
        const town = selectedZone.towns.find((t) => t.id === id);
        return town?.name || "";
    };

    const toggleArea = (id: string) => {
        // Sélection unique: remplace toujours par l'ID cliqué
        setFilters((prev) => ({ ...prev, areas: [id] }));
        // Fermer automatiquement le Popover après sélection
        setAreasOpen(false);
    };

    // Synchroniser l'état local avec les filtres actuels
    useEffect(() => {
        if (currentFilters) {
            // Gérer town pour préremplir zone et areas
            let zoneValue = "";
            let areasValue: string[] = [];

            if (currentFilters.town) {
                // Chercher dans quelle zone se trouve ce town
                for (const geoZone of geoZones) {
                    const town = geoZone.towns?.find((t) => t.id === currentFilters.town);
                    if (town) {
                        // Déterminer la valeur simplifiée de la zone
                        if (geoZone.name === "Grand Abidjan") {
                            zoneValue = "grand-abidjan";
                        } else if (geoZone.name === "Hors Abidjan") {
                            zoneValue = "hors-abidjan";
                        }
                        areasValue = [currentFilters.town];
                        break;
                    }
                }
            }

            // Mapper contractType vers transaction (mapping inverse)
            let transactionValue = "";
            if (currentFilters.contractType) {
                const reverseTransactionMap: Record<string, string> = {
                    selling: "achat",
                    leasing: "location",
                    sale: "achat",
                    rent: "location",
                };
                transactionValue = reverseTransactionMap[currentFilters.contractType] || currentFilters.contractType;
            }

            setFilters((prev) => ({
                ...prev,
                zone: zoneValue,
                areas: areasValue,
                transaction: transactionValue || prev.transaction, // Garder la valeur précédente si pas de contractType
                propertyType: currentFilters.propertyType || prev.propertyType,
                minPrice: currentFilters.minPrice?.toString() || prev.minPrice,
                maxPrice: currentFilters.maxPrice?.toString() || prev.maxPrice,
                minSurface: currentFilters.minSurface?.toString() || prev.minSurface,
                maxSurface: currentFilters.maxSurface?.toString() || prev.maxSurface,
                rooms: currentFilters.rooms?.toString() || prev.rooms,
                bathrooms: currentFilters.bathrooms?.toString() || prev.bathrooms,
            }));
        }
    }, [currentFilters, geoZones]);

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
        let count = 0;
        if (filters.zone) count++;
        if (filters.areas.length > 0) count++;
        if (filters.transaction) count++;
        if (filters.propertyType) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.minSurface || filters.maxSurface) count++;
        if (filters.rooms) count++;
        if (filters.bathrooms) count++;
        return count;
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

        // Ajouter le filtre zone si une zone est sélectionnée
        if (filters.zone) {
            // Convertir la valeur simplifiée (grand-abidjan, hors-abidjan) en ID de zone
            const grandAbidjan = geoZones.find(z => z.name === "Grand Abidjan");
            const horsAbidjan = geoZones.find(z => z.name === "Hors Abidjan");
            
            if (filters.zone === "grand-abidjan" && grandAbidjan) {
                propertyFilters.zone = grandAbidjan.id;
            } else if (filters.zone === "hors-abidjan" && horsAbidjan) {
                propertyFilters.zone = horsAbidjan.id;
            }
        }

        // Ajouter le filtre town si une commune/département est sélectionnée
        if (filters.areas.length > 0) {
            propertyFilters.town = filters.areas[0];
        }

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
            zone: "",
            areas: [],
            transaction: "",
            propertyType: "",
            minPrice: "",
            maxPrice: "",
            minSurface: "",
            maxSurface: "",
            rooms: "",
            bathrooms: "",
        });
        setAreasOpen(false);
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
                    {/* Zone et Commune/Département */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            Localisation
                        </label>
                        {/* Zone */}
                        <Select
                            value={filters.zone}
                            onValueChange={(value) => {
                                setFilters((prev) => ({ ...prev, zone: value, areas: [] }));
                                setAreasOpen(false);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir une zone" />
                            </SelectTrigger>
                            <SelectContent>
                                {geoZones.map((geoZone) => {
                                    // Mapper le nom de zone vers la valeur simplifiée
                                    const zoneValue = geoZone.name === "Grand Abidjan" 
                                        ? "grand-abidjan" 
                                        : geoZone.name === "Hors Abidjan" 
                                        ? "hors-abidjan" 
                                        : null;
                                    
                                    if (!zoneValue) return null;
                                    
                                    return (
                                        <SelectItem key={geoZone.id} value={zoneValue}>
                                            {geoZone.name}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {/* Commune ou Département */}
                        <Popover open={areasOpen} onOpenChange={setAreasOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between" disabled={!filters.zone}>
                                    {filters.areas.length === 1 ? getAreaName(filters.areas[0]) : "Choisir une commune ou département"}
                                    <Search className="h-4 w-4 opacity-60" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] p-3">
                                <div className="max-h-64 overflow-auto pr-1">
                                    {getTownsForSelectedZone().map((town) => (
                                        <button
                                            type="button"
                                            key={town.id}
                                            onClick={() => toggleArea(town.id)}
                                            className="w-full flex items-center justify-between py-2 text-sm hover:bg-muted rounded px-2"
                                        >
                                            <span>{town.name}</span>
                                            <Checkbox checked={filters.areas[0] === town.id} onCheckedChange={() => toggleArea(town.id)} />
                                        </button>
                                    ))}
                                </div>
                                {filters.areas.length > 0 && (
                                    <>
                                        <Separator className="my-2" />
                                        <div className="flex items-center justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setFilters((prev) => ({ ...prev, areas: [] }));
                                                    setAreasOpen(false);
                                                }}
                                            >
                                                Effacer
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </PopoverContent>
                        </Popover>
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
                            <Banknote className="h-4 w-4 mr-2" />
                            Budget
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Prix min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} />
                            <Input placeholder="Prix max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
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

                    {/* Nombre de salle d'eau */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center">
                            <Bath className="h-4 w-4 mr-2" />
                            Nombre de salle d'eau
                        </label>
                        <Select value={filters.bathrooms} onValueChange={(value) => updateFilter("bathrooms", value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Indifférent" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 salle d'eau</SelectItem>
                                <SelectItem value="2">2 salles d'eau</SelectItem>
                                <SelectItem value="3">3+ salles d'eau</SelectItem>
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
