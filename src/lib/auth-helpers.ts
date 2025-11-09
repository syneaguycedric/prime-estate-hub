/**
 * Gestion globale de l'authentification et des erreurs 401
 */

/**
 * Options pour personnaliser le message de toast lors de la déconnexion
 */
interface UnauthorizedOptions {
    reason?: 'token_expired' | 'refresh_failed' | 'invalid_token' | 'no_token' | 'session_expired';
    customMessage?: string;
    customDescription?: string;
}

/**
 * Fonction globale pour gérer les erreurs 401 (non autorisé)
 * Déconnecte l'utilisateur, nettoie le localStorage, affiche un toast et redirige vers /login
 * @param options Options pour personnaliser le message de toast
 */
export function handleUnauthorized(options: UnauthorizedOptions = {}) {
    // Vérifier qu'on est côté client
    if (typeof window === 'undefined') {
        return;
    }

    console.log('[AUTH] Handling 401 - Unauthorized access');

    // Sauvegarder le chemin actuel pour redirection après login
    const currentPath = window.location.pathname + window.location.search;
    if (currentPath !== '/login' && currentPath !== '/register') {
        sessionStorage.setItem('redirect_after_login', currentPath);
    }

    // Nettoyer toutes les données d'authentification
    localStorage.removeItem('kylimmo_auth_data');
    localStorage.removeItem('kylimmo_user_data');
    localStorage.removeItem('auth'); // Ancienne clé pour compatibilité

    // Nettoyer le style pointer-events qui pourrait bloquer l'interface
    document.body.style.pointerEvents = '';

    // Déterminer le message de toast selon le contexte
    let message = options.customMessage || 'Vous avez été déconnecté';
    let description = options.customDescription;

    if (!description) {
        switch (options.reason) {
            case 'token_expired':
                description = 'Votre token d\'accès a expiré. Veuillez vous reconnecter.';
                break;
            case 'refresh_failed':
                description = 'Impossible de renouveler votre session. Veuillez vous reconnecter.';
                break;
            case 'invalid_token':
                description = 'Votre token d\'accès est invalide. Veuillez vous reconnecter.';
                break;
            case 'no_token':
                description = 'Aucun token d\'accès disponible. Veuillez vous reconnecter.';
                break;
            case 'session_expired':
            default:
                description = 'Votre session a expiré. Veuillez vous reconnecter.';
                break;
        }
    }

    // Afficher un toast d'information
    // Import dynamique pour éviter les dépendances circulaires
    import('@/lib/toast-helpers').then(({ toast }) => {
        toast.error(message, {
            description,
            duration: 4000,
        });
    }).catch(err => {
        console.error('[AUTH] Failed to show toast:', err);
    });

    // Redirection après un court délai pour laisser le toast s'afficher
    setTimeout(() => {
        window.location.href = '/login';
    }, 500);
}

/**
 * Fonction pour vérifier si un token est expiré
 * @param expiresAt Timestamp d'expiration du token
 * @returns true si le token est expiré
 */
export function isTokenExpired(expiresAt?: number): boolean {
    if (!expiresAt) return true;
    return Date.now() >= expiresAt;
}

/**
 * Fonction pour obtenir le token d'authentification depuis localStorage
 * @returns Le token ou null s'il n'existe pas
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const authData = localStorage.getItem('kylimmo_auth_data');
        if (!authData) return null;

        const parsed = JSON.parse(authData);
        return parsed.access_token || null;
    } catch (error) {
        console.error('[AUTH] Error parsing auth data:', error);
        return null;
    }
}

/**
 * Fonction pour obtenir toutes les données d'authentification depuis localStorage
 * @returns Les données d'authentification ou null
 */
export function getAuthData(): { access_token: string; refresh_token: string; expiresAt: number } | null {
    if (typeof window === 'undefined') return null;

    try {
        const authData = localStorage.getItem('kylimmo_auth_data');
        if (!authData) return null;

        const parsed = JSON.parse(authData);
        return {
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token,
            expiresAt: parsed.expiresAt
        };
    } catch (error) {
        console.error('[AUTH] Error parsing auth data:', error);
        return null;
    }
}

/**
 * Fonction pour créer un fetch authentifié avec gestion automatique du refresh token
 * @param url URL de la requête
 * @param options Options de fetch
 * @returns Promise<Response>
 */
export async function createAuthenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Récupérer les données d'authentification
    const authData = getAuthData();

    if (!authData) {
        console.log('[AUTH FETCH] No auth data available');
        handleUnauthorized({ reason: 'no_token' });
        throw new Error('No authentication data');
    }

    // Ajouter le token d'authentification aux headers
    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${authData.access_token}`);
    headers.set('Content-Type', 'application/json');

    // Effectuer la requête
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Si 401, tenter le refresh token
    if (response.status === 401) {
        console.log('[AUTH FETCH] 401 detected, attempting refresh...');

        try {
            // Tenter le refresh
            const refreshResponse = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refresh_token: authData.refresh_token,
                }),
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                console.log('[AUTH FETCH] Token refreshed successfully');

                // Mettre à jour localStorage
                const newAuthData = {
                    access_token: refreshData.data.access_token,
                    refresh_token: refreshData.data.refresh_token,
                    expires: refreshData.data.expires,
                    expiresAt: Date.now() + refreshData.data.expires,
                };
                localStorage.setItem('kylimmo_auth_data', JSON.stringify(newAuthData));

                // Retenter la requête originale avec le nouveau token
                const newHeaders = new Headers(options.headers);
                newHeaders.set('Authorization', `Bearer ${newAuthData.access_token}`);
                newHeaders.set('Content-Type', 'application/json');

                return await fetch(url, {
                    ...options,
                    headers: newHeaders,
                });
            } else {
                console.log('[AUTH FETCH] Refresh failed, logging out');
                handleUnauthorized({ reason: 'refresh_failed' });
                throw new Error('Refresh token expired');
            }
        } catch (error) {
            console.error('[AUTH FETCH] Error during refresh:', error);
            handleUnauthorized({ reason: 'refresh_failed' });
            throw error;
        }
    }

    return response;
}

