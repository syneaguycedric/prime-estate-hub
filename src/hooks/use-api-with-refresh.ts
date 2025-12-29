import { useAuth } from '@/contexts/AuthContext';
import { refreshTokenIfNeeded, isRefreshingToken, getCurrentRefreshPromise } from '@/lib/refresh-token-service';

export function useApiWithRefresh() {
    const { authData } = useAuth();

    const fetchWithRefresh = async (url: string, options: RequestInit = {}) => {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${authData?.access_token}`,
                },
            });

            if (response.status === 401 && authData?.refresh_token) {
                console.log('[API REFRESH] Token expired, attempting refresh via service...');

                // Vérifier si un refresh est déjà en cours
                if (isRefreshingToken()) {
                    console.log('[API REFRESH] Refresh already in progress, waiting...');
                    const currentRefresh = getCurrentRefreshPromise();
                    if (currentRefresh) {
                        const refreshSuccess = await currentRefresh;
                        if (!refreshSuccess) {
                            throw new Error('Refresh token expired');
                        }
                    }
                } else {
                    // Utiliser le service centralisé de refresh token
                    const refreshSuccess = await refreshTokenIfNeeded();
                    if (!refreshSuccess) {
                        console.log('[API REFRESH] Refresh failed, request will fail');
                        throw new Error('Refresh token expired');
                    }
                }

                console.log('[API REFRESH] Token refreshed successfully, retrying request');

                // Retenter la requête originale avec le nouveau token
                const newAuthData = JSON.parse(localStorage.getItem('kylimmo_auth_data') || '{}');
                if (!newAuthData.access_token) {
                    throw new Error('New access token not available');
                }

                return await fetch(url, {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newAuthData.access_token}`,
                    },
                });
            }

            return response;
        } catch (error) {
            console.error('[API REFRESH] Error:', error);
            // En cas d'erreur réseau ou autre, vérifier si c'est un problème d'auth
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Erreur réseau, ne pas déconnecter automatiquement
                throw error;
            }
            // Re-lancer l'erreur pour que l'appelant puisse la gérer
            throw error;
        }
    };

    return { fetchWithRefresh };
}
