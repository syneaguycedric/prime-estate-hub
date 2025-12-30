import { Property } from '@/data/properties';

/**
 * Formate le prix avec le cycle de facturation
 */
export function formatPrice(price: string, billingCycle: string): string {
    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
        return price; // Retourner tel quel si ce n'est pas un nombre
    }

    // Formater le prix avec des espaces pour la lisibilité
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(numericPrice);

    // Ajouter le cycle de facturation
    switch (billingCycle) {
        case 'monthly':
            return `${formattedPrice} FCFA/mois`;
        case 'yearly':
            return `${formattedPrice} FCFA/an`;
        case 'daily':
            return `${formattedPrice} FCFA/jour`;
        default:
            return `${formattedPrice} FCFA`;
    }
}

/**
 * Formate le prix sans le cycle de facturation (juste le prix avec FCFA)
 */
export function formatPriceOnly(price: string): string {
    const numericPrice = parseFloat(price);

    if (isNaN(numericPrice)) {
        return price; // Retourner tel quel si ce n'est pas un nombre
    }

    // Formater le prix avec des espaces pour la lisibilité
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(numericPrice);

    return `${formattedPrice} FCFA`;
}

/**
 * Détermine si un bien est nouveau (créé il y a moins de 7 jours)
 */
export function calculateIsNew(dateCreated: string): boolean {
    const createdDate = new Date(dateCreated);
    const now = new Date();
    const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

    return diffInDays < 7;
}

/**
 * Traduit les types de biens en français
 */
export function getPropertyTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
        'appartment': 'Appartement',
        'house': 'Maison',
        'villa': 'Villa',
        'land': 'Terrain',
        'commercial': 'Commercial'
    };

    return typeLabels[type] || type;
}

/**
 * Formate la surface avec l'unité
 */
export function formatSurface(area: string, unit: string): string {
    const numericArea = parseFloat(area);

    if (isNaN(numericArea)) {
        return area; // Retourner tel quel si ce n'est pas un nombre
    }

    // Formater avec 2 décimales maximum
    const formattedArea = numericArea % 1 === 0
        ? numericArea.toString()
        : numericArea.toFixed(2);

    return `${formattedArea} ${unit}`;
}

/**
 * Traduit le type de contrat en français
 */
export function getContractTypeLabel(type: string): string {
    const contractLabels: Record<string, string> = {
        'leasing': 'Location',
        'selling': 'Vente',
        'sale': 'Vente',
        'rent': 'Location'
    };

    return contractLabels[type] || type;
}

/**
 * Construit l'URL d'une image Directus avec transformations optionnelles
 */
export function buildImageUrl(fileId: string, transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}): string {
    // URL de base pour les assets Directus
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || 'https://koffimm-backoffice.cotedev.com:8143';
    const assetsUrl = `${baseUrl}/assets`;

    if (!transformations) {
        return `${assetsUrl}/${fileId}`;
    }

    // Construire les paramètres de transformation
    const params = new URLSearchParams();

    if (transformations.width) params.append('width', transformations.width.toString());
    if (transformations.height) params.append('height', transformations.height.toString());
    if (transformations.quality) params.append('quality', transformations.quality.toString());
    if (transformations.format) params.append('format', transformations.format);
    if (transformations.fit) params.append('fit', transformations.fit);

    const queryString = params.toString();
    return queryString ? `${assetsUrl}/${fileId}?${queryString}` : `${assetsUrl}/${fileId}`;
}

/**
 * Transforme une propriété brute de l'API en propriété formatée pour l'UI
 */
export function formatProperty(rawProperty: Property): Property {
    return {
        ...rawProperty,
        // Calculer isNew depuis date_created
        isNew: calculateIsNew(rawProperty.date_created),
        // Construire location depuis address (pour l'instant, on garde tel quel)
        location: rawProperty.location || `Adresse ${rawProperty.address}`,
        // S'assurer que isFavorite est défini
        isFavorite: rawProperty.isFavorite || false
    };
}

/**
 * Extrait l'URL de la première image d'une propriété
 */
export function getFirstImageUrl(property: Property): string {
    if (property.images && property.images.length > 0) {
        const firstImage = property.images[0];
        if (firstImage && firstImage.directus_files_id?.id) {
            return buildImageUrl(firstImage.directus_files_id.id);
        }
    }

    // Fallback vers une image par défaut
    return '/assets/placeholder.svg';
}

/**
 * Extrait l'URL de la première image d'une propriété avec redimensionnement pour les cartes
 */
export function getFirstImageUrlForCard(property: Property): string {
    if (property.images && property.images.length > 0) {
        const firstImage = property.images[0];
        if (firstImage && firstImage.directus_files_id?.id) {
            return buildImageUrl(firstImage.directus_files_id.id, {
                width: 400,
                height: 300,
                fit: 'cover',
                quality: 80,
                format: 'webp'
            });
        }
    }

    // Fallback vers une image par défaut
    return '/assets/placeholder.svg';
}

/**
 * Extrait l'URL de la première image d'une propriété avec redimensionnement pour les détails
 */
export function getFirstImageUrlForDetail(property: Property): string {
    if (property.images && property.images.length > 0) {
        const firstImage = property.images[0];
        if (firstImage && firstImage.directus_files_id?.id) {
            return buildImageUrl(firstImage.directus_files_id.id, {
                width: 800,
                height: 600,
                fit: 'cover',
                quality: 90,
                format: 'webp'
            });
        }
    }

    // Fallback vers une image par défaut
    return '/assets/placeholder.svg';
}

/**
 * Extrait toutes les URLs d'images d'une propriété
 */
export function getAllImageUrls(property: Property): string[] {
    if (property.images && property.images.length > 0) {
        return property.images.map(img => {
            if (img && img.directus_files_id?.id) {
                return buildImageUrl(img.directus_files_id.id);
            }
            return '/assets/placeholder.svg';
        });
    }

    // Fallback vers une image par défaut
    return ['/assets/placeholder.svg'];
}

/**
 * Formate les caractéristiques pour l'affichage
 */
export function formatCharacteristics(characteristics: Array<{ name: string; value: string }> | null | undefined): string[] {
    if (!characteristics || !Array.isArray(characteristics)) {
        return [];
    }
    return characteristics.map(char => `${char.name}: ${char.value}`);
}

/**
 * Filtre les propriétés par type de contrat
 */
export function filterByContractType(properties: Property[], contractType: string): Property[] {
    if (!contractType || contractType === 'all') {
        return properties;
    }

    return properties.filter(property => property.contractType === contractType);
}

/**
 * Filtre les propriétés par type de bien
 */
export function filterByPropertyType(properties: Property[], propertyType: string): Property[] {
    if (!propertyType || propertyType === 'all') {
        return properties;
    }

    return properties.filter(property => property.type === propertyType);
}

/**
 * Filtre les propriétés par prix (min/max)
 */
export function filterByPriceRange(properties: Property[], minPrice?: number, maxPrice?: number): Property[] {
    return properties.filter(property => {
        const price = parseFloat(property.price);

        if (isNaN(price)) return false;

        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;

        return true;
    });
}

/**
 * Filtre les propriétés par nombre de pièces
 */
export function filterByRooms(properties: Property[], minRooms?: number, maxRooms?: number): Property[] {
    return properties.filter(property => {
        if (minRooms !== undefined && property.rooms < minRooms) return false;
        if (maxRooms !== undefined && property.rooms > maxRooms) return false;

        return true;
    });
}

/**
 * Recherche dans les propriétés par titre, description et localisation
 */
export function searchProperties(properties: Property[], searchTerm: string): Property[] {
    if (!searchTerm.trim()) {
        return properties;
    }

    const term = searchTerm.toLowerCase();

    return properties.filter(property =>
        property.title.toLowerCase().includes(term) ||
        (property.description && property.description.toLowerCase().includes(term)) ||
        (property.location && property.location.toLowerCase().includes(term)) ||
        getPropertyTypeLabel(property.type).toLowerCase().includes(term)
    );
}

/**
 * Extrait le nom de la commune/département depuis une propriété
 */
export function getTownName(property: Property): string | null {
    const town = (property as any).town;
    if (!town) return null;
    
    if (typeof town === "string") {
        // Si town est juste un ID, on ne peut pas déterminer le nom
        return null;
    }
    
    if (typeof town === "object" && town.name) {
        return town.name;
    }
    
    return null;
}

/**
 * Formate la localisation complète : "town, location" ou juste "location" si pas de town
 */
export function formatLocation(property: Property): string {
    const townName = getTownName(property);
    const location = property.location || '';
    
    if (townName && location) {
        return `${townName}, ${location}`;
    } else if (townName) {
        return townName;
    } else if (location) {
        return location;
    }
    
    return 'Localisation non disponible';
}
