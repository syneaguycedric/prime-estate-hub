import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.substring(7);
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[LIST AGENCIES API] Fetching agencies list');

        const response = await fetch(`${directusUrl}/items/estate_agencies?fields=*,docs.*,town.*,user_created.*`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        console.log('[LIST AGENCIES API] Response status:', response.status);

        if (!response.ok) {
            console.error('[LIST AGENCIES API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[LIST AGENCIES API] Agencies fetched successfully:', data.data?.length || 0);
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('[LIST AGENCIES API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

