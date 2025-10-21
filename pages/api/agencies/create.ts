import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { accessToken, ...agencyData } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[CREATE AGENCY API] Creating agency:', agencyData.title);

        const response = await fetch(`${directusUrl}/items/estate_agencies?fields=*.*,docs.*`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(agencyData)
        });

        const data = await response.json();

        console.log('[CREATE AGENCY API] Response status:', response.status);

        if (!response.ok) {
            console.error('[CREATE AGENCY API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[CREATE AGENCY API] Agency created successfully');
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('[CREATE AGENCY API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

