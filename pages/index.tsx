import { useState, useEffect, useCallback, useRef } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/sections/SearchFilters";
import ActiveFilters from "@/components/sections/ActiveFilters";
import MobileSearchBar from "@/components/sections/MobileSearchBar";
import { Property } from "@/data/properties";
import { fetchProperties, fetchPropertiesWithFilters, PropertyFilters, PaginatedResponse } from "@/lib/directus-api";
import { getFirstImageUrl } from "@/lib/property-helpers";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast-helpers";

interface HomePageProps {
    initialProperties: Property[];
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
}

const HomePage = ({ initialProperties, seoData }: HomePageProps) => {
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const { showLoading } = usePageLoading();
    const { isAuthenticated } = useAuth();

    // État pour les filtres et la pagination
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [properties, setProperties] = useState<Property[]>(initialProperties);
    const [pagination, setPagination] = useState({ total: initialProperties.length, page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);

    // Définir la vue par défaut selon la taille de l'écran avec gestion SSR
    const [view, setView] = useState<"grid" | "list">("grid");
    const [mounted, setMounted] = useState(false);

    // Gestion de l'hydratation côté client pour éviter les erreurs SSR
    useEffect(() => {
        setMounted(true);

        // Ajuster la vue selon la taille d'écran seulement côté client
        const handleResize = () => {
            if (typeof window !== "undefined") {
                if (window.innerWidth < 768) {
                    setView("list");
                } else if (view === "list" && window.innerWidth >= 768) {
                    setView("grid");
                }
            }
        };

        // Initial check
        handleResize();

        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", handleResize);
            }
        };
    }, []);

    // Écouter les changements de taille d'écran pour ajuster la vue par défaut
    useEffect(() => {
        if (!mounted) return;

        const handleResize = () => {
            if (typeof window !== "undefined") {
                if (window.innerWidth < 768 && view === "grid") {
                    setView("list");
                }
            }
        };

        if (typeof window !== "undefined") {
            window.addEventListener("resize", handleResize);
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener("resize", handleResize);
            }
        };
    }, [view, mounted]);

    // Fonction pour charger les propriétés avec filtres
    const loadProperties = useCallback(async (newFilters: PropertyFilters) => {
        console.log("[DEBUG] loadProperties called with filters:", newFilters);
        setIsLoading(true);
        try {
            const result = await fetchPropertiesWithFilters(newFilters);
            setProperties(result.properties);
            setPagination({
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
            });
        } catch (error) {
            console.error("Error loading properties:", error);
            // L'erreur est déjà gérée par fetchPropertiesWithFilters avec un toast
            // On affiche juste une liste vide
            setProperties([]);
            setPagination({ total: 0, page: 1, totalPages: 0 });
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initialiser une seule fois au montage
    useEffect(() => {
        if (!hasInitialized) {
            console.log("[DEBUG] Initializing with initial properties");
            setHasInitialized(true);
            // Pas besoin de charger les propriétés, on utilise déjà initialProperties
        }
    }, [hasInitialized]);

    // Ref pour éviter les problèmes de closure dans le debounce
    const loadPropertiesRef = useRef(loadProperties);
    loadPropertiesRef.current = loadProperties;

    // Gérer l'application des filtres
    const handleApplyFilters = (newFilters: PropertyFilters) => {
        // Combiner avec les filtres existants (recherche, etc.)
        const updatedFilters = { ...filters, ...newFilters, page: 1 };
        setFilters(updatedFilters);
        loadPropertiesRef.current(updatedFilters);
    };

    // Fonction pour calculer le nombre de filtres actifs
    const calculateActiveFiltersCount = (filters: PropertyFilters) => {
        let count = 0;

        // Filtres simples
        if (filters.search) count++;
        if (filters.location) count++;
        if (filters.contractType) count++;
        if (filters.type) count++;
        if (filters.rooms) count++;
        if (filters.bathrooms) count++;

        // Filtres de range
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++;
        if (filters.minSurface !== undefined || filters.maxSurface !== undefined) count++;

        return count;
    };

    // Gérer la suppression d'un filtre individuel
    const handleRemoveFilter = (filterKey: string) => {
        const updatedFilters = { ...filters };

        if (filterKey === "search") {
            delete updatedFilters.search;
            setSearchQuery("");
        } else if (filterKey === "price") {
            delete updatedFilters.minPrice;
            delete updatedFilters.maxPrice;
        } else if (filterKey === "surfaceArea") {
            delete updatedFilters.minSurface;
            delete updatedFilters.maxSurface;
        } else {
            delete updatedFilters[filterKey as keyof PropertyFilters];
        }

        updatedFilters.page = 1;
        setFilters(updatedFilters);

        // Mettre à jour le compteur de filtres actifs
        const newCount = calculateActiveFiltersCount(updatedFilters);
        setActiveFiltersCount(newCount);

        loadPropertiesRef.current(updatedFilters);
    };

    // Gérer la suppression de tous les filtres
    const handleClearAllFilters = () => {
        setFilters({});
        setSearchQuery("");
        setActiveFiltersCount(0); // Réinitialiser le compteur
        setProperties(initialProperties);
        setPagination({ total: initialProperties.length, page: 1, totalPages: 1 });
    };

    // Gérer le changement de page
    const handlePageChange = (page: number) => {
        const updatedFilters = { ...filters, page };
        setFilters(updatedFilters);
        loadPropertiesRef.current(updatedFilters);
    };

    // Gérer la recherche (avec debounce)
    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    // Debounce la recherche avec useEffect
    useEffect(() => {
        console.log("[DEBUG] useEffect searchQuery changed:", searchQuery);
        const timeoutId = setTimeout(() => {
            const trimmedQuery = searchQuery?.trim();
            if (trimmedQuery && trimmedQuery.length > 0) {
                console.log("[DEBUG] Calling loadProperties with searchQuery:", trimmedQuery);
                setFilters((currentFilters) => {
                    const updatedFilters = { ...currentFilters, search: trimmedQuery, page: 1 };
                    loadPropertiesRef.current(updatedFilters);
                    return updatedFilters;
                });
            } else if (searchQuery === "" || (searchQuery && searchQuery.trim() === "")) {
                // Si la recherche est vide, supprimer seulement le filtre de recherche
                console.log("[DEBUG] Clearing search filter");
                setFilters((currentFilters) => {
                    const { search, ...filtersWithoutSearch } = currentFilters;
                    loadPropertiesRef.current(filtersWithoutSearch);
                    return filtersWithoutSearch;
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, initialProperties]);

    const handleReset = () => {
        setSearchQuery(undefined);
        setActiveFiltersCount(0);
        setFilters({});
        setProperties(initialProperties);
        setPagination({ total: initialProperties.length, page: 1, totalPages: 1 });
    };

    return (
        <>
            <Head>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <link rel="canonical" href={seoData.canonicalUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:url" content={seoData.canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:image" content={`${seoData.canonicalUrl}/og-image.jpg`} />

                {/* Twitter Card */}
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={`${seoData.canonicalUrl}/twitter-image.jpg`} />

                {/* Structured Data - WebSite */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebSite",
                            name: "Kylimmo",
                            url: seoData.canonicalUrl,
                            description: seoData.description,
                            potentialAction: {
                                "@type": "SearchAction",
                                target: {
                                    "@type": "EntryPoint",
                                    urlTemplate: `${seoData.canonicalUrl}/recherche?q={search_term_string}`,
                                },
                                "query-input": "required name=search_term_string",
                            },
                            mainEntity: {
                                "@type": "ItemList",
                                numberOfItems: initialProperties.length,
                                itemListElement: initialProperties.slice(0, 3).map((property, index) => ({
                                    "@type": "ListItem",
                                    position: index + 1,
                                    item: {
                                        "@type": "RealEstateAgent",
                                        name: property.title,
                                        description: `${property.type} - ${property.surfaceArea} ${property.surfaceAreaUnit} à ${property.location}`,
                                        url: `${seoData.canonicalUrl}/biens/${property.id}`,
                                        image: getFirstImageUrl(property),
                                        priceRange: property.price,
                                        address: {
                                            "@type": "PostalAddress",
                                            addressLocality: property.location.split(", ")[0],
                                            addressRegion: property.location.split(", ")[1] || property.location.split(", ")[0],
                                            addressCountry: "CI",
                                        },
                                    },
                                })),
                            },
                        }),
                    }}
                />

                {/* Prefetch des pages importantes */}
                <link rel="prefetch" href="/biens" />
                <link rel="prefetch" href="/contact" />

                {/* Preload des images critiques */}
                {initialProperties.slice(0, 3).map((property, index) => (
                    <link key={property.id} rel="preload" as="image" href={getFirstImageUrl(property)} media={index === 0 ? "(min-width: 768px)" : "(min-width: 1024px)"} />
                ))}
            </Head>

            <div className="min-h-screen bg-background">
                <Header
                    onOpenFilters={() => setShowFilters(true)}
                    onSearch={handleSearch}
                    onReset={handleReset}
                    view={view}
                    onViewChange={setView}
                    activeFiltersCount={activeFiltersCount}
                    searchQuery={searchQuery}
                />
                <MobileSearchBar
                    onSearch={handleSearch}
                    onOpenFilters={() => setShowFilters(true)}
                    onReset={handleReset}
                    activeFiltersCount={activeFiltersCount}
                    searchQuery={searchQuery}
                />

                {/* Filtres actifs avec badges supprimables */}
                <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} />

                <div className="relative">
                    <SearchFilters
                        isOpen={showFilters}
                        onClose={() => setShowFilters(false)}
                        onFiltersChange={setActiveFiltersCount}
                        onReset={handleReset}
                        onApplyFilters={handleApplyFilters}
                        currentFilters={filters}
                    />
                    <div className={`transition-all duration-300 ${showFilters ? "ml-80" : "ml-0"}`}>
                        <FeaturedProperties properties={properties} pagination={pagination} onPageChange={handlePageChange} view={view} isLoading={isLoading || showLoading} />
                        <Footer />
                    </div>
                </div>
            </div>
        </>
    );
};

// Fonction pour générer les données SEO
function generateSeoData(baseUrl: string) {
    return {
        title: "Kylimmo - Plateforme Immobilière Moderne en Côte d'Ivoire",
        description:
            "Découvrez les meilleurs biens immobiliers en Côte d'Ivoire. Appartements, maisons, villas à louer et à vendre à Abidjan, Yamoussoukro et dans toute la Côte d'Ivoire.",
        keywords:
            "immobilier côte d'ivoire, appartement abidjan, maison yamoussoukro, villa cocody, location abidjan, vente immobilière, plateforme immobilière, biens immobiliers CI",
        canonicalUrl: baseUrl,
    };
}

// Server-Side Rendering avec optimisations
export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
    try {
        // Construire l'URL de base
        const protocol = context.req.headers["x-forwarded-proto"] || "http";
        const host = context.req.headers["x-forwarded-host"] || context.req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        // Récupérer les propriétés depuis l'API Directus
        const initialProperties = await fetchProperties();

        // Génération des données SEO
        const seoData = generateSeoData(baseUrl);

        // Simulation d'un délai de réseau (à retirer en production)
        if (process.env.NODE_ENV === "development") {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Headers pour la mise en cache
        context.res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");

        return {
            props: {
                initialProperties,
                seoData,
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps:", error);

        // Fallback en cas d'erreur
        const baseUrl = "https://kylimmo.com"; // URL par défaut

        // En cas d'erreur, utiliser les données mockées
        const { properties } = await import("@/data/properties");
        const fallbackProperties = properties.slice(0, 12).map((property) => ({
            ...property,
            // Optimisation: ne garder que les données essentielles pour la page d'accueil
            images: [property.images[0]], // Seulement la première image
        }));

        return {
            props: {
                initialProperties: fallbackProperties,
                seoData: generateSeoData(baseUrl),
            },
        };
    }
};

export default HomePage;
