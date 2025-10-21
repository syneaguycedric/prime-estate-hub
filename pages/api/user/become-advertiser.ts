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
        const roleAdvertiserId = process.env.NEXT_PUBLIC_ROLE_ADVERTISER_ID;

        console.log('[BECOME ADVERTISER API] Environment check:');
        console.log('[BECOME ADVERTISER API] - directusUrl:', directusUrl);
        console.log('[BECOME ADVERTISER API] - roleAdvertiserId:', roleAdvertiserId);
        console.log('[BECOME ADVERTISER API] - directusUrl exists:', !!directusUrl);
        console.log('[BECOME ADVERTISER API] - roleAdvertiserId exists:', !!roleAdvertiserId);

        if (!directusUrl || !roleAdvertiserId) {
            console.error('[BECOME ADVERTISER API] Missing environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[BECOME ADVERTISER API] Upgrading user with token');
        console.log('[BECOME ADVERTISER API] Using access token:', accessToken.substring(0, 20) + '...');

        // Étape 1 : Récupérer l'utilisateur pour obtenir son account.id
        console.log('[BECOME ADVERTISER API] Step 1: Fetching user data from Directus...');
        const getUserResponse = await fetch(`${directusUrl}/users/me?fields=*,account.*`, {
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
        const accountId = userData.data?.account?.id;
        const actualUserId = userData.data?.id; // Récupérer l'ID réel de l'utilisateur

        console.log('[BECOME ADVERTISER API] User data:', {
            userId: actualUserId,
            accountId: accountId,
            accountType: userData.data?.account?.account_type
        });

        if (!accountId) {
            return res.status(400).json({
                error: 'No account found for this user. Please contact support.'
            });
        }

        console.log('[BECOME ADVERTISER API] Found account ID:', accountId);

        // Étape 2 : Mettre à jour l'utilisateur avec le rôle annonceur
        const payload = {
            role: roleAdvertiserId,
            account: {
                id: accountId,
                account_type: "advertiser"
            }
        };

        console.log('[BECOME ADVERTISER API] Payload to send to Directus:', JSON.stringify(payload, null, 2));
        console.log('[BECOME ADVERTISER API] Directus URL:', `${directusUrl}/users/${actualUserId}?fields=*,account.*,role.*`);
        console.log('[BECOME ADVERTISER API] Role ID:', roleAdvertiserId);
        console.log('[BECOME ADVERTISER API] Account ID:', accountId);
        console.log('[BECOME ADVERTISER API] Actual User ID:', actualUserId);

        const response = await fetch(`${directusUrl}/users/${actualUserId}?fields=*,account.*,role.*`, {
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
