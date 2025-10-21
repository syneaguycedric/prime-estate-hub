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
import BecomeAdvertiser from "@/components/dashboard/BecomeAdvertiser";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { toast } from "@/lib/toast-helpers";

export default function MyListingsPage() {
    const router = useRouter();
    const { isAuthenticated, authData, user } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
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
    }, [authData, user, isAuthenticated, router.query]);

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
            case "advertiser":
                return <BecomeAdvertiser />;
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
