import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        console.log('[CREATE LISTING API] Starting listing creation');

        const authHeader = req.headers.authorization;
        if (!authHeader) {
            console.error('[CREATE LISTING API] No authorization header');
            return res.status(401).json({ error: 'No authorization header' });
        }

        const listingData = req.body;
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            console.error('[CREATE LISTING API] No Directus URL configured');
            return res.status(500).json({ error: 'Configuration API manquante' });
        }

        console.log('[CREATE LISTING API] Creating listing:', listingData.title);

        const response = await fetch(`${directusUrl}/items/real_estates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify([listingData]) // Directus attend un tableau
        });

        const data = await response.json() as any;

        if (!response.ok) {
            console.error('[CREATE LISTING API] Directus error:', data);
            return res.status(response.status).json(data);
        }

        console.log('[CREATE LISTING API] Listing created successfully:', data.data[0].id);

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('[CREATE LISTING API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
