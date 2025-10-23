import { useAuth } from '@/contexts/AuthContext';
import { handleUnauthorized } from '@/lib/auth-helpers';

export function useApiWithRefresh() {
    const { authData, refreshAuthIfNeeded, refreshUser } = useAuth();

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
                console.log('[API REFRESH] Token expired, attempting refresh...');

                // Utiliser la fonction centralisée du contexte
                const refreshSuccess = await refreshAuthIfNeeded();

                if (refreshSuccess) {
                    console.log('[API REFRESH] Token refreshed successfully, retrying request');

                    // Retenter la requête originale avec le nouveau token
                    const newAuthData = JSON.parse(localStorage.getItem('kylimmo_auth_data') || '{}');
                    return await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            'Authorization': `Bearer ${newAuthData.access_token}`,
                        },
                    });
                } else {
                    console.log('[API REFRESH] Refresh failed, request will fail');
                    throw new Error('Refresh token expired');
                }
            }

            return response;
        } catch (error) {
            console.error('[API REFRESH] Error:', error);
            // En cas d'erreur réseau ou autre, vérifier si c'est un problème d'auth
            if (error instanceof TypeError && error.message.includes('fetch')) {
                // Erreur réseau, ne pas déconnecter automatiquement
                throw error;
            }
            // Si c'est une erreur de refresh, ne pas appeler handleUnauthorized ici
            // car refreshAuthIfNeeded() l'a déjà fait
            throw error;
        }
    };

    return { fetchWithRefresh };
}
