import { useState, useEffect, useCallback, useRef } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import SearchFilters from "@/components/sections/SearchFilters";
import ActiveFilters from "@/components/sections/ActiveFilters";
import MobileSearchBar from "@/components/sections/MobileSearchBar";
import { Property } from "@/data/properties";
import { fetchProperties, fetchPropertiesWithFilters, PropertyFilters, PaginatedResponse, fetchGeoZones, GeoZone, zoneNameToSlug } from "@/lib/directus-api";
import { getFirstImageUrl } from "@/lib/property-helpers";
import { usePageLoading } from "@/hooks/use-page-loading";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast-helpers";

interface HomePageProps {
    initialProperties: Property[];
    geoZones: GeoZone[];
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
}

const HomePage = ({ initialProperties, geoZones, seoData }: HomePageProps) => {
    const router = useRouter();
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

        // Initialiser la vue par défaut selon la taille d'écran seulement au montage
        // Une fois que l'utilisateur a choisi une vue, on ne la change plus automatiquement
        if (typeof window !== "undefined") {
            if (window.innerWidth < 768) {
                setView("list");
            } else {
                setView("grid");
            }
        }
    }, []);

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

    // Ref pour éviter les problèmes de closure dans le debounce
    const loadPropertiesRef = useRef(loadProperties);
    loadPropertiesRef.current = loadProperties;

    // Gestion des query params pour les communes, zone, contractType et le plan
    useEffect(() => {
        if (router.isReady) {
            const { communes, areas, zone, contractType, plan, propertyType, minPrice, maxPrice, minSurface, maxSurface, rooms, bathrooms, search } = router.query;
            const updatedFilters: PropertyFilters = {};

            // Gérer les communes (ancien format) ou areas (nouveau format depuis index.tsx)
            const areasParam = areas || communes;
            if (areasParam && typeof areasParam === "string") {
                const areaList = areasParam.split(",").filter(Boolean);
                if (areaList.length > 0) {
                    // Prendre le premier élément (townId unique)
                    updatedFilters.town = areaList[0];
                }
            }

            // Gérer le contractType depuis index.tsx
            // Conversion : vente = "selling", location = "leasing"
            if (contractType && typeof contractType === "string") {
                // Convertir les valeurs de l'interface ("sale"/"rent") vers les valeurs de l'API ("selling"/"leasing")
                if (contractType === "sale") {
                    updatedFilters.contractType = "selling"; // vente → selling
                } else if (contractType === "rent") {
                    updatedFilters.contractType = "leasing"; // location → leasing
                } else {
                    updatedFilters.contractType = contractType;
                }
            }

            // Gérer la zone : convertir le slug en ID de zone
            if (zone && typeof zone === "string") {
                // Trouver la zone par son slug
                const foundZone = geoZones.find((z) => zoneNameToSlug(z.name) === zone);
                if (foundZone) {
                    updatedFilters.zone = foundZone.id;
                }
            }

            // Type de bien
            if (propertyType && typeof propertyType === "string") {
                updatedFilters.propertyType = propertyType;
            }

            // Prix
            if (minPrice && typeof minPrice === "string") {
                const min = parseFloat(minPrice);
                if (!isNaN(min)) updatedFilters.minPrice = min;
            }
            if (maxPrice && typeof maxPrice === "string") {
                const max = parseFloat(maxPrice);
                if (!isNaN(max)) updatedFilters.maxPrice = max;
            }

            // Surface
            if (minSurface && typeof minSurface === "string") {
                const min = parseFloat(minSurface);
                if (!isNaN(min)) updatedFilters.minSurface = min;
            }
            if (maxSurface && typeof maxSurface === "string") {
                const max = parseFloat(maxSurface);
                if (!isNaN(max)) updatedFilters.maxSurface = max;
            }

            // Pièces
            if (rooms && typeof rooms === "string") {
                const roomsNum = parseInt(rooms);
                if (!isNaN(roomsNum)) updatedFilters.rooms = roomsNum;
            }

            // Salles d'eau
            if (bathrooms && typeof bathrooms === "string") {
                const bathroomsNum = parseInt(bathrooms);
                if (!isNaN(bathroomsNum)) updatedFilters.bathrooms = bathroomsNum;
            }

            // Recherche
            if (search && typeof search === "string") {
                updatedFilters.search = search;
                setSearchQuery(search);
            }

            // Détecter le paramètre plan (VIP/Kylimmo)
            if (plan && typeof plan === "string") {
                updatedFilters.planCode = plan;
                updatedFilters.limit = 10; // Limite à 10 pour la pagination
                updatedFilters.page = 1; // Réinitialiser à la page 1
            }

            // Appliquer les filtres si des paramètres ont été détectés
            if (Object.keys(updatedFilters).length > 0) {
                setFilters((prev) => {
                    const mergedFilters = { ...prev, ...updatedFilters };
                    // Charger les propriétés avec les nouveaux filtres
                    loadPropertiesRef.current(mergedFilters);
                    return mergedFilters;
                });
            }
        }
    }, [router.isReady, router.query, geoZones]);

    // Initialiser une seule fois au montage
    useEffect(() => {
        if (!hasInitialized) {
            console.log("[DEBUG] Initializing with initial properties");
            setHasInitialized(true);
            // Pas besoin de charger les propriétés, on utilise déjà initialProperties
        }
    }, [hasInitialized]);

    // Fonction pour synchroniser les filtres avec l'URL
    const syncFiltersToUrl = (filtersToSync: PropertyFilters) => {
        const query: Record<string, string> = {};

        // Zone : convertir l'ID en slug
        if (filtersToSync.zone) {
            const zone = geoZones.find((z) => z.id === filtersToSync.zone);
            if (zone) {
                query.zone = zoneNameToSlug(zone.name);
            }
        }

        // Commune/Département
        if (filtersToSync.town) {
            query.areas = filtersToSync.town;
        }

        // Type de transaction : convertir vers le format URL
        if (filtersToSync.contractType) {
            if (filtersToSync.contractType === "selling" || filtersToSync.contractType === "sale") {
                query.contractType = "sale";
            } else if (filtersToSync.contractType === "leasing" || filtersToSync.contractType === "rent") {
                query.contractType = "rent";
            }
        }

        // Type de bien
        if (filtersToSync.propertyType) {
            query.propertyType = filtersToSync.propertyType;
        }

        // Prix
        if (filtersToSync.minPrice !== undefined) {
            query.minPrice = filtersToSync.minPrice.toString();
        }
        if (filtersToSync.maxPrice !== undefined) {
            query.maxPrice = filtersToSync.maxPrice.toString();
        }

        // Surface
        if (filtersToSync.minSurface !== undefined) {
            query.minSurface = filtersToSync.minSurface.toString();
        }
        if (filtersToSync.maxSurface !== undefined) {
            query.maxSurface = filtersToSync.maxSurface.toString();
        }

        // Pièces
        if (filtersToSync.rooms !== undefined) {
            query.rooms = filtersToSync.rooms.toString();
        }

        // Salles d'eau
        if (filtersToSync.bathrooms !== undefined) {
            query.bathrooms = filtersToSync.bathrooms.toString();
        }

        // Recherche
        if (filtersToSync.search) {
            query.search = filtersToSync.search;
        }

        // Page
        if (filtersToSync.page && filtersToSync.page > 1) {
            query.page = filtersToSync.page.toString();
        }

        // Mettre à jour l'URL sans recharger la page
        router.push(
            {
                pathname: router.pathname,
                query,
            },
            undefined,
            { shallow: true }
        );
    };

    // Gérer l'application des filtres
    const handleApplyFilters = (newFilters: PropertyFilters) => {
        // Combiner avec les filtres existants (recherche, etc.)
        const updatedFilters = { ...filters, ...newFilters, page: 1 };
        setFilters(updatedFilters);
        syncFiltersToUrl(updatedFilters);
        loadPropertiesRef.current(updatedFilters);
    };

    // Fonction pour calculer le nombre de filtres actifs
    const calculateActiveFiltersCount = (filters: PropertyFilters) => {
        let count = 0;

        // Filtres simples
        if (filters.search) count++;
        // Zone et town comptent séparément
        if (filters.zone) count++;
        if (filters.town) count++;
        if (filters.contractType) count++;
        if (filters.propertyType) count++;
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
        } else if (filterKey === "zone") {
            // Supprimer zone et town ensemble (quand zone est supprimée, town aussi)
            delete updatedFilters.zone;
            delete updatedFilters.town;
        } else if (filterKey === "town") {
            // Supprimer seulement town
            delete updatedFilters.town;
        } else {
            delete updatedFilters[filterKey as keyof PropertyFilters];
        }

        updatedFilters.page = 1;
        setFilters(updatedFilters);
        syncFiltersToUrl(updatedFilters);
        loadPropertiesRef.current(updatedFilters);
    };

    // Gérer la suppression de tous les filtres
    const handleClearAllFilters = () => {
        setFilters({});
        setSearchQuery("");
        setProperties(initialProperties);
        setPagination({ total: initialProperties.length, page: 1, totalPages: 1 });
        // Réinitialiser l'URL
        router.push(
            {
                pathname: router.pathname,
                query: {},
            },
            undefined,
            { shallow: true }
        );
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

    // Calculer le comptage des filtres dès qu'ils changent
    useEffect(() => {
        const count = calculateActiveFiltersCount(filters);
        setActiveFiltersCount(count);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // Debounce la recherche avec useEffect
    useEffect(() => {
        console.log("[DEBUG] useEffect searchQuery changed:", searchQuery);
        const timeoutId = setTimeout(() => {
            const trimmedQuery = searchQuery?.trim();
            if (trimmedQuery && trimmedQuery.length > 0) {
                console.log("[DEBUG] Calling loadProperties with searchQuery:", trimmedQuery);
                setFilters((currentFilters) => {
                    const updatedFilters = { ...currentFilters, search: trimmedQuery, page: 1 };
                    syncFiltersToUrl(updatedFilters);
                    loadPropertiesRef.current(updatedFilters);
                    return updatedFilters;
                });
            } else if (searchQuery === "" || (searchQuery && searchQuery.trim() === "")) {
                // Si la recherche est vide, supprimer seulement le filtre de recherche
                console.log("[DEBUG] Clearing search filter");
                setFilters((currentFilters) => {
                    const { search, ...filtersWithoutSearch } = currentFilters;
                    syncFiltersToUrl(filtersWithoutSearch);
                    loadPropertiesRef.current(filtersWithoutSearch);
                    return filtersWithoutSearch;
                });
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

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
                <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} geoZones={geoZones} />

                <div className="relative">
                    <SearchFilters
                        isOpen={showFilters}
                        onClose={() => setShowFilters(false)}
                        onFiltersChange={setActiveFiltersCount}
                        onReset={handleReset}
                        onApplyFilters={handleApplyFilters}
                        currentFilters={filters}
                        geoZones={geoZones}
                    />
                    <div className={`transition-all duration-300 ${showFilters ? "ml-80" : "ml-0"}`}>
                        <FeaturedProperties properties={properties} pagination={pagination} onPageChange={handlePageChange} view={view} isLoading={isLoading || showLoading} />
                    </div>
                </div>
            </div>
        </>
    );
};

// Fonction pour générer les données SEO
function generateSeoData(baseUrl: string) {
    return {
        title: "Annonces immobilières - Kylimmo",
        description: "Découvrez toutes nos annonces immobilières en Côte d'Ivoire. Appartements, maisons, villas, terrains et biens commerciaux à vendre ou à louer.",
        keywords: "annonces immobilières, immobilier côte d'ivoire, abidjan, appartement, maison, villa, terrain, commercial, location, vente",
        canonicalUrl: `${baseUrl}/properties`,
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

        // Récupérer les zones géographiques depuis l'API
        const geoZones = await fetchGeoZones();

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
                geoZones: geoZones || [],
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
                geoZones: [],
                seoData: generateSeoData(baseUrl),
            },
        };
    }
};

export default HomePage;
