import { useEffect, useRef } from "react";

interface PropertyMapProps {
    location: string;
    title: string;
    className?: string;
}

const PropertyMap = ({ location, title, className = "" }: PropertyMapProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        // Vérification SSR-safe
        if (typeof window === "undefined" || !mapRef.current) return;

        // Import dynamique de Leaflet côté client uniquement
        const initMap = async () => {
            try {
                const L = await import("leaflet");
                await import("leaflet/dist/leaflet.css");

                // Fix for default markers in Leaflet (côté client uniquement)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (L.default.Icon.Default.prototype as any)._getIconUrl;
                L.default.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                });

                // Geocoding simple pour la démo (en production, utiliser un service de géocodage)
                const getCoordinates = (location: string): [number, number] => {
                    // Coordonnées par défaut pour les villes de Côte d'Ivoire
                    const coordinates: { [key: string]: [number, number] } = {
                        Abidjan: [5.36, -4.0083],
                        Plateau: [5.3364, -4.0267],
                        Cocody: [5.3447, -3.9832],
                        Marcory: [5.2833, -3.9833],
                        "Grand-Bassam": [5.2111, -3.7389],
                        Bouaké: [7.6942, -5.03],
                        Yamoussoukro: [6.8276, -5.2893],
                    };

                    // Recherche par ville exacte ou partie du nom
                    for (const [city, coords] of Object.entries(coordinates)) {
                        if (location.toLowerCase().includes(city.toLowerCase())) {
                            return coords;
                        }
                    }

                    // Par défaut, retourner Abidjan
                    return coordinates["Abidjan"];
                };

                const [lat, lng] = getCoordinates(location);

                // Créer la carte uniquement si elle n'existe pas déjà
                if (!mapInstanceRef.current && mapRef.current) {
                    mapInstanceRef.current = L.default.map(mapRef.current).setView([lat, lng], 13);

                    // Ajouter la couche OpenStreetMap
                    L.default
                        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                        })
                        .addTo(mapInstanceRef.current);

                    // Ajouter un marqueur
                    L.default.marker([lat, lng]).addTo(mapInstanceRef.current);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de la carte:", error);
            }
        };

        initMap();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [location, title]);

    return <div ref={mapRef} className={`w-full h-64 rounded-lg border border-border ${className}`} style={{ minHeight: "256px" }} />;
};

export default PropertyMap;
