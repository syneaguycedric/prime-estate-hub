import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            console.error('[BECOME ADVERTISER API] Missing DIRECTUS_URL environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[BECOME ADVERTISER API] Upgrading user with token');
        console.log('[BECOME ADVERTISER API] Using access token:', accessToken.substring(0, 20) + '...');

        // Étape 1 : Récupérer l'utilisateur pour obtenir son ID
        console.log('[BECOME ADVERTISER API] Step 1: Fetching user data from Directus...');
        const getUserResponse = await fetch(`${directusUrl}/users/me?fields=id`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        console.log('[BECOME ADVERTISER API] GET user response status:', getUserResponse.status);

        if (!getUserResponse.ok) {
            const errorData = await getUserResponse.json();
            console.error('[BECOME ADVERTISER API] Error fetching user:', errorData);
            return res.status(getUserResponse.status).json({ error: 'Failed to fetch user data' });
        }

        const userData = await getUserResponse.json();
        const actualUserId = userData.data?.id; // Récupérer l'ID réel de l'utilisateur

        if (!actualUserId) {
            return res.status(400).json({
                error: 'No user ID found. Please contact support.'
            });
        }

        console.log('[BECOME ADVERTISER API] Found user ID:', actualUserId);

        // Étape 2 : Récupérer tous les rôles pour trouver "Advertiser"
        console.log('[BECOME ADVERTISER API] Step 2: Fetching all roles...');
        const getRoleResponse = await fetch(`${directusUrl}/roles?fields=id,name`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!getRoleResponse.ok) {
            const errorData = await getRoleResponse.json();
            console.error('[BECOME ADVERTISER API] Error fetching roles:', errorData);
            return res.status(getRoleResponse.status).json({ error: 'Failed to fetch roles' });
        }

        const roleData = await getRoleResponse.json();
        const roles = roleData.data || [];
        
        // Trouver le rôle "Advertiser" dans la liste
        const advertiserRole = roles.find((role: { name: string; id: string }) => role.name === "Advertiser");

        if (!advertiserRole || !advertiserRole.id) {
            console.error('[BECOME ADVERTISER API] Advertiser role not found in roles list');
            return res.status(404).json({ error: 'Advertiser role not found' });
        }

        console.log('[BECOME ADVERTISER API] Found Advertiser role ID:', advertiserRole.id);

        // Étape 3 : Mettre à jour l'utilisateur avec uniquement le rôle annonceur
        const payload = {
            role: advertiserRole.id
        };

        console.log('[BECOME ADVERTISER API] Payload to send to Directus:', JSON.stringify(payload, null, 2));
        console.log('[BECOME ADVERTISER API] Directus URL:', `${directusUrl}/users/${actualUserId}?fields=*,account.*,role.*`);
        console.log('[BECOME ADVERTISER API] Role ID:', advertiserRole.id);
        console.log('[BECOME ADVERTISER API] Actual User ID:', actualUserId);

        const response = await fetch(`${directusUrl}/users/${actualUserId}?fields=*,account.*,account.agencies.estate_agencies_id.*,account.agencies.estate_agencies_id.address.*,account.agency.*,account.agency.address.*,role.*`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('[BECOME ADVERTISER API] Directus response status:', response.status);
        console.log('[BECOME ADVERTISER API] Directus response data:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            console.error('[BECOME ADVERTISER API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[BECOME ADVERTISER API] User upgraded successfully');
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('[BECOME ADVERTISER API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
