import { apiClient } from '@/lib/api-client';
import { Property, PropertyImage } from '@/data/properties';
import { properties } from '@/data/properties';
import { formatProperty } from '@/lib/property-helpers';
import { toast } from '@/lib/toast-helpers';
import { createAuthenticatedFetch } from '@/lib/auth-helpers';

// Interface pour la réponse de l'API Directus
interface DirectusResponse<T> {
    data: T;
}

// Interface pour la réponse de connexion
interface LoginResponse {
    data: {
        access_token: string;
        expires: number;
        refresh_token: string;
    };
}

// Interface pour les erreurs Directus
interface DirectusError {
    message: string;
    extensions: {
        code: string;
    };
}

interface DirectusErrorResponse {
    errors: DirectusError[];
}

// Interface pour les données utilisateur
export interface User {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
    location?: string;
    title?: string;
    description?: string;
    language?: string;
    theme?: string;
    account?: {
        id: string;
        account_type: string;
        phoneNumber?: string;
        agency?: Agency | null; // Agence actuelle (objet complet)
        agencies?: Array<{
            estate_agencies_id: Agency;
        }>; // Toutes les agences de l'utilisateur
    };
    role?: {
        id: string;
        name: string;
    };
}

// Interface pour les contacts
export interface Contact {
    type: "email" | "phone";
    value: string;
}

// Interface pour l'adresse d'agence
export interface AgencyAddress {
    id: number;
    country: string;
    state: string;
    city: string;
    street: string;
    geocoord?: {
        type: string;
        coordinates: [number, number];
    };
    contacts: Contact[];
    social_links?: Array<{
        service: string;
        url: string;
    }>;
}

// Interface pour les agences immobilières
export interface Agency {
    id: string;
    title: string;
    address: AgencyAddress; // Maintenant objet complet au lieu de juste ID
    docs?: any[];
    date_created?: string;
    date_updated?: string;
    user_created?: string;
    user_updated?: string;
    status?: string;
}

// Interface pour la création d'une agence
export interface CreateAgencyData {
    title: string;
    address: {
        country: string;
        state: string;
        city: string;
        street: string;
        geocoord?: {
            type: "Point";
            coordinates: [number, number];
        };
        contacts?: Array<{
            type: "email" | "phone";
            value: string;
        }>;
        social_links?: Array<{
            service: string;
            url: string;
        }>;
    };
    docs?: any[];
}

// Interface pour les données d'inscription
export interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    title?: string;
    location?: string;
    phoneNumber?: string;
    email_notifications?: boolean;
}

// Interface pour la réponse d'inscription
export interface RegisterResponse {
    success: boolean;
    user?: User;
    error?: string;
}

// Interface pour les filtres de recherche
export interface PropertyFilters {
    search?: string;              // Recherche globale (titre, description, localisation)
    location?: string;            // Ville/Région spécifique
    contractType?: string;        // "leasing" (location) ou "selling" (vente)
    propertyType?: string;        // Type de bien
    minPrice?: number;            // Prix minimum
    maxPrice?: number;            // Prix maximum
    minSurface?: number;          // Surface minimum en m²
    maxSurface?: number;          // Surface maximum en m²
    rooms?: number;               // Nombre de pièces
    bathrooms?: number;           // Nombre de salles d'eau
    page?: number;                // Numéro de page (défaut: 1)
    limit?: number;               // Éléments par page (défaut: 12)
    planCode?: string;           // Code du plan d'abonnement (ex: "kylimmo", "premium")
    town?: string;                // ID de la commune/département (townId)
    zone?: string;                // ID de la zone géographique (zoneId)
}

// Interface pour la réponse paginée
export interface PaginatedResponse {
    properties: Property[];
    total: number;
    page: number;
    totalPages: number;
}

// Interface pour une ville/commune/département
export interface Town {
    id: string;
    name: string;
    zone: string;
    status?: string;
    sort?: number | null;
    date_created?: string;
    date_updated?: string | null;
    user_created?: string;
    user_updated?: string | null;
}

// Interface pour une zone géographique
export interface GeoZone {
    id: string;
    name: string;
    description?: string | null;
    status?: string;
    sort?: number | null;
    date_created?: string;
    date_updated?: string | null;
    user_created?: string | null;
    user_updated?: string | null;
    towns: Town[];
}

// Interface pour un plan d'abonnement
export interface SubscriptionPlan {
    id: string;
    status?: string;
    sort?: number | null;
    user_created?: string;
    date_created?: string;
    user_updated?: string;
    date_updated?: string;
    title: string;
    description?: string | null;
    code: string;
    agencies?: string[];
}

// Interface pour les données globales
export interface Globals {
    id: string;
    date_created?: string;
    date_updated?: string;
    title: string;
    url?: string;
    short_description?: string | null;
    description?: string | null;
    social_links?: any;
    user_created?: string | null;
    user_updated?: string | null;
    logo?: {
        id: string;
        title?: string;
        filename_download?: string;
        [key: string]: any;
    };
    logo_dark_mode?: {
        id: string;
        title?: string;
        filename_download?: string;
        [key: string]: any;
    };
    favicon?: {
        id: string;
        title?: string;
        filename_download?: string;
        [key: string]: any;
    };
}

/**
 * Vérifie si un utilisateur a le rôle "Advertiser"
 */
export function isUserAdvertiser(user: User | null | undefined): boolean {
    return user?.role?.name === "Advertiser";
}

// Configuration
const DIRECTUS_DOMAIN = 'ki-backoffice.eyoboue.dev:8143';
const USE_MOCK_DATA = false; // Forcer l'utilisation de l'API uniquement

/**
 * Récupère la liste des biens immobiliers depuis l'API Directus
 */
export async function fetchProperties(): Promise<Property[]> {
    // Si on utilise les données mockées, les retourner directement
    if (USE_MOCK_DATA) {
        console.log('[DIRECTUS API] Using mock data');
        return properties.map(formatProperty);
    }

    try {
        console.log('[DIRECTUS API] Fetching properties from API');

        const response = await apiClient.get<DirectusResponse<Property[]>>(
            DIRECTUS_DOMAIN,
            'items/real_estates?fields=*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*',
            {
                cacheKey: 'real-estates-list',
                cacheTtl: 300000, // 5 minutes
            }
        );

        // Formater les propriétés pour l'UI
        const formattedProperties = response.data.map(formatProperty);

        console.log(`[DIRECTUS API] Fetched ${formattedProperties.length} properties`);

        // Afficher un toast de succès (optionnel, peut être commenté en production)
        if (process.env.NODE_ENV === 'development') {
            toast.success('API Directus connectée', {
                description: `${formattedProperties.length} biens immobiliers chargés depuis l'API`,
                duration: 3000,
            });
        }

        return formattedProperties;

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching properties:', error);

        // Afficher un toast d'erreur
        toast.error('Erreur de connexion', {
            description: 'Impossible de charger les biens immobiliers. Veuillez réessayer.',
            duration: 5000,
        });

        // Retourner un tableau vide au lieu de mock data
        return [];
    }
}

/**
 * Fonction helper pour filtrer les propriétés mockées (fallback)
 */
function mockFilteredProperties(filters: PropertyFilters): PaginatedResponse {
    const {
        search,
        location,
        contractType,
        propertyType,
        minPrice,
        maxPrice,
        minSurface,
        maxSurface,
        rooms,
        bathrooms,
        page = 1,
        limit = 12
    } = filters;

    let filtered = properties.map(formatProperty);

    // Appliquer les filtres
    if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p =>
            p.title?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower) ||
            p.location?.toLowerCase().includes(searchLower)
        );
    }

    if (location) {
        const locationLower = location.toLowerCase();
        filtered = filtered.filter(p => p.location?.toLowerCase().includes(locationLower));
    }

    if (contractType) {
        filtered = filtered.filter(p => p.contractType === contractType);
    }

    if (propertyType) {
        filtered = filtered.filter(p => p.type === propertyType);
    }

    if (minPrice !== undefined) {
        filtered = filtered.filter(p => {
            const priceNumber = parseFloat(p.price.replace(/[^\d]/g, ''));
            return priceNumber >= minPrice;
        });
    }

    if (maxPrice !== undefined) {
        filtered = filtered.filter(p => {
            const priceNumber = parseFloat(p.price.replace(/[^\d]/g, ''));
            return priceNumber <= maxPrice;
        });
    }

    if (minSurface !== undefined) {
        filtered = filtered.filter(p => {
            const surfaceNumber = parseFloat(p.surfaceArea.replace(/[^\d]/g, ''));
            return surfaceNumber >= minSurface;
        });
    }

    if (maxSurface !== undefined) {
        filtered = filtered.filter(p => {
            const surfaceNumber = parseFloat(p.surfaceArea.replace(/[^\d]/g, ''));
            return surfaceNumber <= maxSurface;
        });
    }

    if (rooms !== undefined) {
        filtered = filtered.filter(p => p.rooms === rooms);
    }

    if (bathrooms !== undefined) {
        filtered = filtered.filter(p => p.bathrooms === bathrooms);
    }

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedProperties = filtered.slice(offset, offset + limit);

    return {
        properties: paginatedProperties,
        total,
        page,
        totalPages
    };
}

/**
 * Récupère les biens immobiliers avec filtres et pagination depuis l'API Directus
 */
export async function fetchPropertiesWithFilters(
    filters: PropertyFilters = {}
): Promise<PaginatedResponse> {
    // Si on utilise les données mockées, fallback vers filtrage client
    if (USE_MOCK_DATA) {
        console.log('[DIRECTUS API] Using mock data with filters');
        return mockFilteredProperties(filters);
    }

    try {
        const {
            search,
            location,
            contractType,
            propertyType,
            minPrice,
            maxPrice,
            minSurface,
            maxSurface,
            rooms,
            bathrooms,
            page = 1,
            limit = 12
        } = filters;

        console.log('[DIRECTUS API] Fetching properties with filters:', filters);

        // Construire les filtres Directus
        const directusFilters: Record<string, any> = {};

        // Nettoyer les valeurs vides ou undefined
        const cleanSearch = search?.trim();
        // const cleanLocation = location?.trim(); // Plus utilisé - champ location inexistant dans Directus

        // Recherche globale (OR sur plusieurs champs)
        // On stocke temporairement le filtre de recherche pour éviter les conflits avec le filtre premium
        let searchOrFilter: any = null;
        if (cleanSearch && cleanSearch.length > 0) {
            searchOrFilter = [
                { title: { _contains: cleanSearch } },
                { description: { _contains: cleanSearch } }
                // Retiré: { location: { _contains: cleanSearch } } - champ inexistant dans Directus
            ];
        }

        // Filtres spécifiques
        // Retiré: filtre sur location - champ inexistant dans Directus
        // if (cleanLocation && cleanLocation.length > 0) {
        //     directusFilters['location'] = { _contains: cleanLocation };
        // }

        // Construire les filtres de base (town et contractType seront gérés séparément)
        const baseFilters: Record<string, any> = {};

        if (propertyType) {
            baseFilters['type'] = { _eq: propertyType };
        }

        // Filtres de prix (range)
        if (minPrice !== undefined || maxPrice !== undefined) {
            baseFilters['price'] = {};
            if (minPrice !== undefined) {
                baseFilters['price']['_gte'] = minPrice;
            }
            if (maxPrice !== undefined) {
                baseFilters['price']['_lte'] = maxPrice;
            }
        }

        // Filtres de surface (range)
        if (minSurface !== undefined || maxSurface !== undefined) {
            baseFilters['surfaceArea'] = {};
            if (minSurface !== undefined) {
                baseFilters['surfaceArea']['_gte'] = minSurface;
            }
            if (maxSurface !== undefined) {
                baseFilters['surfaceArea']['_lte'] = maxSurface;
            }
        }

        if (rooms !== undefined) {
            baseFilters['rooms'] = { _eq: rooms };
        }

        if (bathrooms !== undefined) {
            baseFilters['bathrooms'] = { _eq: bathrooms };
        }

        // Gérer town et contractType dans un _AND si les deux sont présents
        const andFilters: any[] = [];
        
        if (filters.town && contractType) {
            // Si on a les deux, les combiner dans un _AND
            andFilters.push({ town: { _eq: filters.town } });
            andFilters.push({ contractType: { _eq: contractType } });
        } else {
            // Sinon, les ajouter individuellement
            if (filters.town) {
                baseFilters['town'] = { _eq: filters.town };
            }
            if (contractType) {
                baseFilters['contractType'] = { _eq: contractType };
            }
        }

        // Ajouter les filtres de base
        Object.assign(directusFilters, baseFilters);

        // Filtre par plan d'abonnement (VIP/Kylimmo)
        if (filters.planCode) {
            // Pour kylimmo, filtrer par agence avec plan kylimmo
            if (filters.planCode === 'kylimmo') {
                directusFilters['agency'] = { 'plan': { 'code': { '_eq': 'kylimmo' } } };
            }
            // Pour premium, filtrer par utilisateur OU agence avec plan premium
            else if (filters.planCode === 'premium') {
                const premiumOrFilter = [
                    { 'user_created': { 'plan': { 'code': { '_eq': 'premium' } } } },
                    { 'agency': { 'plan': { 'code': { '_eq': 'premium' } } } }
                ];
                
                // Si on a aussi un filtre de recherche, combiner avec _and
                if (searchOrFilter) {
                    // Si on a déjà un _AND avec town et contractType, l'ajouter
                    if (andFilters.length > 0) {
                        andFilters.push({ '_or': searchOrFilter });
                        andFilters.push({ '_or': premiumOrFilter });
                        directusFilters['_and'] = andFilters;
                    } else {
                        directusFilters['_and'] = [
                            { '_or': searchOrFilter },
                            { '_or': premiumOrFilter }
                        ];
                    }
                } else if (andFilters.length > 0) {
                    // Si on a town et contractType dans _AND, ajouter le filtre premium
                    andFilters.push({ '_or': premiumOrFilter });
                    directusFilters['_and'] = andFilters;
                } else {
                    directusFilters['_or'] = premiumOrFilter;
                }
            }
        } else if (searchOrFilter) {
            // Si pas de filtre premium mais qu'on a une recherche
            if (andFilters.length > 0) {
                // Si on a town et contractType dans _AND, ajouter la recherche
                andFilters.push({ '_or': searchOrFilter });
                directusFilters['_and'] = andFilters;
            } else {
                // Sinon, utiliser le filtre de recherche normalement
                directusFilters['_or'] = searchOrFilter;
            }
        } else if (andFilters.length > 0) {
            // Si on a seulement town et contractType, créer le _AND
            directusFilters['_and'] = andFilters;
        }

        // Construire l'URL avec paramètres
        const offset = (page - 1) * limit;
        const params: Record<string, string> = {
            fields: '*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*',
            limit: limit.toString(),
            offset: offset.toString(),
            meta: 'filter_count'
        };

        // Ajouter les filtres seulement s'il y en a et qu'ils sont valides
        if (Object.keys(directusFilters).length > 0) {
            // Vérifier que les filtres ne sont pas vides
            const hasValidFilters = Object.values(directusFilters).some(value => {
                if (Array.isArray(value)) return value.length > 0;
                if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
                return value !== undefined && value !== null && value !== '';
            });

            if (hasValidFilters) {
                params['filter'] = JSON.stringify(directusFilters);
                console.log('[DIRECTUS API] Sending filters:', directusFilters);
            } else {
                console.log('[DIRECTUS API] No valid filters to send');
            }
        }

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get<DirectusResponse<Property[]> & { meta: { filter_count: number } }>(
            DIRECTUS_DOMAIN,
            `items/real_estates?${queryString}`
        );

        const formattedProperties = response.data.map(formatProperty);
        const total = response.meta?.filter_count || formattedProperties.length;
        const totalPages = Math.ceil(total / limit);

        console.log(`[DIRECTUS API] Fetched ${formattedProperties.length} properties (total: ${total}, page: ${page}/${totalPages})`);

        return {
            properties: formattedProperties,
            total,
            page,
            totalPages
        };

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching properties with filters:', error);

        // Afficher un toast d'erreur à l'utilisateur
        toast.error('Erreur de connexion', {
            description: 'Impossible de charger les biens immobiliers. Veuillez réessayer.',
            duration: 5000,
        });

        // Retourner une réponse vide au lieu de mock data
        return {
            properties: [],
            total: 0,
            page: 1,
            totalPages: 0
        };
    }
}

/**
 * Récupère les annonces en vedette (premium) depuis l'API Directus
 * Filtre : utilisateur ou agence avec plan premium
 */
export async function fetchFeaturedProperties(): Promise<Property[]> {
    // Si on utilise les données mockées, fallback vers données locales
    if (USE_MOCK_DATA) {
        console.log('[DIRECTUS API] Using mock data for featured properties');
        return properties.slice(0, 4).map(formatProperty);
    }

    try {
        console.log('[DIRECTUS API] Fetching featured properties (premium) from API');

        // Construire le filtre premium : user_created.plan.code='premium' OU agency.plan.code='premium'
        const premiumFilter = {
            "_or": [
                { "user_created": { "plan": { "code": { "_eq": "premium" } } } },
                { "agency": { "plan": { "code": { "_eq": "premium" } } } }
            ]
        };

        // Construire l'URL avec paramètres
        const params: Record<string, string> = {
            fields: '*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*',
            limit: '4',
            filter: JSON.stringify(premiumFilter)
        };

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get<DirectusResponse<Property[]>>(
            DIRECTUS_DOMAIN,
            `items/real_estates?${queryString}`
        );

        const formattedProperties = response.data.map(formatProperty);

        console.log(`[DIRECTUS API] Fetched ${formattedProperties.length} featured properties`);

        return formattedProperties;

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching featured properties:', error);

        // Retourner un tableau vide en cas d'erreur
        return [];
    }
}

/**
 * Récupère les annonces en vedette (premium) par zone depuis l'API Directus
 * Filtre : utilisateur ou agence avec plan premium ET zone spécifiée
 * @param zoneId - ID de la zone géographique
 * @param limit - Nombre maximum d'annonces à récupérer (défaut: 6)
 */
export async function fetchFeaturedPropertiesByZone(zoneId: string, limit: number = 6): Promise<Property[]> {
    // Si on utilise les données mockées, fallback vers données locales
    if (USE_MOCK_DATA) {
        console.log('[DIRECTUS API] Using mock data for featured properties by zone');
        return properties.slice(0, limit).map(formatProperty);
    }

    try {
        console.log(`[DIRECTUS API] Fetching featured properties (premium) for zone ${zoneId} from API`);

        // Construire le filtre premium avec zone : 
        // (user_created.plan.code='premium' OU agency.plan.code='premium') ET town.zone=zoneId
        const premiumFilter = {
            "_and": [
                {
                    "_or": [
                        { "user_created": { "plan": { "code": { "_eq": "premium" } } } },
                        { "agency": { "plan": { "code": { "_eq": "premium" } } } }
                    ]
                },
                { "town": { "zone": { "_eq": zoneId } } }
            ]
        };

        // Construire l'URL avec paramètres
        const params: Record<string, string> = {
            fields: '*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*',
            limit: limit.toString(),
            filter: JSON.stringify(premiumFilter)
        };

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get<DirectusResponse<Property[]>>(
            DIRECTUS_DOMAIN,
            `items/real_estates?${queryString}`
        );

        const formattedProperties = response.data.map(formatProperty);

        console.log(`[DIRECTUS API] Fetched ${formattedProperties.length} featured properties for zone ${zoneId}`);

        return formattedProperties;

    } catch (error) {
        console.error(`[DIRECTUS API] Error fetching featured properties for zone ${zoneId}:`, error);

        // Retourner un tableau vide en cas d'erreur
        return [];
    }
}

/**
 * Récupère les annonces VIP (kylimmo) depuis l'API Directus
 * Filtre : agence avec plan kylimmo
 */
export async function fetchVipProperties(): Promise<Property[]> {
    // Si on utilise les données mockées, fallback vers données locales
    if (USE_MOCK_DATA) {
        console.log('[DIRECTUS API] Using mock data for VIP properties');
        return properties.slice(0, 6).map(formatProperty);
    }

    try {
        console.log('[DIRECTUS API] Fetching VIP properties (kylimmo) from API');

        // Construire le filtre kylimmo : agency.plan.code='kylimmo'
        const kylimmoFilter = {
            "agency": { "plan": { "code": { "_eq": "kylimmo" } } }
        };

        // Construire l'URL avec paramètres
        const params: Record<string, string> = {
            fields: '*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*',
            limit: '6',
            filter: JSON.stringify(kylimmoFilter)
        };

        const queryString = new URLSearchParams(params).toString();

        const response = await apiClient.get<DirectusResponse<Property[]>>(
            DIRECTUS_DOMAIN,
            `items/real_estates?${queryString}`
        );

        const formattedProperties = response.data.map(formatProperty);

        console.log(`[DIRECTUS API] Fetched ${formattedProperties.length} VIP properties`);

        return formattedProperties;

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching VIP properties:', error);

        // Retourner un tableau vide en cas d'erreur
        return [];
    }
}

/**
 * Récupère un bien immobilier par son ID depuis l'API Directus
 */
export async function fetchPropertyById(id: string, forceRefresh: boolean = false): Promise<Property | null> {
    // Si on utilise les données mockées, chercher dans les données locales
    if (USE_MOCK_DATA) {
        console.log(`[DIRECTUS API] Using mock data for property ${id}`);
        const property = properties.find(p => p.id === id);
        return property ? formatProperty(property) : null;
    }

    try {
        console.log(`[DIRECTUS API] Fetching property ${id} from API`);

        // Appel direct à l'API pour récupérer les détails d'une propriété spécifique
        const response = await apiClient.get<DirectusResponse<Property>>(
            DIRECTUS_DOMAIN,
            `items/real_estates/${id}?fields=*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*`,
            {
                cacheKey: forceRefresh ? `real-estate-${id}-${Date.now()}` : `real-estate-${id}`,
                cacheTtl: forceRefresh ? 0 : 300000, // Pas de cache si forceRefresh
            }
        );

        const formattedProperty = formatProperty(response.data);
        console.log(`[DIRECTUS API] Fetched property: ${formattedProperty.title}`);
        return formattedProperty;

    } catch (error) {
        console.error(`[DIRECTUS API] Error fetching property ${id}:`, error);

        // Afficher un toast d'erreur
        toast.error('Erreur de connexion', {
            description: 'Impossible de charger les détails du bien. Veuillez réessayer.',
            duration: 5000,
        });

        // Retourner null au lieu de mock data
        return null;
    }
}


/**
 * Vérifie si l'API Directus est accessible
 */
export async function checkDirectusHealth(): Promise<boolean> {
    if (USE_MOCK_DATA) {
        return true; // Les données mockées sont toujours disponibles
    }

    try {
        await apiClient.get(
            DIRECTUS_DOMAIN,
            'server/ping',
            {
                cacheKey: 'directus-health',
                cacheTtl: 60000, // 1 minute
            }
        );
        return true;
    } catch (error) {
        console.error('[DIRECTUS API] Health check failed:', error);
        return false;
    }
}

/**
 * Construit l'URL complète d'une image Directus
 */
export function buildDirectusImageUrl(fileId: string, transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
}): string {
    // URL de base pour les assets Directus
    const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || 'https://ki-backoffice.eyoboue.dev:8143';
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

    const queryString = params.toString();
    return queryString ? `${assetsUrl}/${fileId}?${queryString}` : `${assetsUrl}/${fileId}`;
}

/**
 * Récupère les métadonnées d'un fichier Directus
 */
export async function fetchFileMetadata(fileId: string): Promise<any> {
    if (USE_MOCK_DATA) {
        return null;
    }

    try {
        const response = await apiClient.get(
            DIRECTUS_DOMAIN,
            `files/${fileId}`,
            {
                cacheKey: `file-${fileId}`,
                cacheTtl: 3600000, // 1 heure pour les métadonnées de fichiers
            }
        );

        return response;
    } catch (error) {
        console.error(`[DIRECTUS API] Error fetching file metadata for ${fileId}:`, error);
        return null;
    }
}

/**
 * Invalide le cache pour les propriétés
 */
export async function invalidatePropertiesCache(): Promise<void> {
    try {
        await apiClient.invalidateCache('real-estates-list');
        console.log('[DIRECTUS API] Properties cache invalidated');
    } catch (error) {
        console.error('[DIRECTUS API] Error invalidating cache:', error);
    }
}

/**
 * Invalide le cache pour une propriété spécifique
 */
export async function invalidatePropertyCache(propertyId: string): Promise<void> {
    try {
        await apiClient.invalidateCache(`real-estate-${propertyId}`);
        console.log(`[DIRECTUS API] Property ${propertyId} cache invalidated`);
    } catch (error) {
        console.error(`[DIRECTUS API] Error invalidating property cache:`, error);
    }
}

/**
 * Récupère la liste des zones géographiques depuis l'API Directus
 */
export async function fetchGeoZones(): Promise<GeoZone[]> {
    try {
        console.log('[DIRECTUS API] Fetching geo zones from API');

        const response = await apiClient.get<DirectusResponse<GeoZone[]>>(
            DIRECTUS_DOMAIN,
            'items/geo_zones?fields=*.*',
            {
                cacheKey: 'geo-zones-list',
                cacheTtl: 3600000, // 1 heure - les zones changent rarement
            }
        );

        console.log(`[DIRECTUS API] Fetched ${response.data.length} geo zones`);

        return response.data;
    } catch (error) {
        console.error('[DIRECTUS API] Error fetching geo zones:', error);

        // Retourner un tableau vide en cas d'erreur
        return [];
    }
}

/**
 * Convertit un nom de zone en slug (ex: "Grand Abidjan" → "grand-abidjan")
 * @param zoneName Le nom de la zone
 * @returns Le slug de la zone
 */
export function zoneNameToSlug(zoneName: string): string {
    return zoneName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères non alphanumériques par des tirets
        .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
}

/**
 * Convertit un slug en nom de zone (ex: "grand-abidjan" → "Grand Abidjan")
 * @param slug Le slug de la zone
 * @param geoZones La liste des zones géographiques
 * @returns Le nom de la zone ou null si non trouvé
 */
export function slugToZoneName(slug: string, geoZones: GeoZone[]): string | null {
    const zone = geoZones.find(z => zoneNameToSlug(z.name) === slug);
    return zone?.name || null;
}

/**
 * Trouve une zone par son slug
 * @param slug Le slug de la zone
 * @param geoZones La liste des zones géographiques
 * @returns La zone trouvée ou null
 */
export function findZoneBySlug(slug: string, geoZones: GeoZone[]): GeoZone | null {
    return geoZones.find(z => zoneNameToSlug(z.name) === slug) || null;
}

/**
 * Récupère la liste des plans d'abonnement depuis l'API Directus
 */
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
        console.log('[DIRECTUS API] Fetching subscription plans from API');

        const response = await apiClient.get<DirectusResponse<SubscriptionPlan[]>>(
            DIRECTUS_DOMAIN,
            'items/subscription_plans',
            {
                cacheKey: 'subscription-plans-list',
                cacheTtl: 3600000, // 1 heure - les plans changent rarement
            }
        );

        console.log(`[DIRECTUS API] Fetched ${response.data.length} subscription plans`);

        return response.data;
    } catch (error) {
        console.error('[DIRECTUS API] Error fetching subscription plans:', error);

        // Retourner un tableau vide en cas d'erreur
        return [];
    }
}

/**
 * Récupère les données globales depuis l'API Directus
 */
export async function fetchGlobals(): Promise<Globals | null> {
    try {
        console.log('[DIRECTUS API] Fetching globals from API');

        const response = await apiClient.get<DirectusResponse<Globals>>(
            DIRECTUS_DOMAIN,
            'items/globals?fields=*.*',
            {
                cacheKey: 'globals-data',
                cacheTtl: 3600000, // 1 heure - les données globales changent rarement
            }
        );

        console.log('[DIRECTUS API] Fetched globals data');

        return response.data;
    } catch (error) {
        console.error('[DIRECTUS API] Error fetching globals:', error);

        // Retourner null en cas d'erreur
        return null;
    }
}

/**
 * Connexion utilisateur via l'API Directus
 * Utilise l'API route Next.js pour éviter les problèmes CORS
 */
export async function loginUser(email: string, password: string): Promise<{
    success: boolean;
    token?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
}> {
    try {
        console.log('[DIRECTUS API] Attempting login for:', email);

        // Appeler l'API route Next.js au lieu du proxy générique
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        // Gestion des erreurs HTTP
        if (!response.ok) {
            const errorData = await response.json();
            console.error('[DIRECTUS API] Login error:', errorData);

            let errorMessage = 'Une erreur est survenue lors de la connexion';

            // Gestion des erreurs Directus avec structure spécifique
            if (errorData.errors && Array.isArray(errorData.errors)) {
                const directusErrors = errorData.errors as DirectusError[];
                const firstError = directusErrors[0];

                if (firstError) {
                    // Gestion des codes d'erreur spécifiques
                    switch (firstError.extensions?.code) {
                        case 'INVALID_CREDENTIALS':
                            errorMessage = 'Email ou mot de passe incorrect';
                            break;
                        case 'INVALID_PAYLOAD':
                            errorMessage = 'Données de connexion invalides';
                            break;
                        case 'TOO_MANY_REQUESTS':
                            errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
                            break;
                        default:
                            errorMessage = firstError.message || 'Erreur de connexion';
                    }
                }
            } else if (response.status === 401) {
                errorMessage = 'Email ou mot de passe incorrect';
            } else if (response.status === 404) {
                errorMessage = 'Service de connexion indisponible';
            } else if (response.status === 429) {
                errorMessage = 'Trop de tentatives de connexion. Veuillez réessayer plus tard';
            }

            return {
                success: false,
                error: errorMessage,
            };
        }

        // Succès - parser la réponse
        const data: LoginResponse = await response.json();
        console.log('[DIRECTUS API] Login successful');

        // Calculer la date d'expiration
        const expiresAt = Date.now() + data.data.expires;

        return {
            success: true,
            token: data.data.access_token,
            refreshToken: data.data.refresh_token,
            expiresAt,
        };

    } catch (error: any) {
        console.error('[DIRECTUS API] Login error:', error);

        let errorMessage = 'Une erreur est survenue lors de la connexion';

        if (error.message?.includes('Failed to fetch')) {
            errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet';
        } else if (error.message?.includes('timeout')) {
            errorMessage = 'Délai d\'attente dépassé. Veuillez réessayer';
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Récupère les informations de l'utilisateur connecté
 */
export async function getCurrentUser(token?: string): Promise<User | null> {
    try {
        console.log('[DIRECTUS API] Fetching current user');

        // Si un token est fourni directement, l'utiliser (cas du login initial)
        // Sinon, utiliser createAuthenticatedFetch qui ira chercher dans localStorage
        let response: Response;

        if (token) {
            // Appel direct avec le token fourni (login initial)
            console.log('[DIRECTUS API] Using provided token');
            response = await fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } else {
            // Utiliser l'authentification depuis localStorage (refresh après connexion)
            console.log('[DIRECTUS API] Using token from localStorage');
            response = await createAuthenticatedFetch('/api/auth/profile', {
                method: 'GET',
            });
        }

        if (!response.ok) {
            console.error('[DIRECTUS API] Error fetching user:', response.status);
            return null;
        }

        const data = await response.json() as DirectusResponse<User>;

        console.log('[DIRECTUS API] Raw response structure:', JSON.stringify(data, null, 2));
        console.log('[DIRECTUS API] User data:', data.data);
        console.log('[DIRECTUS API] User first_name:', data.data?.first_name);
        console.log('[DIRECTUS API] User email:', data.data?.email);
        console.log('[DIRECTUS API] User account:', data.data?.account);
        console.log('[DIRECTUS API] User account_type:', data.data?.account?.account_type);

        return data.data;

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching current user:', error);
        return null;
    }
}

/**
 * Déconnexion utilisateur (supprime le token localement)
 */
export function logoutUser(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('token_expires_at');
        console.log('[DIRECTUS API] User logged out');
    }
}

/**
 * Récupère le profil complet de l'utilisateur connecté
 */
export async function getUserProfile(token: string): Promise<User | null> {
    try {
        console.log('[DIRECTUS API] Fetching user profile');

        const response = await createAuthenticatedFetch('/api/auth/profile', {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[DIRECTUS API] Profile fetch error:', errorData);
            return null;
        }

        const data = await response.json();
        console.log('[DIRECTUS API] Profile fetched successfully');
        return data.data;

    } catch (error) {
        console.error('[DIRECTUS API] Error fetching profile:', error);
        return null;
    }
}

/**
 * Met à jour le profil de l'utilisateur connecté
 */
export async function updateUserProfile(
    token: string,
    updates: Partial<User>
): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        console.log('[DIRECTUS API] Updating user profile');

        const response = await createAuthenticatedFetch('/api/auth/profile', {
            method: 'PATCH',
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[DIRECTUS API] Profile update error:', errorData);

            let errorMessage = 'Erreur lors de la mise à jour du profil';

            if (errorData.errors && Array.isArray(errorData.errors)) {
                const firstError = errorData.errors[0];
                errorMessage = firstError.message || errorMessage;
            } else if (response.status === 401) {
                errorMessage = 'Session expirée. Veuillez vous reconnecter';
            } else if (response.status === 400) {
                errorMessage = 'Données invalides';
            }

            return {
                success: false,
                error: errorMessage,
            };
        }

        const data = await response.json();
        console.log('[DIRECTUS API] Profile updated successfully');

        return {
            success: true,
            user: data.data,
        };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error updating profile:', error);
        return {
            success: false,
            error: 'Une erreur est survenue lors de la mise à jour',
        };
    }
}

/**
 * Inscription d'un nouvel utilisateur
 */
export async function registerUser(registerData: RegisterData): Promise<RegisterResponse> {
    try {
        console.log('[DIRECTUS API] Registering new user:', registerData.email);

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[DIRECTUS API] Registration error:', data);

            // Gestion spécifique de l'erreur email déjà utilisé
            if (response.status === 409 && data.error === 'Email déjà utilisé') {
                return {
                    success: false,
                    error: 'Cette adresse email est déjà utilisée. Veuillez en choisir une autre.',
                };
            }

            return {
                success: false,
                error: data.error || 'Erreur lors de l\'inscription',
            };
        }

        console.log('[DIRECTUS API] User registered successfully:', data.user.id);

        return {
            success: true,
            user: data.user,
        };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error registering user:', error);
        return {
            success: false,
            error: 'Une erreur est survenue lors de l\'inscription',
        };
    }
}

/**
 * Interface pour la création d'une annonce
 */
export interface CreateListingData {
    status: 'draft' | 'published';
    title: string;
    description?: string | null;
    price: number;
    contractType: 'leasing' | 'selling';
    surfaceArea: string;
    surfaceAreaUnit: string;
    rooms: number;
    bathrooms: number;
    kitchens: number;
    floors: number;
    town: string; // ID de la commune/département sélectionné
    location: string; // Géolocalisation ex: "place de la pigale avenu 12"
    agency: string;
    characteristics: Array<{ name: string; value: string }>;
    type: 'appartment' | 'villa' | 'land';
    images: Array<{ directus_files_id: string }>;
}

/**
 * Upload d'un fichier image vers Directus via l'API Next.js
 */
export async function uploadFile(accessToken: string, file: File): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
        console.log('[DIRECTUS API] Uploading file:', file.name);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload/file', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] File upload error:', errorData);
            return { success: false, error: 'Erreur lors de l\'upload du fichier' };
        }

        const data = await response.json();
        console.log('[DIRECTUS API] File uploaded successfully:', data.data.id);

        return { success: true, fileId: data.data.id };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error uploading file:', error);
        return {
            success: false,
            error: 'Une erreur est survenue lors de l\'upload',
        };
    }
}

/**
 * Création d'une annonce immobilière via l'API Next.js
 */
export async function createListing(accessToken: string, listingData: CreateListingData): Promise<{ success: boolean; listing?: any; error?: string }> {
    try {
        console.log('[DIRECTUS API] Creating listing:', listingData.title);

        const response = await fetch('/api/listings/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(listingData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Listing creation error:', errorData);
            return { success: false, error: 'Erreur lors de la création de l\'annonce' };
        }

        const data = await response.json() as any;
        console.log('[DIRECTUS API] Listing created successfully:', data.data[0].id);

        return { success: true, listing: data.data[0] };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error creating listing:', error);
        return {
            success: false,
            error: 'Une erreur est survenue lors de la création',
        };
    }
}

/**
 * Récupérer les annonces d'un utilisateur spécifique
 */
/**
 * Récupère une propriété de l'utilisateur par son ID (pour l'édition)
 */
export async function fetchUserPropertyById(propertyId: string): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
        console.log('[DIRECTUS API] Fetching property by ID:', propertyId);

        const response = await createAuthenticatedFetch(`/api/properties/${propertyId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error fetching property:', errorData);
            return {
                success: false,
                error: errorData.error || `Erreur ${response.status}: Impossible de récupérer l'annonce`,
            };
        }

        const data = await response.json() as DirectusResponse<Property>;
        console.log('[DIRECTUS API] Property fetched successfully:', data.data?.id);

        return {
            success: true,
            property: data.data,
        };
    } catch (error) {
        console.error('[DIRECTUS API] Error fetching property:', error);
        return {
            success: false,
            error: 'Erreur réseau lors de la récupération de l\'annonce',
        };
    }
}

/**
 * Met à jour une propriété existante
 */
export async function updateProperty(
    propertyId: string,
    propertyData: Partial<Property>
): Promise<{ success: boolean; property?: Property; error?: string }> {
    try {
        console.log('[DIRECTUS API] Updating property:', propertyId);

        const response = await createAuthenticatedFetch(`/api/properties/${propertyId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(propertyData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error updating property:', errorData);
            return {
                success: false,
                error: errorData.error || `Erreur ${response.status}: Impossible de mettre à jour l'annonce`,
            };
        }

        const data = await response.json() as DirectusResponse<Property>;
        console.log('[DIRECTUS API] Property updated successfully:', data.data?.id);

        return {
            success: true,
            property: data.data,
        };
    } catch (error) {
        console.error('[DIRECTUS API] Error updating property:', error);
        return {
            success: false,
            error: 'Erreur réseau lors de la mise à jour de l\'annonce',
        };
    }
}

/**
 * Supprimer une propriété
 */
export async function deleteProperty(
    propertyId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[DIRECTUS API] Deleting property:', propertyId);

        const response = await createAuthenticatedFetch(`/api/properties/${propertyId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error deleting property:', errorData);
            return { success: false, error: 'Impossible de supprimer l\'annonce' };
        }

        console.log('[DIRECTUS API] Property deleted successfully');

        return { success: true };
    } catch (error: any) {
        console.error('[DIRECTUS API] Error deleting property:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

export async function fetchUserProperties(accessToken: string, userId: string): Promise<{ success: boolean; properties?: Property[]; error?: string }> {
    try {
        console.log('[DIRECTUS API] Fetching properties for user:', userId);

        const response = await createAuthenticatedFetch(`/api/user/properties?userId=${userId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error fetching user properties:', errorData);
            return { success: false, error: 'Impossible de récupérer vos annonces' };
        }

        const data = await response.json() as any;
        const properties = data.data || [];

        console.log('[DIRECTUS API] Found', properties.length, 'properties');

        return { success: true, properties };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Devenir annonceur
 */
export async function becomeAdvertiser(
    accessToken: string,
    userId: string,
    accountId: string
): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
        console.log('[DIRECTUS API] Becoming advertiser for user:', userId);

        const response = await createAuthenticatedFetch('/api/user/become-advertiser', {
            method: 'PATCH',
            body: JSON.stringify({
                userId,
                accountId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error becoming advertiser:', errorData);
            return { success: false, error: 'Impossible de devenir annonceur' };
        }

        const data = await response.json() as any;
        console.log('[DIRECTUS API] User upgraded to advertiser successfully');

        return { success: true, user: data.data };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error becoming advertiser:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}


/**
 * Basculer le statut d'une annonce
 */
export async function togglePropertyStatus(
    accessToken: string,
    propertyId: string,
    newStatus: 'published' | 'draft'
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[DIRECTUS API] Toggling property status:', propertyId, 'to', newStatus);

        const response = await createAuthenticatedFetch(`/api/listings/${propertyId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: newStatus
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error toggling property status:', errorData);
            return { success: false, error: 'Impossible de modifier le statut' };
        }

        console.log('[DIRECTUS API] Property status updated successfully');

        return { success: true };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error toggling property status:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

// ==================== AGENCES ====================

/**
 * Créer une agence immobilière
 */
export async function createAgency(
    accessToken: string,
    data: CreateAgencyData
): Promise<{ success: boolean; agency?: Agency; error?: string }> {
    try {
        console.log('[DIRECTUS API] Creating agency:', data.title);

        const response = await fetch('/api/agencies/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                accessToken,
                ...data
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error creating agency:', errorData);
            return { success: false, error: 'Impossible de créer l\'agence' };
        }

        const result = await response.json();
        console.log('[DIRECTUS API] Agency created successfully');

        return { success: true, agency: result.data };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error creating agency:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Récupérer la liste des agences
 */
export async function fetchAgencies(
    accessToken: string
): Promise<{ success: boolean; agencies?: Agency[]; error?: string }> {
    try {
        console.log('[DIRECTUS API] Fetching agencies list');

        const response = await createAuthenticatedFetch('/api/agencies/list', {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error fetching agencies:', errorData);
            return { success: false, error: 'Impossible de récupérer les agences' };
        }

        const result = await response.json();
        console.log('[DIRECTUS API] Agencies fetched successfully:', result.data?.length || 0);

        return { success: true, agencies: result.data || [] };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error fetching agencies:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Récupérer une agence par ID
 */
export async function fetchAgencyById(
    accessToken: string,
    agencyId: string
): Promise<{ success: boolean; agency?: Agency; error?: string }> {
    try {
        console.log('[DIRECTUS API] Fetching agency:', agencyId);

        const response = await createAuthenticatedFetch(`/api/agencies/${agencyId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error fetching agency:', errorData);
            return { success: false, error: 'Impossible de récupérer l\'agence' };
        }

        const result = await response.json();
        console.log('[DIRECTUS API] Agency fetched successfully');

        return { success: true, agency: result.data };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error fetching agency:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Mettre à jour une agence
 */
export async function updateAgency(
    agencyId: string,
    agencyData: any
): Promise<{ success: boolean; agency?: Agency; error?: string }> {
    try {
        console.log('[DIRECTUS API] Updating agency:', agencyId);

        const response = await createAuthenticatedFetch(`/api/agencies/${agencyId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(agencyData),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error updating agency:', errorData);
            return { success: false, error: errorData.error || 'Impossible de mettre à jour l\'agence' };
        }

        const data = await response.json();
        console.log('[DIRECTUS API] Agency updated successfully');

        return { success: true, agency: data.data };
    } catch (error) {
        console.error('[DIRECTUS API] Exception updating agency:', error);
        return { success: false, error: 'Erreur réseau' };
    }
}

export async function deleteAgency(
    accessToken: string,
    agencyId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[DIRECTUS API] Deleting agency:', agencyId);

        const response = await createAuthenticatedFetch(`/api/agencies/${agencyId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error deleting agency:', errorData);
            return { success: false, error: 'Impossible de supprimer l\'agence' };
        }

        console.log('[DIRECTUS API] Agency deleted successfully');

        return { success: true };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error deleting agency:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Rattacher un utilisateur à une agence
 */
export async function attachUserToAgency(
    accessToken: string,
    agencyId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[DIRECTUS API] Attaching user to agency:', agencyId);

        const response = await createAuthenticatedFetch('/api/user/attach-agency', {
            method: 'PATCH',
            body: JSON.stringify({
                agencyId
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[DIRECTUS API] Error attaching to agency:', errorData);
            return { success: false, error: 'Impossible de se rattacher à l\'agence' };
        }

        console.log('[DIRECTUS API] User attached to agency successfully');

        return { success: true };

    } catch (error: any) {
        console.error('[DIRECTUS API] Error attaching to agency:', error);
        return {
            success: false,
            error: 'Une erreur est survenue',
        };
    }
}

/**
 * Rattacher une agence à un utilisateur (PATCH /users/:id)
 */
export async function attachAgencyToUser(userId: string, agencyId: string, accessToken: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await createAuthenticatedFetch(`/api/users/${userId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                account: {
                    agency: agencyId
                }
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.errors?.[0]?.message || 'Erreur lors du rattachement' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erreur réseau' };
    }
}
