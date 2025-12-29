import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { id } = req.query;
        const { status } = req.body;

        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Property ID is required' });
        }

        if (!status || !['published', 'draft', 'expired', 'archived', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (published/draft/expired/archived/rejected) is required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        console.log('[TOGGLE STATUS API] Updating property:', id, 'to status:', status);

        const response = await fetch(`${directusUrl}/items/real_estates/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEFAULT_TOKEN}`,
            },
            body: JSON.stringify({
                status: status
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[TOGGLE STATUS API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[TOGGLE STATUS API] Property status updated successfully:', id);

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('[TOGGLE STATUS API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
