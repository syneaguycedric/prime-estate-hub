/**
 * Gestion globale de l'authentification et des erreurs 401
 */

/**
 * Fonction globale pour gérer les erreurs 401 (non autorisé)
 * Déconnecte l'utilisateur, nettoie le localStorage, affiche un toast et redirige vers /login
 */
export function handleUnauthorized() {
    // Vérifier qu'on est côté client
    if (typeof window === 'undefined') {
        return;
    }

    console.log('[AUTH] Handling 401 - Unauthorized access');

    // Nettoyer l'authentification
    localStorage.removeItem('auth');

    // Nettoyer le style pointer-events qui pourrait bloquer l'interface
    document.body.style.pointerEvents = '';

    // Afficher un toast d'information
    // Import dynamique pour éviter les dépendances circulaires
    import('@/lib/toast-helpers').then(({ toast }) => {
        toast.error('Session expirée', {
            description: 'Vous avez été déconnecté',
            duration: 3000,
        });
    }).catch(err => {
        console.error('[AUTH] Failed to show toast:', err);
    });

    // Redirection après un court délai pour laisser le toast s'afficher
    setTimeout(() => {
        window.location.href = '/login';
    }, 300);
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
        const authData = localStorage.getItem('auth');
        if (!authData) return null;

        const parsed = JSON.parse(authData);
        return parsed.access_token || null;
    } catch (error) {
        console.error('[AUTH] Error parsing auth data:', error);
        return null;
    }
}

