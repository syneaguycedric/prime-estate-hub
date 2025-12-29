import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Property ID required' });
    }

    try {
        const authHeader = req.headers.authorization;
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        if (!directusUrl) {
            return res.status(500).json({ error: 'Directus URL not configured' });
        }

        // Utiliser le token utilisateur si fourni, sinon le token par défaut
        let authorizationHeader: string;
        if (authHeader) {
            authorizationHeader = authHeader;
        } else {
            // Utiliser le token par défaut si aucun token utilisateur n'est fourni
            const defaultToken = process.env.NEXT_PUBLIC_DEFAULT_TOKEN;
            if (!defaultToken) {
                return res.status(401).json({ error: 'No authorization token available' });
            }
            authorizationHeader = `Bearer ${defaultToken}`;
        }

        if (req.method === 'GET') {
            // Récupérer une propriété par ID
            const directusUrl_full = `${directusUrl}/items/real_estates/${id}?fields=*,images.directus_files_id.*,notes.*,characteristics.*,documents.*,documents.file.*,town.*,user_created.*`;
            console.log('[PROPERTY API] Fetching property:', id);
            console.log('[PROPERTY API] Directus URL:', directusUrl_full);
            console.log('[PROPERTY API] Authorization header:', authorizationHeader ? `${authorizationHeader.substring(0, 20)}...` : 'none');

            const response = await fetch(directusUrl_full, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authorizationHeader,
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROPERTY API] Error fetching property:', JSON.stringify(errorData, null, 2));
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    errorData.errors.forEach((err: any, index: number) => {
                        console.error(`[PROPERTY API] Error ${index + 1}:`, {
                            message: err.message,
                            extensions: err.extensions ? JSON.stringify(err.extensions, null, 2) : 'no extensions'
                        });
                    });
                }
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

            const response = await fetch(`${directusUrl}/items/real_estates/${id}?fields=*,images.directus_files_id.*,notes.*,characteristics.*,documents.*,documents.file.*,town.*,user_created.*`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': authorizationHeader,
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

        } else if (req.method === 'DELETE') {
            // Supprimer une propriété
            console.log('[PROPERTY API] Deleting property:', id);

            const response = await fetch(`${directusUrl}/items/real_estates/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': authorizationHeader,
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROPERTY API] Error deleting property:', errorData);
                return res.status(response.status).json({
                    error: errorData.error || `Erreur ${response.status}: Impossible de supprimer l'annonce`,
                });
            }

            console.log('[PROPERTY API] Property deleted successfully');
            return res.status(200).json({ success: true });

        } else {
            return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('[PROPERTY API] Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
