import { NextApiRequest, NextApiResponse } from 'next';

interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    title?: string;
    location?: string;
    phoneNumber?: string;
    email_notifications?: boolean;
}

interface DirectusUserResponse {
    data: {
        first_name: string;
        last_name: string;
        email: string;
        title: string;
        description: null;
        tags: null;
        id: string;
        account: {
            id: string;
            user_created: string;
            date_created: string;
            user_updated: null;
            date_updated: null;
            agency: null;
            phoneNumber: string | null;
            account_type: string;
            agencies: any[];
        };
        avatar: null;
        role: {
            name: string;
            id: string;
        };
    };
}

interface DirectusErrorResponse {
    errors: Array<{
        message: string;
        extensions: {
            collection: string;
            field: string;
            value: string;
            code: string;
        };
    }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            first_name,
            last_name,
            email,
            password,
            title,
            location,
            phoneNumber,
            email_notifications = true
        }: RegisterData = req.body;

        // Validation côté serveur
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                error: 'Champs requis manquants',
                details: 'Prénom, nom, email et mot de passe sont obligatoires'
            });
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Format d\'email invalide'
            });
        }

        // Validation mot de passe
        if (password.length < 3) {
            return res.status(400).json({
                error: 'Le mot de passe doit contenir au moins 3 caractères'
            });
        }

        // Préparer les données pour Directus
        const directusData = {
            first_name,
            last_name,
            email,
            password,
            title: title || undefined,
            location: location || undefined,
            email_notifications,
            account: phoneNumber ? {
                phoneNumber
            } : undefined
        };

        // Appel à l'API Directus
        const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_API_URL;
        const defaultToken = process.env.NEXT_PUBLIC_DEFAULT_TOKEN;

        if (!directusUrl || !defaultToken) {
            console.error('[REGISTER API] Missing environment variables');
            return res.status(500).json({
                error: 'Configuration serveur manquante'
            });
        }

        const response = await fetch(`${directusUrl}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${defaultToken}`
            },
            body: JSON.stringify(directusData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('[REGISTER API] Directus error:', responseData);

            // Gestion spécifique de l'erreur email déjà utilisé
            if (responseData.errors && responseData.errors.length > 0) {
                const error = responseData.errors[0];
                if (error.extensions?.code === 'RECORD_NOT_UNIQUE' && error.extensions?.field === 'email') {
                    return res.status(409).json({
                        error: 'Email déjà utilisé',
                        details: 'Un compte avec cette adresse email existe déjà'
                    });
                }
            }

            return res.status(response.status).json({
                error: 'Erreur lors de la création du compte',
                details: responseData.errors?.[0]?.message || 'Erreur inconnue'
            });
        }

        // Succès
        console.log('[REGISTER API] User created successfully:', responseData.data.id);

        return res.status(201).json({
            success: true,
            user: responseData.data
        });

    } catch (error) {
        console.error('[REGISTER API] Server error:', error);
        return res.status(500).json({
            error: 'Erreur interne du serveur',
            details: 'Impossible de traiter votre demande'
        });
    }
}
