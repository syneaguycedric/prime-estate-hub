import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No authorization header' });
        }

        const { userId, page = '1', limit = '10', search, status, type } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const offset = (pageNum - 1) * limitNum;

        console.log('[USER PROPERTIES API] Fetching properties for user:', userId, `page: ${pageNum}, limit: ${limitNum}`, `search: ${search}, status: ${status}, type: ${type}`);

        // Construire les filtres Directus
        const filters: any[] = [];
        
        // Filtre utilisateur (toujours présent)
        filters.push({ user_created: { _eq: userId } });

        // Filtre de recherche (titre et description) - insensible à la casse
        if (search && typeof search === 'string' && search.trim().length > 0) {
            const cleanSearch = search.trim();
            filters.push({
                _or: [
                    { title: { _icontains: cleanSearch } },
                    { description: { _icontains: cleanSearch } }
                ]
            });
        }

        // Filtre par statut
        if (status && typeof status === 'string' && status !== 'all') {
            let statusValue = status;
            // Mapper "active" vers "published"
            if (status === 'active') {
                statusValue = 'published';
            }
            filters.push({ status: { _eq: statusValue } });
        }

        // Filtre par type
        if (type && typeof type === 'string' && type !== 'all') {
            filters.push({ type: { _eq: type } });
        }

        // Construire le filtre final avec _and pour combiner tous les filtres
        // Si on a plusieurs filtres, utiliser _and, sinon utiliser le seul filtre
        let filterObj: any;
        if (filters.length === 0) {
            filterObj = { user_created: { _eq: userId } };
        } else if (filters.length === 1) {
            filterObj = filters[0];
        } else {
            filterObj = { _and: filters };
        }

        // Construire l'URL avec les paramètres
        const params = new URLSearchParams({
            fields: '*,images.directus_files_id.*,characteristics.*,notes.*,promotions.promotions_id.*',
            sort: '-date_created',
            limit: limitNum.toString(),
            offset: offset.toString(),
            meta: 'filter_count',
            filter: JSON.stringify(filterObj)
        });

        const apiUrl = `${directusUrl}/items/real_estates?${params.toString()}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            }
        });

        console.log('[USER PROPERTIES API] Response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[USER PROPERTIES API] Error response:', errorData);
            return res.status(response.status).json(errorData);
        }

        const data = await response.json() as any;
        console.log('[USER PROPERTIES API] Found', data.data?.length || 0, 'properties (total:', data.meta?.filter_count || 0, ')');

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('[USER PROPERTIES API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

