// Service de données côté serveur pour SSR
import { properties, Property } from '@/data/properties';

// Simulation d'une latence réseau
const simulateNetworkDelay = (ms: number = 100): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    return Promise.resolve();
};

// Service pour récupérer tous les biens
export async function getAllProperties(): Promise<Property[]> {
    await simulateNetworkDelay(50);

    // En production, ceci serait un appel à une vraie base de données
    // Exemple avec Prisma :
    // return await prisma.property.findMany({
    //   include: { images: true, location: true }
    // });

    return properties;
}

// Service pour récupérer un bien par ID
export async function getPropertyById(id: string): Promise<Property | null> {
    await simulateNetworkDelay(30);

    // En production, ceci serait un appel à une vraie base de données
    // return await prisma.property.findUnique({
    //   where: { id },
    //   include: { images: true, location: true }
    // });

    const property = properties.find(p => p.id === id);
    return property || null;
}

// Service pour rechercher des biens
export async function searchProperties(query: string): Promise<Property[]> {
    await simulateNetworkDelay(80);

    if (!query.trim()) {
        return getAllProperties();
    }

    const searchTerm = query.toLowerCase();

    // En production, utiliser une recherche full-text avec la base de données
    // ou un service comme Elasticsearch
    const filteredProperties = properties.filter(property =>
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm) ||
        property.description?.toLowerCase().includes(searchTerm)
    );

    return filteredProperties;
}

// Service pour récupérer les biens par type
export async function getPropertiesByType(type: string): Promise<Property[]> {
    await simulateNetworkDelay(60);

    // En production :
    // return await prisma.property.findMany({
    //   where: { type },
    //   include: { images: true, location: true }
    // });

    return properties.filter(property =>
        property.type.toLowerCase() === type.toLowerCase()
    );
}

// Service pour récupérer les biens par localisation
export async function getPropertiesByLocation(location: string): Promise<Property[]> {
    await simulateNetworkDelay(60);

    const locationTerm = location.toLowerCase();

    return properties.filter(property =>
        property.location.toLowerCase().includes(locationTerm)
    );
}

// Service pour récupérer les statistiques des biens
export async function getPropertyStats(): Promise<{
    total: number;
    byType: Record<string, number>;
    byLocation: Record<string, number>;
    priceRange: { min: number; max: number };
}> {
    await simulateNetworkDelay(40);

    const total = properties.length;

    const byType = properties.reduce((acc, property) => {
        acc[property.type] = (acc[property.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const byLocation = properties.reduce((acc, property) => {
        const city = property.location.split(',')[0].trim();
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Extraction des prix pour calculer la fourchette
    const prices = properties.map(property => {
        const priceStr = property.price.replace(/[^\d]/g, '');
        return parseInt(priceStr) || 0;
    }).filter(price => price > 0);

    const priceRange = {
        min: Math.min(...prices),
        max: Math.max(...prices)
    };

    return {
        total,
        byType,
        byLocation,
        priceRange
    };
}

// Service pour récupérer les biens recommandés
export async function getRecommendedProperties(
    currentPropertyId?: string,
    limit: number = 4
): Promise<Property[]> {
    await simulateNetworkDelay(70);

    let availableProperties = properties;

    // Exclure la propriété actuelle si spécifiée
    if (currentPropertyId) {
        availableProperties = properties.filter(p => p.id !== currentPropertyId);
    }

    // Algorithme simple de recommandation
    // En production, utiliser un algorithme plus sophistiqué basé sur :
    // - Préférences utilisateur
    // - Historique de navigation
    // - Similitude des biens
    // - Géolocalisation

    // Pour l'instant, on prend les biens les plus récents ou populaires
    const shuffled = [...availableProperties].sort(() => Math.random() - 0.5);

    return shuffled.slice(0, limit);
}

// Service pour récupérer les biens tendances
export async function getTrendingProperties(limit: number = 6): Promise<Property[]> {
    await simulateNetworkDelay(50);

    // Simulation : prendre les biens avec certains critères
    // En production, ceci serait basé sur des métriques réelles :
    // - Nombre de vues
    // - Nombre de favoris
    // - Taux de conversion
    // - Engagement utilisateur

    const trending = properties
        .filter(property => property.isNew || property.price.includes('000')) // Simulation
        .slice(0, limit);

    return trending;
}

// Service pour récupérer les coordonnées d'une localisation
export async function getLocationCoordinates(location: string): Promise<{
    lat: number;
    lng: number;
} | null> {
    await simulateNetworkDelay(100);

    // Coordonnées hardcodées pour les principales villes de Côte d'Ivoire
    // En production, utiliser une API de géocodage comme Google Maps ou OpenStreetMap
    const coordinates: Record<string, { lat: number; lng: number }> = {
        'Abidjan': { lat: 5.3364, lng: -4.0267 },
        'Plateau': { lat: 5.3200, lng: -4.0267 },
        'Cocody': { lat: 5.3447, lng: -3.9739 },
        'Marcory': { lat: 5.2833, lng: -3.9833 },
        'Treichville': { lat: 5.2833, lng: -3.9667 },
        'Yamoussoukro': { lat: 6.8184, lng: -5.2755 },
        'Bouaké': { lat: 7.6944, lng: -5.0300 },
        'San Pedro': { lat: 4.7490, lng: -6.6363 },
        'Korhogo': { lat: 9.4581, lng: -5.6300 },
        'Daloa': { lat: 6.8770, lng: -6.4503 }
    };

    // Recherche par nom de ville exact
    const cityName = location.split(',')[0].trim();
    const coords = coordinates[cityName];

    if (coords) {
        return coords;
    }

    // Recherche approximative
    const fuzzyMatch = Object.keys(coordinates).find(city =>
        city.toLowerCase().includes(cityName.toLowerCase()) ||
        cityName.toLowerCase().includes(city.toLowerCase())
    );

    if (fuzzyMatch) {
        return coordinates[fuzzyMatch];
    }

    // Valeur par défaut : Abidjan
    return coordinates['Abidjan'];
}

// Service pour valider et nettoyer les données
export function validatePropertyData(property: Partial<Property>): Property | null {
    try {
        // Validation des champs requis
        if (!property.id || !property.title || !property.price || !property.location) {
            return null;
        }

        // Nettoyage et validation des données
        const cleanProperty: Property = {
            id: property.id,
            title: property.title.trim(),
            price: property.price.trim(),
            location: property.location.trim(),
            type: property.type || 'Appartement',
            surface: property.surface || '0 m²',
            image: property.image || property.images?.[0] || '/placeholder.svg',
            images: property.images && property.images.length > 0
                ? property.images
                : ['/placeholder.svg'],
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            isNew: property.isNew || false,
            isFavorite: property.isFavorite || false,
            description: property.description?.trim()
        };

        return cleanProperty;

    } catch (error) {
        console.error('Error validating property data:', error);
        return null;
    }
}
