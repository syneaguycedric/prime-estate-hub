import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserProperties, PaginatedResponse, UserPropertiesFilters } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import ListingsDataTable, { ListingsFilters } from "@/components/dashboard/ListingsDataTable";
import AgenciesManager from "@/components/dashboard/AgenciesManager";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { toast } from "@/lib/toast-helpers";

const ITEMS_PER_PAGE = 10;

export default function MyListingsPage() {
    const router = useRouter();
    const { isAuthenticated, authData, user, isLoading } = useAuth();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState<Pick<PaginatedResponse, 'total' | 'totalPages'>>({ total: 0, totalPages: 0 });
    const [filters, setFilters] = useState<ListingsFilters>({});
    const prevFiltersRef = useRef<string>("");

    // Déterminer l'onglet actif depuis l'URL
    const activeTab = useMemo(() => {
        const { tab } = router.query;
        return tab && typeof tab === "string" ? tab : "dashboard";
    }, [router.query.tab]);

    useEffect(() => {
        // Ne rien faire pendant le chargement initial de l'auth
        if (isLoading) return;

        // Maintenant on peut vérifier en toute sécurité
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Vérifier si l'utilisateur est annonceur
        if (user && user.role?.code !== "ADVERTISER") {
            toast.info("Accès restreint", {
                description: "Cette page est réservée aux annonceurs. Devenez annonceur pour y accéder.",
                duration: 5000,
            });
            router.push("/advertiser");
            return;
        }

        // Charger les propriétés seulement au montage initial ou quand on change d'onglet vers listings
        if (authData?.access_token && user?.id && activeTab === "listings") {
            loadUserProperties(1, {});
        }
    }, [authData, user, isAuthenticated, isLoading, activeTab]);

    // Recharger quand les filtres changent
    useEffect(() => {
        if (authData?.access_token && user?.id && activeTab === "listings") {
            const filtersKey = JSON.stringify(filters);
            // Comparer avec les filtres précédents pour éviter les rechargements inutiles
            if (prevFiltersRef.current === filtersKey) {
                return; // Pas de changement, ne pas recharger
            }
            prevFiltersRef.current = filtersKey;
            loadUserProperties(1, filters);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const loadUserProperties = async (page: number, filtersToApply: ListingsFilters = filters) => {
        if (!authData?.access_token || !user?.id) return;

        setLoading(true);
        try {
            const apiFilters: UserPropertiesFilters = {
                search: filtersToApply.search,
                status: filtersToApply.status,
                type: filtersToApply.type
            };

            const result = await fetchUserProperties(authData.access_token, user.id, page, ITEMS_PER_PAGE, apiFilters);

            if (result.properties) {
                setProperties(result.properties);
                setPaginationData({ total: result.total, totalPages: result.totalPages });
                setCurrentPage(page);
            } else {
                toast.error("Erreur", {
                    description: "Impossible de charger vos annonces",
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
        loadUserProperties(currentPage, filters);
    };

    const handlePageChange = (page: number) => {
        loadUserProperties(page, filters);
    };

    const handleFiltersChange = useCallback((newFilters: ListingsFilters) => {
        setFilters(newFilters);
    }, []);

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
                        return (
                            <ListingsDataTable
                                properties={properties}
                                loading={loading}
                                onRefresh={handleRefresh}
                                currentPage={currentPage}
                                totalPages={paginationData.totalPages}
                                total={paginationData.total}
                                onPageChange={handlePageChange}
                                filters={filters}
                                onFiltersChange={handleFiltersChange}
                            />
                        );
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
        </>
    );
}
