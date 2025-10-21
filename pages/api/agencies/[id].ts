import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Agency ID is required' });
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

        // GET - Récupérer une agence
        if (req.method === 'GET') {
            console.log('[AGENCY API] Fetching agency:', id);

            const response = await fetch(`${directusUrl}/items/estate_agencies/${id}?fields=*.*,docs.*,user_created.first_name,user_created.last_name`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[AGENCY API] Error fetching agency:', data);
                return res.status(response.status).json(data);
            }

            console.log('[AGENCY API] Agency fetched successfully');
            return res.status(200).json(data);
        }

        // PATCH - Mettre à jour une agence
        if (req.method === 'PATCH') {
            console.log('[AGENCY API] Updating agency:', id);

            const response = await fetch(`${directusUrl}/items/estate_agencies/${id}?fields=*.*,docs.*`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(req.body)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[AGENCY API] Error updating agency:', data);
                return res.status(response.status).json(data);
            }

            console.log('[AGENCY API] Agency updated successfully');
            return res.status(200).json(data);
        }

        // DELETE - Supprimer une agence
        if (req.method === 'DELETE') {
            console.log('[AGENCY API] Deleting agency:', id);

            const response = await fetch(`${directusUrl}/items/estate_agencies/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                console.error('[AGENCY API] Error deleting agency:', data);
                return res.status(response.status).json(data);
            }

            console.log('[AGENCY API] Agency deleted successfully');
            return res.status(204).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error: any) {
        console.error('[AGENCY API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

