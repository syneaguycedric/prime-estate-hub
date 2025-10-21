import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Récupérer le token depuis les headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token d\'authentification requis',
        });
    }

    const token = authHeader.substring(7); // Retirer "Bearer "
    const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || 'https://ki-backoffice.eyoboue.dev:8143';

    try {
        // GET - Récupérer le profil utilisateur
        if (req.method === 'GET') {
            console.log('[PROFILE API] Fetching user profile');

            const response = await fetch(`${directusUrl}/users/me?fields=*,account.id,account.account_type,account.phoneNumber,account.agency,role.id,role.name`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROFILE API] Failed to fetch profile:', response.status);
                return res.status(response.status).json(errorData);
            }

            const data = await response.json();
            console.log('[PROFILE API] Profile fetched successfully');
            console.log('[PROFILE API] Full Directus response:', JSON.stringify(data, null, 2));
            console.log('[PROFILE API] User data:', {
                id: data.data?.id,
                account: data.data?.account,
                accountType: typeof data.data?.account === 'object' ? data.data?.account?.account_type : 'account is ID only',
                role: data.data?.role
            });
            return res.status(200).json(data);
        }

        // PATCH - Mettre à jour le profil utilisateur
        if (req.method === 'PATCH') {
            console.log('[PROFILE API] Updating user profile');

            const response = await fetch(`${directusUrl}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('[PROFILE API] Failed to update profile:', response.status);
                return res.status(response.status).json(errorData);
            }

            const data = await response.json();
            console.log('[PROFILE API] Profile updated successfully');
            return res.status(200).json(data);
        }

        // Méthode non supportée
        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[PROFILE API] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Erreur interne du serveur',
        });
    }
}

