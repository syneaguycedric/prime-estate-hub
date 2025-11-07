import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Plus, Building2, Users, Calendar, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-helpers";

// Composant réutilisable pour les cards de statistiques
interface StatCardProps {
    title: string;
    value: number | null;
    loading: boolean;
    subtitle: string;
    icon: React.ReactNode;
    iconBgColor: string;
    suffix?: string;
}

function StatCard({ title, value, loading, subtitle, icon, iconBgColor, suffix = "" }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        {loading || value === null ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <p className="text-2xl font-bold">
                                {value}
                                {suffix}
                            </p>
                        )}
                    </div>
                    <div className={`w-12 h-12 ${iconBgColor} rounded-full flex items-center justify-center`}>{icon}</div>
                </div>
                {loading || value === null ? <Skeleton className="h-4 w-32 mt-2" /> : <p className="text-xs text-muted-foreground mt-2">{subtitle}</p>}
            </CardContent>
        </Card>
    );
}

export default function DashboardOverview() {
    const router = useRouter();
    const { user, authData } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);

    // États pour les statistiques
    const [stats, setStats] = useState({
        totalListings: null as number | null,
        totalViews: null as number | null,
        revenue: null as number | null,
        activeListings: null as number | null,
        draftListings: null as number | null,
        totalAgencies: null as number | null,
    });

    useEffect(() => {
        loadUserProperties();
    }, [user?.id, authData?.access_token]);

    const loadUserProperties = async () => {
        if (!user?.id || !authData?.access_token) {
            setLoadingStats(false);
            return;
        }

        setLoadingStats(true);
        try {
            // Charger les annonces de l'utilisateur
            const result = await fetchUserProperties(authData.access_token, user.id);

            if (result.success && result.properties) {
                const properties = result.properties;

                // Calculer les statistiques
                const totalListings = properties.length;
                const activeListings = properties.filter((p) => p.status === "published").length;
                const draftListings = properties.filter((p) => p.status === "draft").length;

                // TODO: Les vues viendraient d'une API de statistiques Directus
                const totalViews = 0; // properties.reduce((sum, p) => sum + (p.views || 0), 0);

                // Nombre d'agences
                const totalAgencies = user?.account?.agencies?.length || 0;

                setStats({
                    totalListings,
                    totalViews,
                    revenue: 0, // TODO: API revenus
                    activeListings,
                    draftListings,
                    totalAgencies,
                });

                setProperties(properties);
            } else {
                // En cas d'erreur, définir les stats à 0
                setStats({
                    totalListings: 0,
                    totalViews: 0,
                    revenue: 0,
                    activeListings: 0,
                    draftListings: 0,
                    totalAgencies: user?.account?.agencies?.length || 0,
                });
            }
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            toast.error("Erreur", {
                description: "Impossible de charger les statistiques",
            });
            // En cas d'erreur, définir les stats à 0
            setStats({
                totalListings: 0,
                totalViews: 0,
                revenue: 0,
                activeListings: 0,
                draftListings: 0,
                totalAgencies: user?.account?.agencies?.length || 0,
            });
        } finally {
            setLoadingStats(false);
        }
    };

    const handleCreateListing = () => {
        // Vérifier si l'utilisateur est un annonceur
        if (user?.role?.name !== "Advertiser") {
            router.push("/advertiser");
            toast.info("Devenez annonceur", {
                description: "Vous devez être annonceur pour publier des annonces.",
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

            {/* Statistiques - 3 cards seulement (sans Favoris) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="Total annonces"
                    value={stats.totalListings}
                    loading={loadingStats}
                    subtitle={stats.totalListings === 0 ? "Aucune annonce publiée" : `${stats.totalListings} annonce${stats.totalListings! > 1 ? "s" : ""}`}
                    icon={<Building2 className="h-6 w-6 text-blue-600" />}
                    iconBgColor="bg-blue-100"
                />

                <StatCard
                    title="Vues totales"
                    value={stats.totalViews}
                    loading={loadingStats}
                    subtitle={stats.totalViews === 0 ? "Aucune vue pour le moment" : `${stats.totalViews} vue${stats.totalViews! > 1 ? "s" : ""}`}
                    icon={<Eye className="h-6 w-6 text-green-600" />}
                    iconBgColor="bg-green-100"
                />

                <StatCard
                    title="Revenus"
                    value={stats.revenue}
                    loading={loadingStats}
                    subtitle={stats.revenue === 0 ? "Aucun revenu généré" : "Revenus générés"}
                    icon={<DollarSign className="h-6 w-6 text-yellow-600" />}
                    iconBgColor="bg-yellow-100"
                    suffix=" FCFA"
                />
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
                                {loadingStats ? <Skeleton className="h-5 w-8" /> : <Badge variant="secondary">{stats.activeListings}</Badge>}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">En brouillon</span>
                                {loadingStats ? <Skeleton className="h-5 w-8" /> : <Badge variant="outline">{stats.draftListings}</Badge>}
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
                                <span className="text-sm text-muted-foreground">Mes agences</span>
                                {loadingStats ? <Skeleton className="h-5 w-8" /> : <Badge variant="secondary">{stats.totalAgencies}</Badge>}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Agence actuelle</span>
                                {loadingStats ? (
                                    <Skeleton className="h-5 w-20" />
                                ) : user?.account?.agency ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                        Définie
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Non définie</Badge>
                                )}
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
                    {loadingStats ? (
                        <div className="text-center py-8">
                            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                            <Skeleton className="h-6 w-32 mx-auto mb-2" />
                            <Skeleton className="h-4 w-64 mx-auto mb-6" />
                            <Skeleton className="h-10 w-48 mx-auto" />
                        </div>
                    ) : stats.totalListings === 0 ? (
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
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Vous avez {stats.totalListings} annonce{stats.totalListings! > 1 ? "s" : ""}
                            </h3>
                            <p className="text-muted-foreground mb-6">Continuez à publier pour augmenter votre visibilité.</p>
                            <Button onClick={handleCreateListing} variant="hero">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une nouvelle annonce
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
