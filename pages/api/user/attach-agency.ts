import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { accessToken, agencyId } = req.body;

        if (!accessToken) {
            return res.status(400).json({ error: 'Access token is required' });
        }

        if (!agencyId) {
            return res.status(400).json({ error: 'Agency ID is required' });
        }

        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;

        if (!directusUrl) {
            return res.status(500).json({ error: 'Server configuration error' });
        }

        console.log('[ATTACH AGENCY API] Attaching user to agency:', agencyId);

        // Étape 1 : Récupérer l'utilisateur pour obtenir son account.id
        const getUserResponse = await fetch(`${directusUrl}/users/me?fields=*,account.id,account.account_type,account.phoneNumber,account.agency,role.id,role.name`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!getUserResponse.ok) {
            const errorData = await getUserResponse.json();
            console.error('[ATTACH AGENCY API] Error fetching user:', errorData);
            return res.status(getUserResponse.status).json({ error: 'Failed to fetch user data' });
        }

        const userData = await getUserResponse.json();
        const accountId = userData.data?.account?.id;
        const userId = userData.data?.id;

        if (!accountId) {
            return res.status(400).json({
                error: 'No account found for this user.'
            });
        }

        console.log('[ATTACH AGENCY API] User ID:', userId, 'Account ID:', accountId);

        // Étape 2 : Mettre à jour le compte avec l'agence
        const payload = {
            account: {
                id: accountId,
                agency: agencyId
            }
        };

        console.log('[ATTACH AGENCY API] Payload:', JSON.stringify(payload, null, 2));

        const response = await fetch(`${directusUrl}/users/${userId}?fields=*,account.*,role.*`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('[ATTACH AGENCY API] Response status:', response.status);

        if (!response.ok) {
            console.error('[ATTACH AGENCY API] Error response:', data);
            return res.status(response.status).json(data);
        }

        console.log('[ATTACH AGENCY API] User attached to agency successfully');
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('[ATTACH AGENCY API] Error:', error);
        return res.status(500).json({ error: error.message });
    }
}

