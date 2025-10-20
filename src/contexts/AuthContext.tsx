import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { loginUser, getCurrentUser, logoutUser as apiLogoutUser, registerUser, User, RegisterData } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";

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
    refreshAuth: () => Promise<void>;
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
                        setAuthState({
                            isAuthenticated: true,
                            user,
                            authData,
                            isLoading: false,
                        });

                        // Vérifier si le token expire bientôt (dans les 5 prochaines minutes)
                        const fiveMinutesFromNow = now + 5 * 60 * 1000;
                        if (authData.expiresAt < fiveMinutesFromNow) {
                            // Essayer de rafraîchir le token
                            await refreshAuth();
                        }
                    } else {
                        // Token expiré, nettoyer le localStorage
                        clearAuthData();
                    }
                }
            } catch (error) {
                console.error("Erreur lors du chargement des données d'authentification:", error);
                clearAuthData();
            } finally {
                setAuthState((prev) => ({ ...prev, isLoading: false }));
            }
        };

        loadAuthFromStorage();
    }, []);

    // Fonction pour sauvegarder les données d'authentification
    const saveAuthData = (authData: AuthData, user: User) => {
        if (typeof window === "undefined") return;

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    };

    // Fonction pour nettoyer les données d'authentification
    const clearAuthData = () => {
        if (typeof window === "undefined") return;

        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);

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
            setAuthState((prev) => ({ ...prev, isLoading: true }));

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
                        description: `Bienvenue ${user.first_name || user.email} !`,
                        duration: 3000,
                    });

                    return { success: true };
                } else {
                    throw new Error("Impossible de récupérer les informations utilisateur");
                }
            } else {
                setAuthState((prev) => ({ ...prev, isLoading: false }));

                // Afficher un toast d'erreur
                toast.error("Échec de la connexion", {
                    description: result.error || "Erreur de connexion",
                    duration: 5000,
                });

                return { success: false, error: result.error || "Erreur de connexion" };
            }
        } catch (error: any) {
            console.error("Erreur lors de la connexion:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));

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
            setAuthState((prev) => ({ ...prev, isLoading: true }));

            const result = await registerUser(registerData);

            if (result.success && result.user) {
                // Après inscription réussie, connecter automatiquement l'utilisateur
                const loginResult = await login(registerData.email, registerData.password);

                if (loginResult.success) {
                    toast.success("Inscription réussie", {
                        description: `Bienvenue ${result.user.first_name || result.user.email} !`,
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
                setAuthState((prev) => ({ ...prev, isLoading: false }));

                // Afficher un toast d'erreur
                toast.error("Échec de l'inscription", {
                    description: result.error || "Erreur lors de l'inscription",
                    duration: 5000,
                });

                return { success: false, error: result.error || "Erreur lors de l'inscription" };
            }
        } catch (error: any) {
            console.error("Erreur lors de l'inscription:", error);
            setAuthState((prev) => ({ ...prev, isLoading: false }));

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
    const refreshAuth = async (): Promise<void> => {
        try {
            if (!authState.authData?.refresh_token) return;

            // Ici, vous pourriez implémenter une logique de refresh token
            // Pour l'instant, on va simplement vérifier si l'utilisateur est toujours valide
            if (authState.authData?.access_token) {
                const user = await getCurrentUser(authState.authData.access_token);
                if (user) {
                    setAuthState((prev) => ({
                        ...prev,
                        user,
                    }));
                } else {
                    // Token invalide, déconnecter
                    logout();
                }
            }
        } catch (error) {
            console.error("Erreur lors du rafraîchissement de l'authentification:", error);
            logout();
        }
    };

    // Fonction pour rafraîchir les données utilisateur (après modification du profil)
    const refreshUser = async (): Promise<void> => {
        try {
            if (!authState.authData?.access_token) return;

            console.log("[AUTH CONTEXT] Refreshing user data");
            const user = await getCurrentUser(authState.authData.access_token);

            if (user) {
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
