import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Agency ID required' });
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

        if (req.method === 'PATCH') {
            // Mettre à jour une agence
            console.log('[AGENCY API] Updating agency:', id);

            const response = await fetch(`${directusUrl}/items/estate_agencies/${id}?fields=*.*,docs.*,address.*`, {
                method: 'PATCH',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[AGENCY API] Error updating agency:', errorData);
                return res.status(response.status).json({
                    error: errorData.error || `Erreur ${response.status}: Impossible de mettre à jour l'agence`,
                });
            }

            const data = await response.json();
            console.log('[AGENCY API] Agency updated successfully');

            return res.status(200).json(data);

        } else if (req.method === 'GET') {
            // Récupérer une agence par ID
            console.log('[AGENCY API] Fetching agency:', id);

            const response = await fetch(`${directusUrl}/items/estate_agencies/${id}?fields=*.*,docs.*,address.*`, {
                method: 'GET',
                headers: {
                    'Authorization': authHeader,
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[AGENCY API] Error fetching agency:', errorData);
                return res.status(response.status).json({
                    error: errorData.error || `Erreur ${response.status}: Impossible de récupérer l'agence`,
                });
            }

            const data = await response.json();
            console.log('[AGENCY API] Agency fetched successfully');

            return res.status(200).json(data);

        } else {
            res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('[AGENCY API] Exception:', error);
        return res.status(500).json({
            error: 'Erreur serveur lors de la gestion de l\'agence',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
