import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { BadgeDollarSign, CheckCircle, Loader2, Star, TrendingUp, Users, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast-helpers";

export default function BecomeAdvertiser() {
    const router = useRouter();
    const { user, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Utiliser useMemo pour recalculer quand user change
    const isAlreadyAdvertiser = React.useMemo(() => {
        return user?.account?.account_type === "advertiser";
    }, [user]);

    const hasAgency = React.useMemo(() => {
        return user?.account?.agency;
    }, [user]);

    const handleBecomeAdvertiser = async () => {
        // Debug : afficher la structure user
        console.log("=== DEBUG USER DATA ===");
        console.log("user.id:", user?.id);
        console.log("user.account:", user?.account);
        console.log("user.account?.id:", user?.account?.id);
        console.log("Full user object:", JSON.stringify(user, null, 2));
        console.log("======================");

        if (!user?.id) {
            toast.error("Erreur", {
                description: "ID utilisateur manquant.",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Récupérer l'access_token depuis localStorage (stocké dans kylimmo_auth_data)
            const authDataStr = localStorage.getItem("kylimmo_auth_data");

            if (!authDataStr) {
                throw new Error("Non authentifié. Veuillez vous reconnecter.");
            }

            let accessToken: string;
            try {
                const authData = JSON.parse(authDataStr);
                accessToken = authData.access_token;

                if (!accessToken) {
                    throw new Error("Token d'accès manquant");
                }

                console.log("[BECOME ADVERTISER] Access token retrieved successfully");
            } catch (parseError) {
                console.error("[BECOME ADVERTISER] Error parsing auth data:", parseError);
                throw new Error("Erreur lors de la récupération du token");
            }

            const response = await fetch("/api/user/become-advertiser", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    accessToken: accessToken,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("[BECOME ADVERTISER] API Error:", {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                });
                throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            console.log("[BECOME ADVERTISER] Success:", data);

            // Rafraîchir les données utilisateur
            console.log("[BECOME ADVERTISER] Refreshing user data...");
            await refreshUser();
            console.log("[BECOME ADVERTISER] User data refreshed. New account type:", user?.account?.account_type);

            toast.success("Félicitations !", {
                description: "Vous êtes maintenant annonceur. Vous pouvez publier des annonces.",
                duration: 5000,
            });

            // Rediriger vers les annonces après un délai
            setTimeout(() => {
                router.push("/my-listings?tab=listings");
            }, 2000);
        } catch (error: any) {
            console.error("Error becoming advertiser:", error);
            toast.error("Erreur", {
                description: error.message || "Impossible de devenir annonceur. Réessayez plus tard.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Cas 1: Annonceur avec agence - tout est OK
    if (isAlreadyAdvertiser && hasAgency) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Statut annonceur</h2>
                    <p className="text-muted-foreground">Vous avez déjà accès aux fonctionnalités d'annonceur</p>
                </div>

                {/* Card de confirmation */}
                <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-900">Annonceur confirmé</h3>
                                <p className="text-green-700">Vous pouvez publier et gérer vos annonces</p>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Badge variant="default" className="bg-green-600 text-white">
                                <BadgeDollarSign className="h-3 w-3 mr-1" />
                                Annonceur actif
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions rapides */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions rapides</CardTitle>
                        <CardDescription>Gérez vos annonces et explorez les fonctionnalités</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-auto p-4" onClick={() => router.push("/my-listings?tab=listings")}>
                                <div className="text-left">
                                    <div className="font-medium">Mes annonces</div>
                                    <div className="text-sm text-muted-foreground">Voir et gérer vos annonces</div>
                                </div>
                            </Button>
                            <Button variant="outline" className="h-auto p-4" onClick={() => router.push("/create-listing")}>
                                <div className="text-left">
                                    <div className="font-medium">Nouvelle annonce</div>
                                    <div className="text-sm text-muted-foreground">Publier une nouvelle annonce</div>
                                </div>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    // Cas 2: Annonceur sans agence - doit se rattacher à une agence
    if (isAlreadyAdvertiser && !hasAgency) {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Rattachez-vous à une agence</h2>
                    <p className="text-muted-foreground">Vous êtes annonceur, mais vous devez être rattaché à une agence pour publier</p>
                </div>

                {/* Card d'avertissement */}
                <Card className="border-yellow-200 bg-yellow-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Agence requise</h3>
                                <p className="text-yellow-800 mb-4">
                                    Pour publier des annonces, vous devez être rattaché à une agence immobilière. Cela garantit la qualité et la crédibilité des annonces sur notre
                                    plateforme.
                                </p>
                                <Badge variant="outline" className="border-yellow-600 text-yellow-800">
                                    <BadgeDollarSign className="h-3 w-3 mr-1" />
                                    Annonceur sans agence
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Comment se rattacher à une agence</CardTitle>
                        <CardDescription>Suivez ces étapes pour compléter votre profil</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold text-primary">1</span>
                                </div>
                                <div>
                                    <p className="font-medium">Consultez la liste des agences</p>
                                    <p className="text-sm text-muted-foreground">Accédez à l'onglet "Agences" pour voir les agences disponibles</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold text-primary">2</span>
                                </div>
                                <div>
                                    <p className="font-medium">Choisissez votre agence</p>
                                    <p className="text-sm text-muted-foreground">Sélectionnez l'agence à laquelle vous souhaitez être rattaché</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-semibold text-primary">3</span>
                                </div>
                                <div>
                                    <p className="font-medium">Commencez à publier</p>
                                    <p className="text-sm text-muted-foreground">Une fois rattaché, vous pourrez publier vos annonces</p>
                                </div>
                            </div>
                        </div>
                        <Button onClick={() => router.push("/my-listings?tab=agencies")} variant="hero" className="w-full">
                            Voir les agences
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Devenir annonceur</h2>
                <p className="text-muted-foreground">Accédez aux fonctionnalités avancées pour publier vos annonces</p>
            </div>

            {/* Avantages */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span>Avantages d'être annonceur</span>
                    </CardTitle>
                    <CardDescription>Découvrez tous les avantages de notre statut annonceur</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold">Publier des annonces</h3>
                            <p className="text-sm text-muted-foreground">Créez et publiez vos annonces immobilières</p>
                        </div>
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Users className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold">Gestion avancée</h3>
                            <p className="text-sm text-muted-foreground">Gérez vos annonces avec des outils professionnels</p>
                        </div>
                        <div className="text-center space-y-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                                <Shield className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold">Statut vérifié</h3>
                            <p className="text-sm text-muted-foreground">Profil professionnel et crédible</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <BadgeDollarSign className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Prêt à devenir annonceur ?</h3>
                            <p className="text-muted-foreground mb-6">Cliquez sur le bouton ci-dessous pour activer votre statut annonceur et commencer à publier vos annonces.</p>
                        </div>
                        <Button onClick={handleBecomeAdvertiser} disabled={isLoading} size="lg" className="w-full sm:w-auto">
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Activation en cours...
                                </>
                            ) : (
                                <>
                                    <BadgeDollarSign className="h-4 w-4 mr-2" />
                                    Devenir annonceur
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-muted-foreground">L'activation est gratuite et instantanée</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
