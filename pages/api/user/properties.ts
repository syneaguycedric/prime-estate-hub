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

        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        console.log('[USER PROPERTIES API] Fetching properties for user:', userId);

        // D'abord, récupérer toutes les annonces pour voir la structure
        console.log('[USER PROPERTIES API] Step 1: Fetching all properties to check structure...');
        const allPropertiesUrl = `${directusUrl}/items/real_estates?fields=*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*&sort=-date_created&limit=5`;
        console.log('[USER PROPERTIES API] All properties URL:', allPropertiesUrl);

        const allResponse = await fetch(allPropertiesUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            }
        });

        if (allResponse.ok) {
            const allData = await allResponse.json() as any;
            console.log('[USER PROPERTIES API] All properties sample:', JSON.stringify(allData.data?.slice(0, 2), null, 2));

            // Vérifier la structure des user_created
            if (allData.data && allData.data.length > 0) {
                console.log('[USER PROPERTIES API] Sample user_created field:', allData.data[0].user_created);
                console.log('[USER PROPERTIES API] User ID we are looking for:', userId);
            }
        }

        // Maintenant essayer le filtre
        console.log('[USER PROPERTIES API] Step 2: Trying filter...');
        const apiUrl = `${directusUrl}/items/real_estates?filter[user_created][_eq]=${userId}&fields=*,images.directus_files_id.*,user_created.*,user_created.account.*,town.*.*&sort=-date_created`;
        console.log('[USER PROPERTIES API] Filter URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
            }
        });

        console.log('[USER PROPERTIES API] Response status:', response.status);

        const data = await response.json() as any;
        console.log('[USER PROPERTIES API] Response data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('[USER PROPERTIES API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[USER PROPERTIES API] Found', data.data?.length || 0, 'properties for user', userId);

        return res.status(200).json(data);
    } catch (error: any) {
        console.error('[USER PROPERTIES API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

