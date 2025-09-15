import type { NextApiRequest, NextApiResponse } from 'next';

// Configuration des domaines autorisés pour les requêtes externes
const ALLOWED_DOMAINS = [
    'api.openweathermap.org',
    'nominatim.openstreetmap.org',
    'jsonplaceholder.typicode.com',
    // Ajouter d'autres domaines selon les besoins
];

// Cache en mémoire pour les réponses (à remplacer par Redis en production)
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

// Fonction pour nettoyer le cache
function cleanCache() {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now > value.timestamp + value.ttl) {
            cache.delete(key);
        }
    }
}

// Nettoyer le cache toutes les 5 minutes
setInterval(cleanCache, 5 * 60 * 1000);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        // Extraction du path et des paramètres
        const { path } = req.query;
        const pathArray = Array.isArray(path) ? path : [path];
        const targetPath = pathArray.join('/');

        // Validation des headers requis
        const targetDomain = req.headers['x-target-domain'] as string;
        const cacheKey = req.headers['x-cache-key'] as string;
        const cacheTtl = parseInt(req.headers['x-cache-ttl'] as string) || 60000; // 1 minute par défaut

        if (!targetDomain) {
            return res.status(400).json({
                error: 'Missing x-target-domain header',
                message: 'Le domaine cible doit être spécifié dans les headers'
            });
        }

        // Vérification de sécurité - domaine autorisé
        if (!ALLOWED_DOMAINS.includes(targetDomain)) {
            console.warn(`[SECURITY] Tentative d'accès à un domaine non autorisé: ${targetDomain}`);
            return res.status(403).json({
                error: 'Forbidden domain',
                message: 'Ce domaine n\'est pas autorisé pour les requêtes proxy'
            });
        }

        // Construction de l'URL cible
        const protocol = req.headers['x-target-protocol'] || 'https';
        const queryString = new URLSearchParams(req.query as Record<string, string>);
        queryString.delete('path'); // Retirer le paramètre path qui est interne

        const targetUrl = `${protocol}://${targetDomain}/${targetPath}${queryString.toString() ? `?${queryString.toString()}` : ''
            }`;

        // Vérification du cache si une clé est fournie
        if (cacheKey && cache.has(cacheKey)) {
            const cached = cache.get(cacheKey)!;
            if (Date.now() < cached.timestamp + cached.ttl) {
                console.log(`[CACHE HIT] ${cacheKey} -> ${targetUrl}`);

                // Headers pour indiquer que la réponse vient du cache
                res.setHeader('X-Cache-Status', 'HIT');
                res.setHeader('X-Cache-Key', cacheKey);

                return res.status(200).json(cached.data);
            } else {
                // Cache expiré, on le supprime
                cache.delete(cacheKey);
            }
        }

        console.log(`[PROXY] ${req.method} ${targetUrl}`);

        // Configuration de la requête
        const fetchOptions: RequestInit = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Kylimmo-Proxy/1.0',
                // Transférer certains headers de la requête originale
                ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
                ...(req.headers['accept-language'] && { 'Accept-Language': req.headers['accept-language'] }),
            },
        };

        // Ajouter le body pour les requêtes POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // Effectuer la requête avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

        try {
            const response = await fetch(targetUrl, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.error(`[PROXY ERROR] ${response.status} ${response.statusText} for ${targetUrl}`);
                return res.status(response.status).json({
                    error: 'External API error',
                    message: `Erreur de l'API externe: ${response.status} ${response.statusText}`,
                    targetUrl: targetUrl.replace(/api_key=[^&]+/g, 'api_key=***'), // Masquer les clés API dans les logs
                });
            }

            const data = await response.json();

            // Mettre en cache si une clé est fournie
            if (cacheKey && req.method === 'GET') {
                cache.set(cacheKey, {
                    data,
                    timestamp: Date.now(),
                    ttl: cacheTtl,
                });
                console.log(`[CACHE SET] ${cacheKey} (TTL: ${cacheTtl}ms)`);
            }

            // Headers pour indiquer le statut du cache
            res.setHeader('X-Cache-Status', cacheKey ? 'MISS' : 'BYPASS');
            if (cacheKey) {
                res.setHeader('X-Cache-Key', cacheKey);
            }

            // Headers de performance
            const requestStartTime = (req as { startTime?: number }).startTime || Date.now();
            res.setHeader('X-Response-Time', Date.now() - requestStartTime);

            // Headers CORS si nécessaire
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-Domain, X-Cache-Key, X-Cache-TTL');

            return res.status(200).json(data);

        } catch (fetchError) {
            clearTimeout(timeoutId);

            if (fetchError instanceof Error && fetchError.name === 'AbortError') {
                console.error(`[PROXY TIMEOUT] ${targetUrl}`);
                return res.status(408).json({
                    error: 'Request timeout',
                    message: 'La requête a expiré (30s timeout)',
                    targetUrl: targetUrl.replace(/api_key=[^&]+/g, 'api_key=***'),
                });
            }

            throw fetchError;
        }

    } catch (error) {
        console.error('[PROXY ERROR]', error);

        return res.status(500).json({
            error: 'Internal proxy error',
            message: 'Erreur interne du serveur proxy',
            details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined,
        });
    }
}

// Middleware pour mesurer le temps de réponse
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '1mb',
        },
    },
};
