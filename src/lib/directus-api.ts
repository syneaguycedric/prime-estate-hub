import { apiClient } from '@/lib/api-client';
import { Property, PropertyImage } from '@/data/properties';
import { properties } from '@/data/properties';
import { formatProperty } from '@/lib/property-helpers';
import { toast } from '@/lib/toast-helpers';

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
    bathrooms?: number;           // Nombre de salles de bain
    page?: number;                // Numéro de page (défaut: 1)
    limit?: number;               // Éléments par page (défaut: 12)
}

// Interface pour la réponse paginée
export interface PaginatedResponse {
    properties: Property[];
    total: number;
    page: number;
    totalPages: number;
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
            'items/real_estates?fields=*,images.directus_files_id.*',
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
        filtered = filtered.filter(p => p.price >= minPrice);
    }

    if (maxPrice !== undefined) {
        filtered = filtered.filter(p => p.price <= maxPrice);
    }

    if (minSurface !== undefined) {
        filtered = filtered.filter(p => p.surfaceArea >= minSurface);
    }

    if (maxSurface !== undefined) {
        filtered = filtered.filter(p => p.surfaceArea <= maxSurface);
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

        // Recherche globale (OR sur plusieurs champs)
        if (search) {
            directusFilters['_or'] = [
                { title: { _contains: search } },
                { description: { _contains: search } },
                { location: { _contains: search } }
            ];
        }

        // Filtres spécifiques
        if (location) {
            directusFilters['location'] = { _contains: location };
        }

        if (contractType) {
            directusFilters['contractType'] = { _eq: contractType };
        }

        if (propertyType) {
            directusFilters['type'] = { _eq: propertyType };
        }

        // Filtres de prix (range)
        if (minPrice !== undefined || maxPrice !== undefined) {
            directusFilters['price'] = {};
            if (minPrice !== undefined) {
                directusFilters['price']['_gte'] = minPrice;
            }
            if (maxPrice !== undefined) {
                directusFilters['price']['_lte'] = maxPrice;
            }
        }

        // Filtres de surface (range)
        if (minSurface !== undefined || maxSurface !== undefined) {
            directusFilters['surfaceArea'] = {};
            if (minSurface !== undefined) {
                directusFilters['surfaceArea']['_gte'] = minSurface;
            }
            if (maxSurface !== undefined) {
                directusFilters['surfaceArea']['_lte'] = maxSurface;
            }
        }

        if (rooms !== undefined) {
            directusFilters['rooms'] = { _eq: rooms };
        }

        if (bathrooms !== undefined) {
            directusFilters['bathrooms'] = { _eq: bathrooms };
        }

        // Construire l'URL avec paramètres
        const offset = (page - 1) * limit;
        const params: Record<string, string> = {
            fields: '*,images.directus_files_id.*',
            limit: limit.toString(),
            offset: offset.toString(),
            meta: 'filter_count'
        };

        // Ajouter les filtres seulement s'il y en a
        if (Object.keys(directusFilters).length > 0) {
            params['filter'] = JSON.stringify(directusFilters);
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
            `items/real_estates/${id}?fields=*,images.directus_files_id.*`,
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
    const assetsUrl = process.env.NEXT_PUBLIC_DIRECTUS_ASSETS_URL || 'https://ki-backoffice.eyoboue.dev:8143/assets';

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
export async function getCurrentUser(token: string): Promise<User | null> {
    try {
        console.log('[DIRECTUS API] Fetching current user');

        const response = await apiClient.get<DirectusResponse<User>>(
            DIRECTUS_DOMAIN,
            'users/me',
            {
                cacheKey: undefined,
                cacheTtl: 0,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return response.data;

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

        const response = await fetch('/api/auth/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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

        const response = await fetch('/api/auth/profile', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
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
