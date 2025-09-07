import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface PropertyMapProps {
  location: string;
  title: string;
  className?: string;
}

const PropertyMap = ({ location, title, className = "" }: PropertyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Geocoding simple pour la démo (en production, utiliser un service de géocodage)
    const getCoordinates = (location: string): [number, number] => {
      // Coordonnées par défaut pour les villes de Côte d'Ivoire
      const coordinates: { [key: string]: [number, number] } = {
        'Abidjan': [5.3600, -4.0083],
        'Plateau': [5.3364, -4.0267],
        'Cocody': [5.3447, -3.9832],
        'Marcory': [5.2833, -3.9833],
        'Grand-Bassam': [5.2111, -3.7389],
        'Bouaké': [7.6942, -5.0300],
        'Yamoussoukro': [6.8276, -5.2893],
      };

      // Recherche par ville exacte ou partie du nom
      for (const [city, coords] of Object.entries(coordinates)) {
        if (location.toLowerCase().includes(city.toLowerCase())) {
          return coords;
        }
      }
      
      // Par défaut, retourner Abidjan
      return coordinates['Abidjan'];
    };

    const [lat, lng] = getCoordinates(location);

    // Créer la carte
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 13);

      // Ajouter la couche OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);

      // Ajouter un marqueur
      L.marker([lat, lng])
        .addTo(mapInstanceRef.current);
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, title]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg border border-border ${className}`}
      style={{ minHeight: '256px' }}
    />
  );
};

export default PropertyMap;