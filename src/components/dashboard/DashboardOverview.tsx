import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Heart, Plus, Building2, Users, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-helpers";

export default function DashboardOverview() {
    const router = useRouter();
    const { user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserProperties();
    }, []);

    const loadUserProperties = async () => {
        setLoading(true);
        try {
            // Simuler le chargement des données
            // Dans un vrai projet, on ferait un appel API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setProperties([]);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateListing = () => {
        // Vérifier si l'utilisateur est un annonceur ET rattaché à une agence
        if (user?.account?.account_type !== "advertiser" || !user?.account?.agency) {
            router.push("/my-listings?tab=advertiser");
            toast.info("Devenez annonceur", {
                description: "Vous devez être annonceur avec une agence pour publier des annonces.",
                duration: 7000,
            });
            return;
        }
        router.push("/create-listing");
    };

    const handleViewListings = () => {
        router.push("/my-listings?tab=listings");
    };

    const handleViewAgencies = () => {
        router.push("/my-listings?tab=agencies");
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Dashboard</h2>
                    <p className="text-muted-foreground">Bienvenue dans votre espace personnel, {user?.first_name || "Utilisateur"}</p>
                </div>
                <Button onClick={handleCreateListing} variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle annonce
                </Button>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total annonces</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Aucune annonce publiée</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Vues totales</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Eye className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Aucune vue pour le moment</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Favoris</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <Heart className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Aucun favori reçu</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                                <p className="text-2xl font-bold">0 FCFA</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">Aucun revenu généré</p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Building2 className="h-5 w-5" />
                            <span>Mes annonces</span>
                        </CardTitle>
                        <CardDescription>Gérez toutes vos annonces immobilières</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Annonces actives</span>
                                <Badge variant="secondary">0</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">En brouillon</span>
                                <Badge variant="outline">0</Badge>
                            </div>
                            <Button onClick={handleViewListings} variant="outline" className="w-full">
                                Voir toutes mes annonces
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Agences</span>
                        </CardTitle>
                        <CardDescription>Gérez vos agences et partenaires</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Agences actives</span>
                                <Badge variant="secondary">0</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Partenaires</span>
                                <Badge variant="outline">0</Badge>
                            </div>
                            <Button onClick={handleViewAgencies} variant="outline" className="w-full">
                                Gérer les agences
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activité récente */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Activité récente</span>
                    </CardTitle>
                    <CardDescription>Vos dernières actions et mises à jour</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Aucune activité</h3>
                        <p className="text-muted-foreground mb-6">Commencez par créer votre première annonce pour voir votre activité ici.</p>
                        <Button onClick={handleCreateListing} variant="hero">
                            <Plus className="h-4 w-4 mr-2" />
                            Créer ma première annonce
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
