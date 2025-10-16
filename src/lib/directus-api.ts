import { apiClient } from '@/lib/api-client';
import { Property, PropertyImage } from '@/data/properties';
import { properties } from '@/data/properties';
import { formatProperty } from '@/lib/property-helpers';
import { toast } from 'sonner';

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

// Configuration
const DIRECTUS_DOMAIN = 'ki-backoffice.eyoboue.dev:8143';
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

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
            description: 'Impossible de charger les biens immobiliers. Utilisation des données de démonstration.',
            duration: 5000,
        });

        // En cas d'erreur, fallback vers les données mockées
        console.log('[DIRECTUS API] Falling back to mock data');
        return properties.map(formatProperty);
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
            description: 'Impossible de charger les détails du bien. Utilisation des données de démonstration.',
            duration: 5000,
        });

        // En cas d'erreur, fallback vers les données mockées
        console.log(`[DIRECTUS API] Falling back to mock data for property ${id}`);
        const property = properties.find(p => p.id === id);
        return property ? formatProperty(property) : null;
    }
}

/**
 * Récupère les biens immobiliers avec des filtres
 */
export async function fetchPropertiesWithFilters(filters: {
    type?: string;
    contractType?: string;
    minPrice?: number;
    maxPrice?: number;
    minRooms?: number;
    maxRooms?: number;
    search?: string;
}): Promise<Property[]> {
    const allProperties = await fetchProperties();

    let filteredProperties = allProperties;

    // Appliquer les filtres
    if (filters.type && filters.type !== 'all') {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
    }

    if (filters.contractType && filters.contractType !== 'all') {
        filteredProperties = filteredProperties.filter(p => p.contractType === filters.contractType);
    }

    if (filters.minPrice !== undefined) {
        filteredProperties = filteredProperties.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
        filteredProperties = filteredProperties.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }

    if (filters.minRooms !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.rooms >= filters.minRooms!);
    }

    if (filters.maxRooms !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.rooms <= filters.maxRooms!);
    }

    if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.toLowerCase();
        filteredProperties = filteredProperties.filter(p =>
            p.title.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm)) ||
            (p.location && p.location.toLowerCase().includes(searchTerm))
        );
    }

    return filteredProperties;
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
