// Client API sécurisé qui passe par notre serveur proxy

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
            : '';
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

        // Headers requis pour le proxy
        const proxyHeaders: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-Target-Domain': targetDomain,
            'X-Target-Protocol': 'https',
            ...headers,
        };

        // Ajout des headers de cache si spécifiés
        if (cache) {
            proxyHeaders['X-Cache-Key'] = cache.key;
            if (cache.ttl) {
                proxyHeaders['X-Cache-TTL'] = cache.ttl.toString();
            }
        }

        const startTime = Date.now();

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

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message ||
                        `Erreur HTTP ${response.status}: ${response.statusText}`
                    );
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
                    throw new Error(`Timeout: La requête vers ${targetDomain} a expiré`);
                }

                throw fetchError;
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            console.error(`[API CLIENT ERROR] ${method} ${targetDomain}/${path}:`, errorMessage);

            // Re-throw avec plus de contexte
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
