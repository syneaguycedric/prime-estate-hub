import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { userId, agencyId } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !userId || !agencyId) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        console.log('[ATTACH AGENCY] Request:', { userId, agencyId, directusUrl });

        // 1. Récupérer l'utilisateur avec ses agences existantes
        const userResponse = await fetch(
            `${directusUrl}/users/${userId}?fields=*.*,account.agencies.estate_agencies_id.*,account.agencies.estate_agencies_id.address.*`,
            {
                headers: { 'Authorization': authHeader },
            }
        );

        if (!userResponse.ok) {
            const userData = await userResponse.json();
            console.error('[ATTACH AGENCY] Failed to fetch user:', userData);
            return res.status(userResponse.status).json({
                success: false,
                error: 'Impossible de récupérer les données utilisateur',
            });
        }

        const userData = await userResponse.json();
        const existingAgencies = userData.data?.account?.agencies || [];
        console.log('[ATTACH AGENCY] Existing agencies:', existingAgencies.length);

        // 2. Faire le PATCH en incluant agencies pour les préserver
        const response = await fetch(
            `${directusUrl}/users/${userId}?fields=*.*,account.agencies.estate_agencies_id.*,account.agencies.estate_agencies_id.address.*`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    account: {
                        agency: agencyId,
                        account_type: "advertiser",
                        agencies: existingAgencies // ✅ Préserver le tableau
                    }
                }),
            }
        );

        const data = await response.json();
        console.log('[ATTACH AGENCY] Directus response:', { status: response.status, data });

        if (!response.ok) {
            console.error('[ATTACH AGENCY] Directus error:', data);
            return res.status(response.status).json({
                success: false,
                error: data.errors?.[0]?.message || 'Erreur lors du rattachement',
            });
        }

        return res.status(200).json({ success: true, user: data.data });
    } catch (error: any) {
        console.error('[ATTACH AGENCY] Exception:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
}
