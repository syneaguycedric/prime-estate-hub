import { useState } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import ZoneSelector from "@/components/sections/ZoneSelector";
import CommuneSelector from "@/components/sections/CommuneSelector";
import HomeHeader from "@/components/layout/HomeHeader";

interface HomePageProps {
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
}

const HomePage = ({ seoData }: HomePageProps) => {
    const router = useRouter();
    const [showCommunes, setShowCommunes] = useState(false);

    const handleZoneSelect = (zone: "abidjan" | "hors-abidjan") => {
        if (zone === "abidjan") {
            setShowCommunes(true);
        } else {
            // Rediriger directement vers la page des propriétés pour "Hors d'Abidjan"
            router.push("/properties?zone=hors-abidjan");
        }
    };

    const handleCommuneSearch = (communes: string[]) => {
        // Construire l'URL avec les communes sélectionnées
        const communeParams = communes.join(",");
        router.push(`/properties?communes=${communeParams}`);
    };

    const handleBackToZoneSelection = () => {
        setShowCommunes(false);
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
                <meta property="og:image" content="/assets/hero-immobilier.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Kylimmo - Trouvez votre bien immobilier en Côte d'Ivoire" />

                {/* Twitter Card */}
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content="/assets/hero-immobilier.jpg" />
                <meta name="twitter:card" content="summary_large_image" />

                {/* Preload de l'image principale */}
                <link rel="preload" as="image" href="/assets/hero-immobilier.jpg" />

                {/* Structured Data - Organization */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Kylimmo",
                            description: "Plateforme immobilière leader en Côte d'Ivoire",
                            url: seoData.canonicalUrl,
                            logo: `${seoData.canonicalUrl}/assets/logo.png`,
                            sameAs: ["https://facebook.com/kylimmo", "https://twitter.com/kylimmo", "https://linkedin.com/company/kylimmo"],
                            contactPoint: {
                                "@type": "ContactPoint",
                                telephone: "+225-XX-XX-XX-XX",
                                contactType: "customer service",
                                areaServed: "CI",
                                availableLanguage: "French",
                            },
                            areaServed: {
                                "@type": "Country",
                                name: "Côte d'Ivoire",
                            },
                            serviceType: "Real Estate Services",
                        }),
                    }}
                />
            </Head>

            <div className="min-h-screen bg-background">
                <HomeHeader />

                {/* Zone Selection - Always visible */}
                <ZoneSelector onZoneSelect={handleZoneSelect} />

                {/* Communes Selection - Appears below when Abidjan is selected */}
                <AnimatePresence>
                    {showCommunes && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{
                                duration: 0.6,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                delay: 0.2,
                            }}
                            className="relative z-10"
                        >
                            <CommuneSelector onBack={handleBackToZoneSelection} onSearch={handleCommuneSearch} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

// Fonction pour générer les données SEO
function generateSeoData(baseUrl: string) {
    return {
        title: "Kylimmo - Trouvez votre bien immobilier en Côte d'Ivoire",
        description:
            "Recherchez des biens immobiliers à Abidjan et partout en Côte d'Ivoire. Plus de 3,700 annonces disponibles : appartements, maisons, villas, terrains et biens commerciaux.",
        keywords: "immobilier côte d'ivoire, abidjan, appartement, maison, villa, terrain, commercial, location, vente, kylimmo",
        canonicalUrl: baseUrl,
    };
}

// Server-Side Rendering pour la page d'accueil
export const getServerSideProps: GetServerSideProps<HomePageProps> = async (context) => {
    try {
        // Construire l'URL de base
        const protocol = context.req.headers["x-forwarded-proto"] || "http";
        const host = context.req.headers["x-forwarded-host"] || context.req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        // Génération des données SEO
        const seoData = generateSeoData(baseUrl);

        // Headers pour la mise en cache - longue durée pour la page d'accueil
        context.res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");

        return {
            props: {
                seoData,
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps for homepage:", error);

        // En cas d'erreur, retourner les données de base
        const baseUrl = "https://kylimmo.com";
        const seoData = generateSeoData(baseUrl);

        return {
            props: {
                seoData,
            },
        };
    }
};

export default HomePage;
