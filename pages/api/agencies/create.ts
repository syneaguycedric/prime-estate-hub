import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { agencyData } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !agencyData) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        console.log('[CREATE AGENCY] Request:', { agencyData, directusUrl });

        // 1. Créer l'agence (envoi uniquement des champs autorisés)
        const createResponse = await fetch(`${directusUrl}/items/estate_agencies?fields=*,docs.*,town.*,user_created.*`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(agencyData),
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
            console.error('[CREATE AGENCY] Creation failed:', createData);
            return res.status(createResponse.status).json({
                success: false,
                error: createData.errors?.[0]?.message || 'Erreur création',
            });
        }

        console.log('[CREATE AGENCY] Agency created successfully:', createData.data.id);

        const newAgencyId = createData.data.id;

        // 2. Récupérer l'utilisateur pour obtenir son ID
        const getUserResponse = await fetch(`${directusUrl}/users/me?fields=*,role.*`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
            },
        });

        if (!getUserResponse.ok) {
            const errorData = await getUserResponse.json().catch(() => ({}));
            console.error('[CREATE AGENCY] Failed to fetch user:', errorData);
            // Continuer quand même si l'update user échoue (l'agence est créée)
            return res.status(200).json({
                success: true,
                agency: createData.data,
                warning: 'Agence créée mais impossible de mettre à jour l\'utilisateur'
            });
        }

        const userData = await getUserResponse.json();
        const userId = userData.data?.id;

        if (!userId) {
            console.warn('[CREATE AGENCY] User ID not found');
            return res.status(200).json({
                success: true,
                agency: createData.data,
                warning: 'Agence créée mais impossible de mettre à jour l\'utilisateur (ID manquant)'
            });
        }

        // 3. Mettre à jour l'utilisateur avec l'ID de l'agence (agency à la racine du payload)
        const updatePayload = {
            agency: newAgencyId
        };

        const updateUserResponse = await fetch(`${directusUrl}/users/${userId}?fields=*,account.*,account.agency.*`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatePayload),
        });

        const updateResponseData = await updateUserResponse.json().catch(() => ({}));

        if (!updateUserResponse.ok) {
            console.error('[CREATE AGENCY] Failed to update user:', updateResponseData);
            // Continuer quand même si l'update user échoue (l'agence est créée)
            return res.status(200).json({
                success: true,
                agency: createData.data,
                warning: 'Agence créée mais impossible de mettre à jour l\'utilisateur'
            });
        }

        console.log('[CREATE AGENCY] User updated with agency ID:', newAgencyId);

        return res.status(200).json({
            success: true,
            agency: createData.data
        });
    } catch (error: any) {
        console.error('[CREATE AGENCY] Exception:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
}