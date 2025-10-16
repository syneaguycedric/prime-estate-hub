import type { NextApiRequest, NextApiResponse } from 'next';

// Interface pour la réponse de connexion Directus
interface DirectusLoginResponse {
    data: {
        access_token: string;
        expires: number;
        refresh_token: string;
    };
}

// Interface pour les erreurs Directus
interface DirectusError {
    message: string;
    extensions: {
        code: string;
    };
}

interface DirectusErrorResponse {
    errors: DirectusError[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Autoriser uniquement les requêtes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        // Validation des données
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email et mot de passe requis',
            });
        }

        // URL de l'API Directus
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL || 'https://ki-backoffice.eyoboue.dev:8143';

        console.log('[AUTH API] Attempting login to:', `${directusUrl}/auth/login`);

        // Appel à l'API Directus
        const response = await fetch(`${directusUrl}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                mode: 'json',
            }),
        });

        // Gestion des erreurs HTTP
        if (!response.ok) {
            console.error('[AUTH API] Login failed:', response.status, response.statusText);

            let errorData: DirectusErrorResponse;
            try {
                errorData = await response.json();
            } catch {
                return res.status(response.status).json({
                    error: 'Authentication failed',
                    message: 'Erreur lors de la connexion',
                });
            }

            // Retourner la structure d'erreur Directus
            return res.status(response.status).json(errorData);
        }

        // Succès - retourner les données
        const data: DirectusLoginResponse = await response.json();
        console.log('[AUTH API] Login successful');

        return res.status(200).json(data);

    } catch (error) {
        console.error('[AUTH API] Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Erreur interne du serveur',
        });
    }
}

