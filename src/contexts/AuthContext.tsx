import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { loginUser, getCurrentUser, logoutUser as apiLogoutUser, registerUser, User, RegisterData, isUserAdvertiser } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";
import { handleUnauthorized } from "@/lib/auth-helpers";
import { refreshTokenIfNeeded, isRefreshingToken, getCurrentRefreshPromise } from "@/lib/refresh-token-service";
import { setCookie, deleteCookie } from "@/lib/cookie-helpers";

// Interface pour les données d'authentification
interface AuthData {
    access_token: string;
    refresh_token: string;
    expires: number;
    expiresAt: number; // Timestamp de l'expiration
}

// Interface pour l'état d'authentification
interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    authData: AuthData | null;
    isLoading: boolean;
}

// Interface pour les actions d'authentification
interface AuthActions {
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (registerData: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshAuth: () => Promise<boolean>;
    refreshAuthIfNeeded: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

// Type du contexte
type AuthContextType = AuthState & AuthActions;

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clés pour le localStorage
const AUTH_STORAGE_KEY = "kylimmo_auth_data";
const USER_STORAGE_KEY = "kylimmo_user_data";

// Interface pour le provider
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        authData: null,
        isLoading: true,
    });

    // Charger les données d'authentification depuis le localStorage au démarrage
    useEffect(() => {
        const loadAuthFromStorage = async () => {
            try {
                if (typeof window === "undefined") return;

                const storedAuthData = localStorage.getItem(AUTH_STORAGE_KEY);
                const storedUserData = localStorage.getItem(USER_STORAGE_KEY);

                if (storedAuthData && storedUserData) {
                    const authData: AuthData = JSON.parse(storedAuthData);
                    const user: User = JSON.parse(storedUserData);

                    // Vérifier si le token n'est pas expiré
                    const now = Date.now();
                    if (authData.expiresAt > now) {
                        console.log("[AUTH CONTEXT] Loading from localStorage:", {
                            userId: user.id,
                            roleName: user.role?.name,
                            isAdvertiser: isUserAdvertiser(user),
                        });

                        // Rafraîchir les données utilisateur pour s'assurer qu'elles sont à jour
                        try {
                            console.log("[AUTH CONTEXT] Refreshing user data on startup...");
                            const freshUser = await getCurrentUser(); // Utilise localStorage
                            if (freshUser) {
                                console.log("[AUTH CONTEXT] Fresh user data:", {
                                    userId: freshUser.id,
                                    roleName: freshUser.role?.name,
                                    isAdvertiser: isUserAdvertiser(freshUser),
                                });

                                // Mettre à jour avec les données fraîches
                                setAuthState({
                                    isAuthenticated: true,
                                    user: freshUser,
                                    authData,
                                    isLoading: false,
                                });

                                // Sauvegarder les données fraîches
                                saveAuthData(authData, freshUser);
                            } else {
                                // Fallback sur les données du localStorage si le rafraîchissement échoue
                                setAuthState({
                                    isAuthenticated: true,
                                    user,
                                    authData,
                                    isLoading: false,
                                });
                            }
                        } catch (error) {
                            console.error("[AUTH CONTEXT] Error refreshing user data:", error);
                            // Fallback sur les données du localStorage
                            setAuthState({
                                isAuthenticated: true,
                                user,
                                authData,
                                isLoading: false,
                            });
                        }

                        // Vérifier si le token expire bientôt (dans les 5 prochaines minutes)
                        const fiveMinutesFromNow = now + 5 * 60 * 1000;
                        if (authData.expiresAt < fiveMinutesFromNow) {
                            // Essayer de rafraîchir le token
                            await refreshAuth();
                        }
                    } else {
                        // Token expiré, tenter le refresh token avant de nettoyer (transparent pour l'utilisateur)
                        if (authData.refresh_token) {
                            console.log("[AUTH CONTEXT] Token expired, attempting silent refresh via service...");

                            // Utiliser le service centralisé de refresh token
                            const refreshSuccess = await refreshTokenIfNeeded();

                            if (refreshSuccess) {
                                console.log("[AUTH CONTEXT] Token refreshed successfully on startup (transparent)");

                                // Récupérer les nouvelles données depuis localStorage
                                const newAuthDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
                                if (newAuthDataStr) {
                                    const newAuthData: AuthData = JSON.parse(newAuthDataStr);

                                    // Récupérer les données utilisateur avec le nouveau token
                                    const freshUser = await getCurrentUser(newAuthData.access_token);

                                    if (freshUser) {
                                        console.log("[AUTH CONTEXT] User data retrieved with refreshed token");

                                        // Mettre à jour l'état avec les nouvelles données
                                        setAuthState({
                                            isAuthenticated: true,
                                            user: freshUser,
                                            authData: newAuthData,
                                            isLoading: false,
                                        });

                                        // Sauvegarder les nouvelles données
                                        saveAuthData(newAuthData, freshUser);
                                        // Refresh réussi, pas besoin de clearAuthData()
                                    } else {
                                        // Échec silencieux : nettoyer sans redirection explicite
                                        // Les pages protégées géreront leur propre redirection si nécessaire
                                        console.log("[AUTH CONTEXT] Failed to retrieve user with refreshed token, cleaning up silently");
                                        clearAuthData();
                                    }
                                } else {
                                    console.log("[AUTH CONTEXT] New auth data not found after refresh, cleaning up silently");
                                    clearAuthData();
                                }
                            } else {
                                // Refresh échoué : nettoyer silencieusement sans redirection explicite
                                // On n'appelle pas handleUnauthorized ici pour éviter les redirections visibles
                                // Les pages protégées géreront leur propre redirection si nécessaire
                                console.log("[AUTH CONTEXT] Refresh failed, cleaning up silently (transparent)");
                                clearAuthData();
                            }
                        } else {
                            // Pas de refresh_token disponible : nettoyer silencieusement
                            console.log("[AUTH CONTEXT] Token expired and no refresh_token, cleaning up silently");
                            clearAuthData();
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données d'authentification:", error);
                clearAuthData();
            } finally {
                setAuthState((prev) => ({ ...prev, isLoading: false, isRefreshing: isRefreshingToken() }));
            }
        };

        loadAuthFromStorage();
    }, []);

    // Fonction pour sauvegarder les données d'authentification
    const saveAuthData = (authData: AuthData, user: User) => {
        if (typeof window === "undefined") return;

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

        // Stocker le token dans un cookie pour l'accès côté serveur
        setCookie("kylimmo_access_token", authData.access_token, 30);
    };

    // Fonction pour nettoyer les données d'authentification
    const clearAuthData = () => {
        if (typeof window === "undefined") return;

        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

        // Supprimer le cookie du token
        deleteCookie("kylimmo_access_token");

        setAuthState({
            isAuthenticated: false,
            user: null,
            authData: null,
            isLoading: false,
        });
    };

    // Fonction de connexion
    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true, isRefreshing: isRefreshingToken() }));

            const result = await loginUser(email, password);

            if (result.success && result.token && result.refreshToken && result.expiresAt) {
                // Créer l'objet AuthData
                const authData: AuthData = {
                    access_token: result.token,
                    refresh_token: result.refreshToken,
                    expires: result.expiresAt - Date.now(), // Durée en millisecondes
                    expiresAt: result.expiresAt,
                };

                // Récupérer les informations de l'utilisateur
                const user = await getCurrentUser(result.token);

                if (user) {
                    console.log("[AUTH CONTEXT] Login successful, user data:", {
                        id: user.id,
                        roleName: user.role?.name,
                        agency: user.account?.agency,
                        isAdvertiser: isUserAdvertiser(user),
                    });

                    // Sauvegarder les données
                    saveAuthData(authData, user);

                    // Mettre à jour l'état
                    setAuthState({
                        isAuthenticated: true,
                        user,
                        authData,
                        isLoading: false,
                    });

                    toast.success("Connexion réussie", {
                        description: "Bienvenue.",
                        duration: 3000,
                    });

                    // Gérer la redirection après connexion
                    if (typeof window !== "undefined") {
                        const redirectUrl = sessionStorage.getItem("redirect_after_login");
                        if (redirectUrl) {
                            sessionStorage.removeItem("redirect_after_login");
                            // La redirection sera gérée par la page de login
                        }
                    }

                    return { success: true };
                } else {
                    throw new Error("Impossible de récupérer les informations utilisateur");
                }
            } else {
                setAuthState((prev) => ({ ...prev, isLoading: false, isRefreshing: isRefreshingToken() }));

                // Afficher un toast d'erreur
                toast.error("Échec de la connexion", {
                    description: result.error || "Erreur de connexion",
                    duration: 5000,
                });

                return { success: false, error: result.error || "Erreur de connexion" };
            }
        } catch (error: any) {
            console.error("Erreur lors de la connexion:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false, isRefreshing: isRefreshingToken() }));

            // Afficher un toast d'erreur
            toast.error("Erreur de connexion", {
                description: error.message || "Une erreur inattendue est survenue",
                duration: 5000,
            });

            return { success: false, error: error.message || "Une erreur inattendue est survenue" };
        }
    };

    // Fonction d'inscription
    const register = async (registerData: RegisterData): Promise<{ success: boolean; error?: string }> => {
        try {
            setAuthState((prev) => ({ ...prev, isLoading: true, isRefreshing: isRefreshingToken() }));

            const result = await registerUser(registerData);

            if (result.success && result.user) {
                // Après inscription réussie, connecter automatiquement l'utilisateur
                const loginResult = await login(registerData.email, registerData.password);

                if (loginResult.success) {
                    toast.success("Inscription réussie", {
                        description: "Bienvenue.",
                        duration: 3000,
                    });

                    return { success: true };
                } else {
                    // Inscription réussie mais connexion échouée
                    toast.warning("Inscription réussie", {
                        description: "Votre compte a été créé. Veuillez vous connecter.",
                        duration: 5000,
                    });

                    return { success: true };
                }
            } else {
                setAuthState((prev) => ({ ...prev, isLoading: false, isRefreshing: isRefreshingToken() }));

                // Afficher un toast d'erreur
                toast.error("Échec de l'inscription", {
                    description: result.error || "Erreur lors de l'inscription",
                    duration: 5000,
                });

                return { success: false, error: result.error || "Erreur lors de l'inscription" };
            }
        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false, isRefreshing: isRefreshingToken() }));

            // Afficher un toast d'erreur
            toast.error("Erreur d'inscription", {
                description: error.message || "Une erreur inattendue est survenue",
                duration: 5000,
            });

            return { success: false, error: error.message || "Une erreur inattendue est survenue" };
        }
    };

    // Fonction de déconnexion
    const logout = () => {
        // Appeler l'API de déconnexion si nécessaire
        apiLogoutUser();

        // Nettoyer les données locales
        clearAuthData();

        toast.success("Déconnexion réussie", {
            description: "Vous avez été déconnecté avec succès",
            duration: 2000,
        });
    };

    // Fonction pour rafraîchir l'authentification
    const refreshAuth = async (): Promise<boolean> => {
        try {
            if (!authState.authData?.refresh_token) {
                console.log("[AUTH CONTEXT] No refresh token available");
                return false;
            }

            console.log("[AUTH CONTEXT] Refreshing authentication token via service...");

            // Utiliser le service centralisé de refresh token
            const refreshSuccess = await refreshTokenIfNeeded();

            if (refreshSuccess) {
                console.log("[AUTH CONTEXT] Token refreshed successfully");

                // Récupérer les nouvelles données depuis localStorage
                const newAuthDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
                if (!newAuthDataStr) {
                    console.error("[AUTH CONTEXT] New auth data not found after refresh");
                    return false;
                }

                const newAuthData: AuthData = JSON.parse(newAuthDataStr);

                // Récupérer les données utilisateur avec le nouveau token
                const user = await getCurrentUser(newAuthData.access_token);

                if (user) {
                    console.log("[AUTH CONTEXT] User data retrieved with new token");

                    // Mettre à jour l'état
                    setAuthState({
                        isAuthenticated: true,
                        user,
                        authData: newAuthData,
                        isLoading: false,
                    });

                    // Sauvegarder les nouvelles données
                    saveAuthData(newAuthData, user);
                    return true;
                } else {
                    console.error("[AUTH CONTEXT] Failed to retrieve user with new token");
                    return false;
                }
            } else {
                console.error("[AUTH CONTEXT] Failed to refresh token");
                return false;
            }
        } catch (error) {
            console.error("[AUTH CONTEXT] Error refreshing authentication:", error);
            return false;
        }
    };

    // Fonction pour tenter le refresh et gérer l'échec
    const refreshAuthIfNeeded = async (): Promise<boolean> => {
        // Vérifier si un refresh est déjà en cours
        if (isRefreshingToken()) {
            console.log("[AUTH CONTEXT] Refresh already in progress, waiting...");
            const currentRefresh = getCurrentRefreshPromise();
            if (currentRefresh) {
                const refreshSuccess = await currentRefresh;
                if (refreshSuccess) {
                    // Mettre à jour l'état avec les nouvelles données
                    const newAuthDataStr = localStorage.getItem(AUTH_STORAGE_KEY);
                    if (newAuthDataStr) {
                        const newAuthData: AuthData = JSON.parse(newAuthDataStr);
                        const user = await getCurrentUser(newAuthData.access_token);
                        if (user) {
                            setAuthState((prev) => ({
                                ...prev,
                                isAuthenticated: true,
                                user,
                                authData: newAuthData,
                            }));
                            saveAuthData(newAuthData, user);
                            return true;
                        }
                    }
                }
                // Si le refresh a échoué, continuer avec la déconnexion
                if (!refreshSuccess) {
                    console.log("[AUTH CONTEXT] Refresh token expired or invalid, redirecting to login");
                    await handleUnauthorized({ reason: "refresh_failed" });
                }
                return refreshSuccess;
            }
        }

        // Lancer le refresh
        const success = await refreshAuth();
        if (!success) {
            console.log("[AUTH CONTEXT] Refresh token expired or invalid, redirecting to login");
            // Utiliser handleUnauthorized() qui nettoie le localStorage, affiche un toast et redirige vers /login
            await handleUnauthorized({ reason: "refresh_failed" });
        }
        return success;
    };

    // Fonction pour rafraîchir les données utilisateur (après modification du profil)
    const refreshUser = async (): Promise<void> => {
        try {
            if (!authState.authData?.access_token) return;

            console.log("[AUTH CONTEXT] Refreshing user data");
            const user = await getCurrentUser(); // Utilise localStorage

            if (user) {
                console.log("[AUTH CONTEXT] New user data received:", {
                    first_name: user.first_name,
                    last_name: user.last_name,
                    account_type: user.account?.account_type,
                    role: user.role?.name,
                });

                // Mettre à jour l'état
                setAuthState((prev) => ({
                    ...prev,
                    user,
                }));

                // Mettre à jour le localStorage
                if (typeof window !== "undefined") {
                    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
                }

                console.log("[AUTH CONTEXT] User data refreshed successfully");
                console.log("[AUTH CONTEXT] Current auth state after refresh:", {
                    isAuthenticated: true,
                    user: user,
                });
            }
        } catch (error) {
            console.error("Erreur lors du rafraîchissement des données utilisateur:", error);
        }
    };

    const contextValue: AuthContextType = {
        ...authState,
        login,
        register,
        logout,
        refreshAuth,
        refreshAuthIfNeeded,
        refreshUser,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth doit être utilisé dans un AuthProvider");
    }
    return context;
};

// Hook pour vérifier si l'utilisateur est authentifié
export const useRequireAuth = () => {
    const { isAuthenticated, isLoading } = useAuth();

    return {
        isAuthenticated,
        isLoading,
        shouldRedirect: !isLoading && !isAuthenticated,
    };
};

export default AuthContext;
