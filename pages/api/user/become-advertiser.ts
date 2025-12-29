import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Utiliser le token des headers (qui sera mis à jour après refresh)
        // avec fallback sur le body pour rétrocompatibilité
        const authHeader = req.headers.authorization;
        let accessToken: string | null = null;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.substring(7);
        } else {
            // Fallback sur le body pour rétrocompatibilité
            const { accessToken: bodyToken } = req.body;
            accessToken = bodyToken;
        }

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            console.error('[BECOME ADVERTISER API] Missing DIRECTUS_URL environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[BECOME ADVERTISER API] Switching user role to advertiser...');
        console.log('[BECOME ADVERTISER API] Using access token:', accessToken.substring(0, 20) + '...');

        // Appeler directement la nouvelle API switch-role
        const response = await fetch(`${directusUrl}/extended-services-api/auth/switch-role?fields=*.*`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[BECOME ADVERTISER API] Error response:', response.status, errorData);
            return res.status(response.status).json(errorData);
        }

        const data = await response.json();
        console.log('[BECOME ADVERTISER API] Role switched successfully');
        console.log('[BECOME ADVERTISER API] Response data:', JSON.stringify(data, null, 2));

        return res.status(200).json(data);

    } catch (error: any) {
        console.error('[BECOME ADVERTISER API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
