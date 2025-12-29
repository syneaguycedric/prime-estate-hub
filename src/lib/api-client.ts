// Client API sécurisé qui passe par notre serveur proxy
import { handleUnauthorized } from './auth-helpers';

/**
 * Récupère le token d'authentification approprié selon l'état de connexion
 * - Si l'utilisateur est connecté (token dans localStorage), retourne le token utilisateur
 * - Sinon, retourne le token par défaut (uniquement quand on n'est pas connecté)
 */
function getAuthToken(): string | null {
    // Vérifier si on est côté serveur
    if (typeof window === 'undefined') {
        // Côté serveur, utiliser le token par défaut
        const token = process.env.NEXT_PUBLIC_DEFAULT_TOKEN || null;
        return token;
    }

    // Côté client : essayer de récupérer l'access_token du localStorage
    // Si un token existe, l'utilisateur est connecté, donc on l'utilise
    try {
        const authData = localStorage.getItem('kylimmo_auth_data');
        if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.access_token) {
                // Utilisateur connecté : utiliser son token
                const token = parsed.access_token;
                return token;
            }
        }
    } catch (error) {
        console.warn('[AUTH] Error reading auth token:', error);
    }

    // Utilisateur non connecté : utiliser le token par défaut
    const defaultToken = process.env.NEXT_PUBLIC_DEFAULT_TOKEN || null;
    return defaultToken;
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
        // Côté client, utiliser window.location.origin pour avoir l'URL correcte
        if (typeof window !== 'undefined') {
            // Côté client : utiliser l'URL actuelle de la page
            this.baseUrl = window.location.origin;
        } else {
            // Côté serveur : utiliser la variable d'environnement ou localhost par défaut
            this.baseUrl = process.env.NODE_ENV === 'production'
                ? process.env.NEXT_PUBLIC_SITE_URL || ''
                : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100';
        }

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
                    // Récupérer les données d'erreur pour vérifier si on doit utiliser le token par défaut
                    let errorData: any;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = {};
                    }

                    // Si la réponse indique qu'il faut utiliser le token par défaut et rediriger vers login
                    if (errorData.requiresLogin && errorData.useDefaultToken) {
                        console.log('[API CLIENT] 401 Unauthorized - Token invalide, suppression du token et utilisation du token par défaut');

                        // Supprimer le token invalide du localStorage
                        try {
                            localStorage.removeItem('kylimmo_auth_data');
                            console.log('[API CLIENT] Invalid token removed from localStorage');
                        } catch (e) {
                            console.warn('[API CLIENT] Error removing token from localStorage:', e);
                        }

                        // Retenter la requête avec le token par défaut
                        const defaultToken = process.env.NEXT_PUBLIC_DEFAULT_TOKEN;
                        if (defaultToken) {
                            console.log('[API CLIENT] Retrying request with default token');
                            const newProxyHeaders = {
                                ...proxyHeaders,
                                'Authorization': `Bearer ${defaultToken}`,
                            };

                            const retryResponse = await fetch(proxyUrl, {
                                ...fetchOptions,
                                headers: newProxyHeaders,
                                signal: controller.signal,
                            });

                            clearTimeout(timeoutId);

                            if (!retryResponse.ok) {
                                const retryErrorData = await retryResponse.json().catch(() => ({}));
                                const error = new Error(
                                    retryErrorData.message ||
                                    `Erreur HTTP ${retryResponse.status}: ${retryResponse.statusText}`
                                );
                                (error as any).status = retryResponse.status;
                                (error as any).data = retryErrorData;
                                
                                // Utiliser handleUnauthorized() pour afficher le toast et rediriger
                                if (typeof window !== 'undefined') {
                                    handleUnauthorized({ reason: 'invalid_token' });
                                }
                                
                                throw error;
                            }

                            const data = await retryResponse.json();
                            const responseTime = Date.now() - startTime;

                            // Rediriger vers login de manière asynchrone après avoir retourné la réponse
                            // Utiliser handleUnauthorized() pour afficher le toast et rediriger
                            if (typeof window !== 'undefined') {
                                setTimeout(() => {
                                    handleUnauthorized({ reason: 'invalid_token' });
                                }, 100);
                            }

                            return {
                                data,
                                cached: false,
                                responseTime,
                            };
                        } else {
                            console.error('[API CLIENT] No default token available');
                            // Utiliser handleUnauthorized() pour afficher le toast et rediriger
                            if (typeof window !== 'undefined') {
                                handleUnauthorized({ reason: 'no_token' });
                            }
                            throw new Error('Unauthorized - No default token available');
                        }
                    }

                    // Sinon, tenter le refresh token comme avant
                    console.log('[API CLIENT] 401 Unauthorized - Tentative de refresh token');

                    // Tenter le refresh token avant de déconnecter
                    try {
                        const authData = JSON.parse(localStorage.getItem('kylimmo_auth_data') || '{}');
                        if (authData.refresh_token) {
                            const refreshResponse = await fetch('/api/auth/refresh', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    refresh_token: authData.refresh_token,
                                }),
                            });

                            if (refreshResponse.ok) {
                                const refreshData = await refreshResponse.json();
                                console.log('[API CLIENT] Token refreshed successfully, retrying request');

                                // Mettre à jour localStorage
                                const newAuthData = {
                                    access_token: refreshData.data.access_token,
                                    refresh_token: refreshData.data.refresh_token,
                                    expires: refreshData.data.expires,
                                    expiresAt: Date.now() + refreshData.data.expires,
                                };
                                localStorage.setItem('kylimmo_auth_data', JSON.stringify(newAuthData));

                                // Retenter la requête originale avec le nouveau token
                                const newProxyHeaders = {
                                    ...proxyHeaders,
                                    'Authorization': `Bearer ${newAuthData.access_token}`,
                                };

                                const retryResponse = await fetch(proxyUrl, {
                                    ...fetchOptions,
                                    headers: newProxyHeaders,
                                    signal: controller.signal,
                                });

                                clearTimeout(timeoutId);

                                // Traiter la réponse de retry comme une réponse normale
                                if (!retryResponse.ok) {
                                    const retryErrorData = await retryResponse.json().catch(() => ({}));
                                    const error = new Error(
                                        retryErrorData.message ||
                                        `Erreur HTTP ${retryResponse.status}: ${retryResponse.statusText}`
                                    );
                                    (error as any).status = retryResponse.status;
                                    (error as any).data = retryErrorData;
                                    throw error;
                                }

                                const data = await retryResponse.json();
                                const responseTime = Date.now() - startTime;

                                return {
                                    data,
                                    cached: false,
                                    responseTime,
                                };
                            } else {
                                console.log('[API CLIENT] Refresh failed, logging out');
                                handleUnauthorized({ reason: 'refresh_failed' });
                                throw new Error('Unauthorized');
                            }
                        } else {
                            console.log('[API CLIENT] No refresh token available');
                            handleUnauthorized({ reason: 'no_token' });
                            throw new Error('Unauthorized');
                        }
                    } catch (refreshError) {
                        console.error('[API CLIENT] Error during refresh:', refreshError);
                        handleUnauthorized({ reason: 'refresh_failed' });
                        throw new Error('Unauthorized');
                    }
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
