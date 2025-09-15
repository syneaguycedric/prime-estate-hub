import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/sections/SearchFilters";
import MobileSearchBar from "@/components/sections/MobileSearchBar";
import { properties, Property } from "@/data/properties";
import { usePageLoading } from "@/hooks/use-page-loading";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const { showLoading } = usePageLoading();

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

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleReset = () => {
        setSearchQuery("");
        setActiveFiltersCount(0);
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
                                        description: `${property.type} - ${property.surface} à ${property.location}`,
                                        url: `${seoData.canonicalUrl}/biens/${property.id}`,
                                        image: property.images[0],
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
                    <link key={property.id} rel="preload" as="image" href={property.images[0]} media={index === 0 ? "(min-width: 768px)" : "(min-width: 1024px)"} />
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
                />
                <MobileSearchBar onSearch={handleSearch} onOpenFilters={() => setShowFilters(true)} onReset={handleReset} activeFiltersCount={activeFiltersCount} />
                <div className="relative">
                    <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} onFiltersChange={setActiveFiltersCount} onReset={handleReset} />
                    <div className={`transition-all duration-300 ${showFilters ? "ml-80" : "ml-0"}`}>
                        <FeaturedProperties searchQuery={searchQuery} view={view} initialProperties={initialProperties} isLoading={showLoading} />
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

        // Simulation d'un appel API pour récupérer les propriétés
        // En production, ceci ferait appel à une vraie base de données
        const initialProperties = properties.map((property) => ({
            ...property,
            // Optimisation: ne garder que les données essentielles pour la page d'accueil
            images: [property.images[0]], // Seulement la première image
        }));

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

        return {
            props: {
                initialProperties: properties.slice(0, 12), // Données de fallback
                seoData: generateSeoData(baseUrl),
            },
        };
    }
};

export default HomePage;
