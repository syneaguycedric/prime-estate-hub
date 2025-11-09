import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home, Banknote, Bed, Bath, Ruler } from "lucide-react";
import { PropertyFilters, GeoZone } from "@/lib/directus-api";

interface ActiveFiltersProps {
    filters: PropertyFilters;
    onRemoveFilter: (filterKey: string) => void;
    onClearAll: () => void;
    geoZones?: GeoZone[];
}

const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, geoZones = [] }: ActiveFiltersProps) => {
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
        if (!filters.zone) return "Commune/Département";

        const zone = geoZones.find((z) => z.id === filters.zone);
        if (zone?.name === "Grand Abidjan") {
            return "Commune";
        } else if (zone?.name === "Hors Abidjan") {
            return "Département";
        }
        return "Commune/Département";
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
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground font-medium">Filtres actifs ({activeFilters.length}) :</span>
                        {activeFilters.map((filter) => (
                            <Badge
                                key={filter.key}
                                variant="secondary"
                                className="flex items-center gap-1 px-3 py-1 text-xs hover:bg-destructive/10 hover:text-destructive transition-all duration-200 cursor-pointer group"
                                onClick={() => onRemoveFilter(filter.key)}
                            >
                                {filter.icon}
                                <span className="font-medium">{filter.label}:</span>
                                <span className="text-muted-foreground">{filter.value}</span>
                                <div className="ml-1 flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 group-hover:bg-destructive/20 transition-all duration-200">
                                    <X className="h-2.5 w-2.5 text-gray-600 group-hover:text-destructive transition-colors duration-200" />
                                </div>
                            </Badge>
                        ))}
                    </div>
                    <button onClick={onClearAll} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline">
                        Tout effacer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveFilters;
