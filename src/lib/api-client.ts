// Client API sécurisé qui passe par notre serveur proxy
import { handleUnauthorized } from './auth-helpers';

/**
 * Récupère le token d'authentification approprié selon l'état de connexion
 */
function getAuthToken(): string | null {
    // Vérifier si on est côté client
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_DEFAULT_TOKEN || null;
    }

    // Essayer de récupérer l'access_token du localStorage
    try {
        const authData = localStorage.getItem('kylimmo_auth_data');
        if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.access_token) {
                return parsed.access_token;
            }
        }
    } catch (error) {
        console.warn('[AUTH] Error reading auth token:', error);
    }

    // Fallback sur le DEFAULT_TOKEN
    return process.env.NEXT_PUBLIC_DEFAULT_TOKEN || null;
}

interface ProxyRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: unknown;
    cache?: {
        key: string;
        ttl?: number; // TTL en millisecondes
    };
    timeout?: number;
}

interface ProxyResponse<T = unknown> {
    data: T;
    cached: boolean;
    cacheKey?: string;
    responseTime?: number;
}

class SecureApiClient {
    private baseUrl: string;

    constructor() {
        // En production, utiliser l'URL complète du site
        this.baseUrl = process.env.NODE_ENV === 'production'
            ? process.env.NEXT_PUBLIC_SITE_URL || ''
            : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100';

        if (process.env.NODE_ENV === 'development') {
            console.log('[API CLIENT] Base URL:', this.baseUrl);
        }
    }

    /**
     * Effectue une requête sécurisée via notre proxy serveur
     * Toutes les requêtes externes passent par notre serveur pour éviter l'exposition des clés API
     */
    async secureRequest<T = unknown>(
        targetDomain: string,
        path: string,
        options: ProxyRequestOptions = {}
    ): Promise<ProxyResponse<T>> {
        const {
            method = 'GET',
            headers = {},
            body,
            cache,
            timeout = 30000,
        } = options;

        // Construction de l'URL du proxy
        const proxyUrl = `${this.baseUrl}/api/proxy/${path}`;

        // Log de debugging pour tracer l'URL du proxy (peut être supprimé en production)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API CLIENT DEBUG] Proxy URL: ${proxyUrl}`);
        }

        // Récupérer le token d'authentification approprié
        const authToken = getAuthToken();

        // Headers requis pour le proxy
        const proxyHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Target-Domain': targetDomain,
            'X-Target-Protocol': 'https',
            ...headers,
        };

        // Ajouter le token d'authentification si disponible
        if (authToken) {
            proxyHeaders['Authorization'] = `Bearer ${authToken}`;
        }

        // Ajout des headers de cache si spécifiés
        if (cache) {
            proxyHeaders['X-Cache-Key'] = cache.key;
            if (cache.ttl) {
                proxyHeaders['X-Cache-TTL'] = cache.ttl.toString();
            }
        }

        const startTime = Date.now();

        // Logs de debug (peut être supprimé en production)
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API CLIENT] Calling: ${method} ${targetDomain}/${path}`);
        }

        try {
            // Configuration de la requête
            const fetchOptions: RequestInit = {
                method,
                headers: proxyHeaders,
            };

            // Ajouter le body pour les requêtes non-GET
            if (method !== 'GET' && body) {
                fetchOptions.body = JSON.stringify(body);
            }

            // Timeout controller
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                const response = await fetch(proxyUrl, {
                    ...fetchOptions,
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                // ✅ Intercepter les erreurs 401 (Non autorisé)
                if (response.status === 401) {
                    console.log('[API CLIENT] 401 Unauthorized - Déconnexion automatique');
                    handleUnauthorized();
                    throw new Error('Unauthorized');
                }

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const error = new Error(
                        errorData.message ||
                        `Erreur HTTP ${response.status}: ${response.statusText}`
                    );
                    // Préserver les informations HTTP pour la gestion d'erreur
                    (error as any).status = response.status;
                    (error as any).data = errorData;
                    throw error;
                }

                const data = await response.json();
                const responseTime = Date.now() - startTime;

                // Informations sur le cache depuis les headers de réponse
                const cacheStatus = response.headers.get('X-Cache-Status');
                const cacheKey = response.headers.get('X-Cache-Key');

                return {
                    data,
                    cached: cacheStatus === 'HIT',
                    cacheKey: cacheKey || undefined,
                    responseTime,
                };

            } catch (fetchError) {
                clearTimeout(timeoutId);

                if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                    throw new Error(`Timeout: La requête vers ${targetDomain} a expiré après ${timeout}ms`);
                }

                // Améliorer le message pour les erreurs réseau
                if (fetchError instanceof TypeError) {
                    throw new Error(`Erreur réseau: Impossible de contacter ${targetDomain}`);
                }

                throw fetchError;
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            console.error(`[API CLIENT ERROR] ${method} ${targetDomain}/${path}:`, errorMessage);

            // Préserver les erreurs HTTP avec statut (401, 404, etc.)
            if (error instanceof Error && (error as any).status) {
                throw error; // Laisser passer les erreurs HTTP avec statut
            }

            // Re-throw avec plus de contexte pour les autres erreurs
            throw new Error(`Erreur API (${targetDomain}): ${errorMessage}`);
        }
    }

    /**
     * Méthode GET simplifiée avec cache automatique
     */
    async get<T = unknown>(
        targetDomain: string,
        path: string,
        options: Omit<ProxyRequestOptions, 'method'> & {
            cacheKey?: string;
            cacheTtl?: number;
        } = {}
    ): Promise<T> {
        const { cacheKey, cacheTtl, ...requestOptions } = options;

        const response = await this.secureRequest<T>(targetDomain, path, {
            ...requestOptions,
            method: 'GET',
            cache: cacheKey ? { key: cacheKey, ttl: cacheTtl } : undefined,
        });

        return response.data;
    }

    /**
     * Méthode POST simplifiée
     */
    async post<T = unknown>(
        targetDomain: string,
        path: string,
        body: unknown,
        options: Omit<ProxyRequestOptions, 'method' | 'body'> = {}
    ): Promise<T> {
        const response = await this.secureRequest<T>(targetDomain, path, {
            ...options,
            method: 'POST',
            body,
        });

        return response.data;
    }

    /**
     * Méthode PUT simplifiée
     */
    async put<T = unknown>(
        targetDomain: string,
        path: string,
        body: unknown,
        options: Omit<ProxyRequestOptions, 'method' | 'body'> = {}
    ): Promise<T> {
        const response = await this.secureRequest<T>(targetDomain, path, {
            ...options,
            method: 'PUT',
            body,
        });

        return response.data;
    }

    /**
     * Méthode DELETE simplifiée
     */
    async delete<T = unknown>(
        targetDomain: string,
        path: string,
        options: Omit<ProxyRequestOptions, 'method'> = {}
    ): Promise<T> {
        const response = await this.secureRequest<T>(targetDomain, path, {
            ...options,
            method: 'DELETE',
        });

        return response.data;
    }

    /**
     * Invalider le cache pour une clé donnée
     */
    async invalidateCache(cacheKey: string): Promise<void> {
        try {
            await fetch(`${this.baseUrl}/api/cache/invalidate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cacheKey }),
            });
        } catch (error) {
            console.warn('Impossible d\'invalider le cache:', error);
        }
    }

    /**
     * Vérifier le statut de santé du proxy
     */
    async healthCheck(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/proxy/health`, {
                method: 'GET',
                headers: {
                    'X-Target-Domain': 'httpbin.org',
                },
            });

            return response.ok;
        } catch {
            return false;
        }
    }
}

// Instance singleton du client API
export const apiClient = new SecureApiClient();

// Hook React pour utiliser le client API avec React Query
export function useSecureApi() {
    return {
        get: apiClient.get.bind(apiClient),
        post: apiClient.post.bind(apiClient),
        put: apiClient.put.bind(apiClient),
        delete: apiClient.delete.bind(apiClient),
        invalidateCache: apiClient.invalidateCache.bind(apiClient),
        healthCheck: apiClient.healthCheck.bind(apiClient),
    };
}

// Types pour TypeScript
export type { ProxyRequestOptions, ProxyResponse };
