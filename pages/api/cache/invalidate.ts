import type { NextApiRequest, NextApiResponse } from 'next';

// Cette API sera étendue pour utiliser Redis en production
// Pour l'instant, on simule l'invalidation du cache

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            error: 'Method not allowed',
            message: 'Seule la méthode POST est autorisée'
        });
    }

    try {
        const { cacheKey } = req.body;

        if (!cacheKey || typeof cacheKey !== 'string') {
            return res.status(400).json({
                error: 'Invalid cache key',
                message: 'La clé de cache doit être une chaîne de caractères valide'
            });
        }

        // TODO: Implémenter l'invalidation Redis en production
        // await redis.del(cacheKey);

        console.log(`[CACHE INVALIDATE] ${cacheKey}`);

        return res.status(200).json({
            success: true,
            message: `Cache invalidé pour la clé: ${cacheKey}`,
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error('[CACHE INVALIDATE ERROR]', error);

        return res.status(500).json({
            error: 'Internal server error',
            message: 'Erreur lors de l\'invalidation du cache'
        });
    }
}
