import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token required' });
    }

    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || 'https://ki-backoffice.eyoboue.dev:8143';

    try {
        console.log('[REFRESH API] Refreshing token...');

        const response = await fetch(`${directusUrl}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                refresh_token,
                mode: 'json',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[REFRESH API] Error:', response.status, errorData);
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        console.log('[REFRESH API] Token refreshed successfully');
        return res.status(200).json(data);

    } catch (error) {
        console.error('[REFRESH API] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Erreur lors du rafraîchissement du token',
        });
    }
}
