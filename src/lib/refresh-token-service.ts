/**
 * Service centralisé de gestion du refresh token
 * Évite les appels multiples simultanés et les redirections prématurées
 */

// État global du refresh token
let refreshPromise: Promise<boolean> | null = null;
let isRefreshing = false;

interface RefreshResult {
    success: boolean;
    access_token?: string;
    refresh_token?: string;
    expires?: number;
}

/**
 * Récupère les données d'authentification depuis localStorage
 */
function getAuthData(): { access_token: string; refresh_token: string; expiresAt: number } | null {
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
        console.error('[REFRESH SERVICE] Error parsing auth data:', error);
        return null;
    }
}

/**
 * Sauvegarde les nouvelles données d'authentification dans localStorage
 */
function saveAuthData(authData: { access_token: string; refresh_token: string; expiresAt: number }): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('kylimmo_auth_data', JSON.stringify({
            ...authData,
            expires: authData.expiresAt - Date.now()
        }));
    } catch (error) {
        console.error('[REFRESH SERVICE] Error saving auth data:', error);
    }
}

/**
 * Effectue le refresh token via l'API
 */
async function performRefresh(refreshToken: string): Promise<RefreshResult> {
    try {
        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: refreshToken,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[REFRESH SERVICE] Refresh failed:', response.status, errorData);
            return { success: false };
        }

        const data = await response.json();
        console.log('[REFRESH SERVICE] Token refreshed successfully');

        return {
            success: true,
            access_token: data.data.access_token,
            refresh_token: data.data.refresh_token,
            expires: data.data.expires,
        };
    } catch (error) {
        console.error('[REFRESH SERVICE] Error during refresh:', error);
        return { success: false };
    }
}

/**
 * Rafraîchit le token d'authentification de manière centralisée
 * Utilise un verrou pour éviter les appels multiples simultanés
 * 
 * @returns Promise<boolean> - true si le refresh a réussi, false sinon
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
    // Si un refresh est déjà en cours, attendre sa fin
    if (refreshPromise) {
        console.log('[REFRESH SERVICE] Refresh already in progress, waiting...');
        return refreshPromise;
    }

    // Vérifier qu'on est côté client
    if (typeof window === 'undefined') {
        return false;
    }

    // Récupérer les données d'authentification
    const authData = getAuthData();
    if (!authData || !authData.refresh_token) {
        console.log('[REFRESH SERVICE] No refresh token available');
        return false;
    }

    // Marquer le refresh comme en cours et créer la promesse
    isRefreshing = true;
    refreshPromise = (async () => {
        try {
            // Effectuer le refresh
            const result = await performRefresh(authData.refresh_token);

            if (result.success && result.access_token && result.refresh_token && result.expires) {
                // Sauvegarder les nouvelles données
                const newAuthData = {
                    access_token: result.access_token,
                    refresh_token: result.refresh_token,
                    expiresAt: Date.now() + result.expires,
                };
                saveAuthData(newAuthData);
                console.log('[REFRESH SERVICE] Token refreshed and saved');
                return true;
            } else {
                console.log('[REFRESH SERVICE] Refresh failed - invalid response');
                return false;
            }
        } catch (error) {
            console.error('[REFRESH SERVICE] Error during refresh:', error);
            return false;
        } finally {
            // Nettoyer l'état immédiatement après la résolution
            refreshPromise = null;
            isRefreshing = false;
        }
    })();

    return refreshPromise;
}

/**
 * Vérifie si un refresh token est actuellement en cours
 * @returns true si un refresh est en cours
 */
export function isRefreshingToken(): boolean {
    return isRefreshing;
}

/**
 * Obtient la promesse du refresh en cours (si elle existe)
 * Permet d'attendre la fin d'un refresh déjà lancé
 */
export function getCurrentRefreshPromise(): Promise<boolean> | null {
    return refreshPromise;
}

/**
 * Force la réinitialisation de l'état de refresh
 * À utiliser uniquement en cas d'erreur critique
 */
export function resetRefreshState(): void {
    refreshPromise = null;
    isRefreshing = false;
    console.log('[REFRESH SERVICE] Refresh state reset');
}

