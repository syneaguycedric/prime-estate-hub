import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home, Banknote, Bed, Bath, Ruler } from "lucide-react";
import { PropertyFilters, GeoZone } from "@/lib/directus-api";
import { useState, useRef, useEffect } from "react";

interface ActiveFiltersProps {
    filters: PropertyFilters;
    onRemoveFilter: (filterKey: string) => void;
    onClearAll: () => void;
    geoZones?: GeoZone[];
}

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, geoZones = [] }: ActiveFiltersProps) => {
    const [hasAnimated, setHasAnimated] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Animation de scroll pour indiquer qu'on peut scroller (mobile uniquement)
    useEffect(() => {
        if (scrollContainerRef.current && !hasAnimated && typeof window !== "undefined" && window.innerWidth < 768) {
            const container = scrollContainerRef.current;
            const { scrollWidth, clientWidth } = container;

            // Vérifier si le contenu dépasse
            if (scrollWidth > clientWidth) {
                const maxScroll = scrollWidth - clientWidth;

                // Animation : scroll vers la gauche puis retour à droite
                const animateScroll = () => {
                    // Scroll vers la gauche (50% du scroll max)
                    container.scrollTo({
                        left: maxScroll * 0.5,
                        behavior: "smooth",
                    });

                    // Après 600ms, revenir à droite
                    setTimeout(() => {
                        container.scrollTo({
                            left: 0,
                            behavior: "smooth",
                        });
                        setHasAnimated(true);
                    }, 600);
                };

                // Démarrer l'animation après un court délai
                setTimeout(animateScroll, 300);
            } else {
                setHasAnimated(true);
            }
        }
    }, [hasAnimated, filters]);

    // Fonction pour obtenir le nom de la zone depuis son ID
    const getZoneName = (zoneId: string): string => {
        const zone = geoZones.find((z) => z.id === zoneId);
        return zone?.name || zoneId;
    };

    // Fonction pour obtenir le nom de la commune depuis son ID
    const getTownName = (townId: string): string => {
        for (const zone of geoZones) {
            const town = zone.towns?.find((t) => t.id === townId);
            if (town) return town.name;
        }
        return townId;
    };

    // Fonction pour déterminer si on doit afficher "Commune" ou "Département" selon la zone
    const getTownLabel = (): string => {
        // Si une zone est sélectionnée, vérifier si c'est "Grand Abidjan"
        if (filters.zone) {
            const selectedZone = geoZones.find((z) => z.id === filters.zone);
            if (selectedZone && selectedZone.name === "Grand Abidjan") {
                return "Commune";
            }
        }
        // Sinon, afficher "Département"
        return "Département";
    };
    // Fonction pour obtenir l'icône selon le type de filtre
    const getFilterIcon = (key: string) => {
        switch (key) {
            case "zone":
            case "town":
                return <MapPin className="h-3 w-3" />;
            case "contractType":
                return <Banknote className="h-3 w-3" />;
            case "type":
                return <Home className="h-3 w-3" />;
            case "rooms":
                return <Bed className="h-3 w-3" />;
            case "bathrooms":
                return <Bath className="h-3 w-3" />;
            case "surfaceArea":
                return <Ruler className="h-3 w-3" />;
            default:
                return null;
        }
    };

    // Fonction pour formater la valeur du filtre
    const formatFilterValue = (key: string, value: any) => {
        switch (key) {
            case "contractType":
                const contractMap: Record<string, string> = {
                    sale: "Vente",
                    rent: "Location",
                    leasing: "Location",
                };
                return contractMap[value] || value;
            case "type":
                const typeMap: Record<string, string> = {
                    appartment: "Appartement",
                    villa: "Villa",
                    land: "Terrain",
                };
                return typeMap[value] || value;
            case "rooms":
                return `${value} pièce${value > 1 ? "s" : ""}`;
            case "bathrooms":
                return `${value} salle${value > 1 ? "s" : ""} d'eau`;
            case "price":
                if (typeof value === "object" && value._gte && value._lte) {
                    return `${value._gte.toLocaleString()} - ${value._lte.toLocaleString()} FCFA`;
                } else if (value._gte) {
                    return `≥ ${value._gte.toLocaleString()} FCFA`;
                } else if (value._lte) {
                    return `≤ ${value._lte.toLocaleString()} FCFA`;
                }
                return value;
            case "surfaceArea":
                if (typeof value === "object" && value._gte && value._lte) {
                    return `${value._gte} - ${value._lte} m²`;
                } else if (value._gte) {
                    return `≥ ${value._gte} m²`;
                } else if (value._lte) {
                    return `≤ ${value._lte} m²`;
                }
                return value;
            default:
                return value;
        }
    };

    // Fonction pour obtenir le label du filtre
    const getFilterLabel = (key: string) => {
        const labels: Record<string, string> = {
            zone: "Zone",
            town: "Commune/Département",
            contractType: "Transaction",
            type: "Type",
            rooms: "Pièces",
            bathrooms: "Salles d'eau",
            price: "Prix",
            surfaceArea: "Surface",
        };
        return labels[key] || key;
    };

    // Construire la liste des filtres actifs
    const activeFilters = [];

    // Filtres simples
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            if (key === "search") {
                activeFilters.push({
                    key: "search",
                    label: "Recherche",
                    value: `"${value}"`,
                    icon: null,
                });
            } else if (key === "zone") {
                activeFilters.push({
                    key: "zone",
                    label: getFilterLabel("zone"),
                    value: getZoneName(value as string),
                    icon: getFilterIcon("zone"),
                });
            } else if (key === "town") {
                activeFilters.push({
                    key: "town",
                    label: getTownLabel(),
                    value: getTownName(value as string),
                    icon: getFilterIcon("town"),
                });
            } else if (key === "contractType") {
                activeFilters.push({
                    key: "contractType",
                    label: getFilterLabel("contractType"),
                    value: formatFilterValue("contractType", value),
                    icon: getFilterIcon("contractType"),
                });
            } else if (key === "type") {
                activeFilters.push({
                    key: "type",
                    label: getFilterLabel("type"),
                    value: formatFilterValue("type", value),
                    icon: getFilterIcon("type"),
                });
            } else if (key === "propertyType") {
                activeFilters.push({
                    key: "propertyType",
                    label: getFilterLabel("type"),
                    value: formatFilterValue("type", value),
                    icon: getFilterIcon("type"),
                });
            } else if (key === "rooms") {
                activeFilters.push({
                    key: "rooms",
                    label: getFilterLabel("rooms"),
                    value: formatFilterValue("rooms", value),
                    icon: getFilterIcon("rooms"),
                });
            } else if (key === "bathrooms") {
                activeFilters.push({
                    key: "bathrooms",
                    label: getFilterLabel("bathrooms"),
                    value: formatFilterValue("bathrooms", value),
                    icon: getFilterIcon("bathrooms"),
                });
            }
        }
    });

    // Filtres de prix (range)
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const priceValue: any = {};
        if (filters.minPrice !== undefined) priceValue._gte = filters.minPrice;
        if (filters.maxPrice !== undefined) priceValue._lte = filters.maxPrice;

        activeFilters.push({
            key: "price",
            label: getFilterLabel("price"),
            value: formatFilterValue("price", priceValue),
            icon: <Banknote className="h-3 w-3" />,
        });
    }

    // Filtres de surface (range)
    if (filters.minSurface !== undefined || filters.maxSurface !== undefined) {
        const surfaceValue: any = {};
        if (filters.minSurface !== undefined) surfaceValue._gte = filters.minSurface;
        if (filters.maxSurface !== undefined) surfaceValue._lte = filters.maxSurface;

        activeFilters.push({
            key: "surfaceArea",
            label: getFilterLabel("surfaceArea"),
            value: formatFilterValue("surfaceArea", surfaceValue),
            icon: getFilterIcon("surfaceArea"),
        });
    }

    // Trier les filtres pour que zone soit toujours avant town
    activeFilters.sort((a, b) => {
        // Ordre de priorité : zone (0), town (1), autres (2)
        const getPriority = (key: string): number => {
            if (key === "zone") return 0;
            if (key === "town") return 1;
            return 2;
        };

        return getPriority(a.key) - getPriority(b.key);
    });

    if (activeFilters.length === 0) {
        return null;
    }

    return (
        <div className="bg-background border-b border-border">
            <div className="container mx-auto px-4 py-2 md:py-2.5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
                    {/* Section des badges avec scroll horizontal sur mobile */}
                    <div className="relative flex-1 min-w-0">
                        <div
                            ref={scrollContainerRef}
                            className="flex items-center gap-1.5 md:gap-2.5 overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-x-visible -mx-1 px-1 md:mx-0 md:px-0"
                        >
                            <span className="text-xs md:text-sm text-muted-foreground font-medium whitespace-nowrap flex-shrink-0">
                                {activeFilters.length} filtre{activeFilters.length > 1 ? "s" : ""}
                            </span>
                            {activeFilters.map((filter) => (
                                <Badge
                                    key={filter.key}
                                    variant="secondary"
                                    className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer group flex-shrink-0 h-[28px] md:h-7 border border-border/50"
                                    onClick={() => onRemoveFilter(filter.key)}
                                >
                                    {filter.icon && <span className="flex-shrink-0 text-muted-foreground/70">{filter.icon}</span>}
                                    <span className="font-medium whitespace-nowrap text-gray-500">{filter.label}:</span>
                                    <span className="text-gray-400 whitespace-nowrap">{filter.value}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveFilter(filter.key);
                                        }}
                                        className="ml-0.5 flex items-center justify-center w-4 h-4 md:w-4 md:h-4 rounded-full bg-background hover:bg-destructive/20 transition-all duration-200 flex-shrink-0 border border-border shadow-sm"
                                        aria-label={`Supprimer ${filter.label}`}
                                    >
                                        <X className="h-2.5 w-2.5 text-foreground/80 group-hover:text-destructive transition-colors duration-200" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                    {/* Bouton Tout effacer : en dessous sur mobile, en bas à droite sur PC */}
                    <button
                        onClick={onClearAll}
                        className="text-xs md:text-sm text-muted-foreground hover:text-destructive transition-colors underline whitespace-nowrap self-start md:self-center font-medium"
                    >
                        Tout effacer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveFilters;
