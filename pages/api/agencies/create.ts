import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const { agencyData, userId } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !agencyData || !userId) {
        return res.status(400).json({ success: false, error: 'Missing parameters' });
    }

    try {
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        console.log('[CREATE AGENCY] Request:', { agencyData, userId, directusUrl });

        // 1. Créer l'agence
        const createResponse = await fetch(`${directusUrl}/items/estate_agencies`, {
            method: 'POST',
            headers: {
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

        const newAgencyId = createData.data.id;
        console.log('[CREATE AGENCY] Agency created:', newAgencyId);

        // 2. Récupérer l'utilisateur avec ses agences
        const userResponse = await fetch(
            `${directusUrl}/users/${userId}?fields=*.*,account.agencies.estate_agencies_id.*,account.agencies.estate_agencies_id.address.*`,
            {
                headers: { 'Authorization': authHeader },
            }
        );

        const userData = await userResponse.json();
        const existingAgencies = userData.data?.account?.agencies || [];
        const currentAgency = userData.data?.account?.agency; // Agence actuelle

        // 3. Ajouter la nouvelle agence au tableau
        const agenciesArray = [
            ...existingAgencies,
            { estate_agencies_id: newAgencyId }
        ];

        console.log('[CREATE AGENCY] Updating user with agencies:', agenciesArray);
        console.log('[CREATE AGENCY] Current agency:', currentAgency);

        // Préparer le payload
        const accountUpdate: any = {
            account_type: "advertiser",
            agencies: agenciesArray
        };

        // Définir comme agence actuelle SEULEMENT si aucune agence actuelle n'existe
        if (!currentAgency) {
            accountUpdate.agency = newAgencyId;
            console.log('[CREATE AGENCY] Setting as current agency (no existing agency)');
        } else {
            accountUpdate.agency = currentAgency; // Préserver l'agence actuelle existante
            console.log('[CREATE AGENCY] Keeping existing current agency:', currentAgency);
        }

        // 4. Mettre à jour l'utilisateur
        const updateResponse = await fetch(
            `${directusUrl}/users/${userId}?fields=*.*,account.agencies.estate_agencies_id.*,account.agencies.estate_agencies_id.address.*`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ account: accountUpdate }),
            }
        );

        const updateData = await updateResponse.json();

        if (!updateResponse.ok) {
            console.error('[CREATE AGENCY] User update failed:', updateData);
            return res.status(updateResponse.status).json({
                success: false,
                error: updateData.errors?.[0]?.message || 'Erreur mise à jour utilisateur',
            });
        }

        console.log('[CREATE AGENCY] Success:', { agency: createData.data, user: updateData.data });

        return res.status(200).json({
            success: true,
            agency: createData.data,
            user: updateData.data
        });
    } catch (error: any) {
        console.error('[CREATE AGENCY] Exception:', error);
        return res.status(500).json({ success: false, error: error.message || 'Erreur serveur' });
    }
}