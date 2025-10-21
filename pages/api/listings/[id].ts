import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID is required' });
    }

    if (req.method === 'DELETE') {
        try {
            const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

            console.log('[DELETE LISTING API] Deleting property:', id);

            const response = await fetch(`${directusUrl}/items/real_estates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DEFAULT_TOKEN}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[DELETE LISTING API] Error response:', errorData);
                return res.status(response.status).json(errorData);
            }

            console.log('[DELETE LISTING API] Property deleted successfully:', id);

            return res.status(200).json({ success: true });

        } catch (error: any) {
            console.error('[DELETE LISTING API] Error:', error);
            return res.status(500).json({ error: error.message });
        }
    }

    return res.status(405).json({ message: 'Method Not Allowed' });
}
