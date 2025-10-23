import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import Footer from "@/components/layout/Footer";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ListingsDataTable from "@/components/dashboard/ListingsDataTable";
import AgenciesManager from "@/components/dashboard/AgenciesManager";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { toast } from "@/lib/toast-helpers";

export default function MyListingsPage() {
    const router = useRouter();
    const { isAuthenticated, authData, user, isLoading } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        // Ne rien faire pendant le chargement initial de l'auth
        if (isLoading) return;

        // Maintenant on peut vérifier en toute sécurité
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Vérifier si l'utilisateur est annonceur
        if (user && user.account?.account_type !== "advertiser") {
            toast.info("Accès restreint", {
                description: "Cette page est réservée aux annonceurs. Devenez annonceur pour y accéder.",
                duration: 5000,
            });
            router.push("/advertiser");
            return;
        }

        // Déterminer l'onglet actif depuis l'URL
        const { tab } = router.query;
        if (tab && typeof tab === "string") {
            setActiveTab(tab);
        }

        if (authData?.access_token && user?.id) {
            loadUserProperties();
        }
    }, [authData, user, isAuthenticated, isLoading, router.query]);

    const loadUserProperties = async () => {
        if (!authData?.access_token || !user?.id) return;

        setLoading(true);
        try {
            const result = await fetchUserProperties(authData.access_token, user.id);

            if (result.success && result.properties) {
                setProperties(result.properties);
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de charger vos annonces",
                });
            }
        } catch (error) {
            console.error("Error loading user properties:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        loadUserProperties();
    };

    const renderContent = () => {
        // Afficher un loader pendant le chargement de l'authentification
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground">Chargement de votre espace...</p>
                    </div>
                </div>
            );
        }

        if (loading) {
            return <DashboardSkeleton />;
        }

        switch (activeTab) {
            case "dashboard":
                return <DashboardOverview />;
            case "listings":
                return <ListingsDataTable properties={properties} loading={loading} onRefresh={handleRefresh} />;
            case "agencies":
                return <AgenciesManager />;
            default:
                return <DashboardOverview />;
        }
    };

    return (
        <>
            <Head>
                <title>Mon espace - Kylimmo</title>
                <meta name="description" content="Gérez votre espace personnel et vos annonces" />
            </Head>

            <DashboardLayout activeTab={activeTab}>{renderContent()}</DashboardLayout>

            <Footer />
        </>
    );
}
