import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { TrendingUp, Eye, Plus, Building2, Users, Calendar, Banknote, MapPin, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties, Agency } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-helpers";
import { formatPriceOnly, getPropertyTypeLabel, getContractTypeLabel, getFirstImageUrlForCard } from "@/lib/property-helpers";
import ImageWithLoading from "@/components/ui/image-with-loading";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

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
            <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">{title}</p>
                        {loading || value === null ? (
                            <Skeleton className="h-5 md:h-6 w-12 md:w-16 mt-1" />
                        ) : (
                            <p className="text-lg md:text-xl font-bold">
                                {value}
                                {suffix}
                            </p>
                        )}
                    </div>
                    <div className={`w-8 h-8 md:w-10 md:h-10 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <div className="scale-75 md:scale-90">{icon}</div>
                    </div>
                </div>
                {loading || value === null ? <Skeleton className="h-3 w-20 md:w-24 mt-1.5" /> : <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
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
        rejectedListings: null as number | null,
        boostedListings: null as number | null,
        expiringSoonListings: null as number | null,
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
                const rejectedListings = properties.filter((p) => p.status === "rejected").length;

                // Annonces boostées (promotions avec status "in_progress")
                const boostedListings = properties.filter((p) => {
                    if (!p.promotions || p.promotions.length === 0) return false;
                    return p.promotions.some((promo) => promo.promotions_id?.status === "in_progress");
                }).length;

                // Annonces qui expirent bientôt (statut "expired")
                const expiringSoonListings = properties.filter((p) => p.status === "expired").length;

                // TODO: Les vues viendraient d'une API de statistiques Directus
                const totalViews = 0; // properties.reduce((sum, p) => sum + (p.views || 0), 0);

                setStats({
                    totalListings,
                    totalViews,
                    revenue: 0, // TODO: API revenus
                    activeListings,
                    draftListings,
                    rejectedListings,
                    boostedListings,
                    expiringSoonListings,
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
                    rejectedListings: 0,
                    boostedListings: 0,
                    expiringSoonListings: 0,
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
                rejectedListings: 0,
            });
        } finally {
            setLoadingStats(false);
        }
    };

    const handleCreateListing = () => {
        // Vérifier si l'utilisateur est un annonceur
        if (user?.role?.code !== "ADVERTISER") {
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

    // Récupérer les 3 dernières annonces publiées (réduit pour éviter le scroll)
    const recentPublishedProperties = useMemo(() => {
        if (!properties || properties.length === 0) return [];

        return properties
            .filter((p) => p.status === "published")
            .sort((a, b) => {
                const dateA = new Date(a.date_created || 0).getTime();
                const dateB = new Date(b.date_created || 0).getTime();
                return dateB - dateA; // Plus récent en premier
            })
            .slice(0, 3);
    }, [properties]);

    const { navigateWithTransition } = useNavigationTransition();

    const handlePropertyClick = (propertyId: string) => {
        navigateWithTransition(`/biens/${propertyId}`);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    // Récupérer l'agence actuelle
    // Try root-level agency first, fallback to account.agency for backward compatibility
    const currentAgency = user?.agency && typeof user.agency === "object" && "id" in user.agency ? (user.agency as Agency) : user?.account?.agency;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-3 md:space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-bold">Dashboard</h2>
                    <p className="text-xs md:text-sm text-muted-foreground">Bienvenue dans votre espace personnel, {user?.first_name || "Utilisateur"}</p>
                </div>
                <Button onClick={handleCreateListing} variant="hero" className="w-full sm:w-auto text-xs md:text-sm h-9 md:h-10">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" />
                    Nouvelle annonce
                </Button>
            </div>

            {/* Statistiques - 3 cards seulement (sans Favoris) - Masqué temporairement */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
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
                    icon={<Banknote className="h-6 w-6 text-yellow-600" />}
                    iconBgColor="bg-yellow-100"
                    suffix=" FCFA"
                />
            </div> */}

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 items-stretch">
                <Card className="flex flex-col h-full">
                    <CardHeader className="p-3 md:p-4">
                        <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                            <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>Mes annonces</span>
                        </CardTitle>
                        <CardDescription className="text-xs">Gérez toutes vos annonces immobilières</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col">
                        <div className="flex flex-col space-y-2 md:space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Annonces actives</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        {stats.activeListings}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">En attente de validation</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        {stats.draftListings}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Annonces rejetées</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                                        {stats.rejectedListings}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Annonces boostées</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
                                        {stats.boostedListings}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Annonces expirées</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-6" />
                                ) : (
                                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                                        {stats.expiringSoonListings}
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-auto pt-2">
                                <Button onClick={handleViewListings} variant="outline" className="w-full h-8 text-xs">
                                    Voir toutes mes annonces
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col h-full">
                    <CardHeader className="p-3 md:p-4">
                        <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            <span>Agences</span>
                        </CardTitle>
                        <CardDescription className="text-xs">Gérez vos agences et partenaires</CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col">
                        <div className="flex flex-col space-y-2 md:space-y-3 flex-1">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Agence actuelle</span>
                                {loadingStats ? (
                                    <Skeleton className="h-4 w-16" />
                                ) : currentAgency ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                        Définie
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-xs">
                                        Non définie
                                    </Badge>
                                )}
                            </div>
                            <div className="mt-auto pt-2">
                                <Button onClick={handleViewAgencies} variant="outline" className="w-full h-8 text-xs">
                                    Gérer les agences
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activité récente */}
            <Card>
                <CardHeader className="p-3 md:p-4">
                    <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                        <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
                        <span>Activité récente</span>
                    </CardTitle>
                    <CardDescription className="text-xs">Vos 3 dernières annonces publiées</CardDescription>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                    {loadingStats ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 rounded-lg" />
                                    <div className="flex-1 space-y-1.5">
                                        <Skeleton className="h-3 w-32" />
                                        <Skeleton className="h-2.5 w-24" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : recentPublishedProperties.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-semibold mb-1">Aucune annonce publiée</h3>
                            <p className="text-xs text-muted-foreground mb-4">Commencez par publier votre première annonce.</p>
                            <Button onClick={handleCreateListing} variant="hero" size="sm" className="h-8 text-xs">
                                <Plus className="h-3 w-3 mr-1.5" />
                                Créer ma première annonce
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentPublishedProperties.map((property) => (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center gap-2.5 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => handlePropertyClick(property.id)}
                                >
                                    {/* Image */}
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <ImageWithLoading src={getFirstImageUrlForCard(property)} alt={property.title} className="object-cover w-full h-full" />
                                    </div>

                                    {/* Informations */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-xs truncate group-hover:text-primary transition-colors">{property.title}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        {getPropertyTypeLabel(property.type)}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        {getContractTypeLabel(property.contractType)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                                            <span className="font-semibold text-foreground">{formatPriceOnly(property.price)}</span>
                                            {property.location && (
                                                <span className="flex items-center gap-0.5 truncate">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    <span className="truncate">{property.location}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {recentPublishedProperties.length > 0 && (
                                <div className="pt-2 border-t border-border">
                                    <Button onClick={handleViewListings} variant="outline" className="w-full h-8 text-xs">
                                        Voir toutes mes annonces
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
