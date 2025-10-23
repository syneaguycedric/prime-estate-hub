import { useAuth } from '@/contexts/AuthContext';
import { handleUnauthorized } from '@/lib/auth-helpers';

export function useApiWithRefresh() {
    const { authData, refreshUser } = useAuth();

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

                // Tenter le refresh
                const refreshResponse = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: authData.refresh_token }),
                });

                if (refreshResponse.ok) {
                    const { access_token, refresh_token } = await refreshResponse.json();
                    console.log('[API REFRESH] Token refreshed successfully');

                    // Mettre à jour localStorage
                    const newAuthData = { ...authData, access_token, refresh_token };
                    localStorage.setItem('auth', JSON.stringify(newAuthData));

                    // Rafraîchir le contexte utilisateur
                    if (refreshUser) {
                        await refreshUser();
                    }

                    // Retenter la requête originale avec le nouveau token
                    return await fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            'Authorization': `Bearer ${access_token}`,
                        },
                    });
                } else {
                    console.log('[API REFRESH] Refresh failed, logging out');
                    // Refresh échoué → déconnexion
                    handleUnauthorized();
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
            handleUnauthorized();
            throw error;
        }
    };

    return { fetchWithRefresh };
}
