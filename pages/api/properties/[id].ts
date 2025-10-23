import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID required' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        if (!directusUrl) {
            return res.status(500).json({ error: 'Directus URL not configured' });
        }

        if (req.method === 'GET') {
            // Récupérer une propriété par ID
            console.log('[PROPERTY API] Fetching property:', id);

            const response = await fetch(`${directusUrl}/items/real_estates/${id}?fields=*.*,images.directus_files_id.*,address.*`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROPERTY API] Error fetching property:', errorData);
                return res.status(response.status).json({
                    error: errorData.error || `Erreur ${response.status}: Impossible de récupérer l'annonce`,
                });
            }

            const data = await response.json();
            console.log('[PROPERTY API] Property fetched successfully');

            return res.status(200).json(data);

        } else if (req.method === 'PATCH') {
            // Mettre à jour une propriété
            console.log('[PROPERTY API] Updating property:', id);

            const updateData = req.body;
            console.log('[PROPERTY API] Update data:', JSON.stringify(updateData, null, 2));

            const response = await fetch(`${directusUrl}/items/real_estates/${id}?fields=*.*`, {
                method: 'PATCH',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROPERTY API] Error updating property:', errorData);
                return res.status(response.status).json({
                    error: errorData.error || `Erreur ${response.status}: Impossible de mettre à jour l'annonce`,
                });
            }

            const data = await response.json();
            console.log('[PROPERTY API] Property updated successfully');

            return res.status(200).json(data);

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('[PROPERTY API] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
