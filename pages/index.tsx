import { useState, useRef, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import ZoneSelector from "@/components/sections/ZoneSelector";
import CommuneSelector from "@/components/sections/CommuneSelector";
import HomeHeader from "@/components/layout/HomeHeader";
import PropertyListCardAnimated from "@/components/ui/property-list-card-animated";
import { properties as mockProperties } from "@/data/properties";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Building2, MapPin, ChevronRight, Star, Check } from "lucide-react";

interface HomePageProps {
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
}

type ContractType = "sale" | "rent";
type PropertyType = "house" | "appartment" | "land";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.1,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15,
        },
    },
};

const hoverVariants = {
    hover: {
        scale: 1.02,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 20,
        },
    },
    tap: {
        scale: 0.98,
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 25,
        },
    },
};

const HomePage = ({ seoData }: HomePageProps) => {
    const router = useRouter();
    const [selectedContract, setSelectedContract] = useState<ContractType | null>(null);
    const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
    const [showZoneSelection, setShowZoneSelection] = useState(false);
    const [showCommuneSelection, setShowCommuneSelection] = useState(false);

    // Refs pour scroll automatique
    const propertyTypeRef = useRef<HTMLDivElement>(null);
    const zoneRef = useRef<HTMLDivElement>(null);
    const communesRef = useRef<HTMLDivElement>(null);

    const handleContractSelect = (contract: ContractType) => {
        setSelectedContract(contract);
        setSelectedPropertyType(null);
        setShowZoneSelection(false);
        setShowCommuneSelection(false);

        // Scroll vers la section type de bien
        setTimeout(() => {
            propertyTypeRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 300);
    };

    const handlePropertyTypeSelect = (propertyType: PropertyType) => {
        setSelectedPropertyType(propertyType);
        setShowZoneSelection(true);
        setShowCommuneSelection(false);

        // Scroll vers la section zone
        setTimeout(() => {
            zoneRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 300);
    };

    const handleZoneSelect = (zone: "abidjan" | "hors-abidjan") => {
        if (zone === "abidjan") {
            setShowCommuneSelection(true);

            // Scroll vers la section communes
            setTimeout(() => {
                communesRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 300);
        } else {
            // Rediriger directement vers la page des propriétés
            const params = new URLSearchParams();
            if (selectedContract) params.set("contractType", selectedContract);
            if (selectedPropertyType) params.set("type", selectedPropertyType);
            params.set("zone", "hors-abidjan");
            router.push(`/properties?${params.toString()}`);
        }
    };

    const handleCommuneSearch = (communes: string[]) => {
        // Construire l'URL avec tous les paramètres
        const params = new URLSearchParams();
        if (selectedContract) params.set("contractType", selectedContract);
        if (selectedPropertyType) params.set("type", selectedPropertyType);
        params.set("communes", communes.join(","));
        router.push(`/properties?${params.toString()}`);
    };

    const handleBackToPropertyType = () => {
        setShowZoneSelection(false);
        setShowCommuneSelection(false);
        propertyTypeRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const handleBackToZone = () => {
        setShowCommuneSelection(false);
        zoneRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const getPropertyTypesForContract = (contract: ContractType): { id: PropertyType; name: string; icon: any; count: number }[] => {
        if (contract === "sale") {
            return [
                { id: "house", name: "Maison", icon: Home, count: 245 },
                { id: "appartment", name: "Appartement", icon: Building2, count: 412 },
                { id: "land", name: "Terrain", icon: MapPin, count: 156 },
            ];
        } else {
            return [
                { id: "house", name: "Maison", icon: Home, count: 189 },
                { id: "appartment", name: "Appartement", icon: Building2, count: 298 },
            ];
        }
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
                <div className="container grid grid-cols-1 lg:grid-cols-4 gap-6 py-8">
                    {/* Colonne gauche - En vedette */}
                    <aside className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">En vedette</h3>
                            <div>
                                {mockProperties.slice(0, 5).map((p, idx) => (
                                    <PropertyListCardAnimated key={p.id} {...p} index={idx} />
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Colonne principale */}
                    <main className="lg:col-span-3 order-1 lg:order-2">
                        {/* Étape 1: Sélection du type de contrat */}
                        <div className="bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center py-16 px-4">
                            <div className="w-full max-w-4xl mx-auto">
                                {/* Hero Section */}
                                <motion.div
                                    className="text-center mb-16"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                                        Que souhaitez-vous faire ?
                                    </h1>
                                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                        Choisissez votre type de transaction pour commencer votre recherche
                                    </p>
                                </motion.div>

                                {/* Contract Cards */}
                                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto" variants={containerVariants} initial="hidden" animate="visible">
                                    {/* Achat Card */}
                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="group cursor-pointer relative"
                                        onClick={() => handleContractSelect("sale")}
                                    >
                                        <Card
                                            className={`relative h-80 overflow-hidden border-2 transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm ${
                                                selectedContract === "sale" ? "border-primary shadow-lg" : "border-transparent group-hover:border-primary/20"
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                                            <div className="absolute top-4 right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

                                            <div className="absolute top-6 left-6 z-10">
                                                <Badge className="bg-primary text-primary-foreground shadow-lg">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Populaire
                                                </Badge>
                                            </div>

                                            <CardContent className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                                                <motion.div className="mb-6">
                                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                                        <Home className="w-10 h-10 text-primary" />
                                                    </div>
                                                </motion.div>

                                                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Acheter</h2>

                                                <p className="text-muted-foreground mb-6 leading-relaxed">Trouvez le bien de vos rêves pour devenir propriétaire</p>

                                                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-6">
                                                    <div className="text-center">
                                                        <div className="font-semibold text-foreground">3</div>
                                                        <div>Types</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-foreground">1,200+</div>
                                                        <div>Annonces</div>
                                                    </div>
                                                </div>

                                                <motion.div className="flex items-center text-primary font-semibold group-hover:text-primary/80 transition-colors duration-300">
                                                    Choisir le type de bien
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>

                                    {/* Location Card */}
                                    <motion.div
                                        variants={cardVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className="group cursor-pointer relative"
                                        onClick={() => handleContractSelect("rent")}
                                    >
                                        <Card
                                            className={`relative h-80 overflow-hidden border-2 transition-all duration-300 bg-gradient-to-br from-card via-card to-accent/5 backdrop-blur-sm ${
                                                selectedContract === "rent" ? "border-primary shadow-lg" : "border-transparent group-hover:border-primary/20"
                                            }`}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
                                            <div className="absolute top-4 right-4 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
                                            <div className="absolute bottom-4 left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />

                                            <CardContent className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                                                <motion.div className="mb-6">
                                                    <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-300">
                                                        <Building2 className="w-10 h-10 text-accent-foreground" />
                                                    </div>
                                                </motion.div>

                                                <h2 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">Louer</h2>

                                                <p className="text-muted-foreground mb-6 leading-relaxed">Trouvez votre prochain logement à louer</p>

                                                <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground mb-6">
                                                    <div className="text-center">
                                                        <div className="font-semibold text-foreground">2</div>
                                                        <div>Types</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="font-semibold text-foreground">800+</div>
                                                        <div>Annonces</div>
                                                    </div>
                                                </div>

                                                <motion.div className="flex items-center text-primary font-semibold group-hover:text-primary/80 transition-colors duration-300">
                                                    Choisir le type de bien
                                                    <ChevronRight className="w-4 h-4 ml-2" />
                                                </motion.div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Étape 2: Sélection du type de bien */}
                        {selectedContract && (
                            <motion.div
                                ref={propertyTypeRef}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <div className="bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
                                    <div className="w-full max-w-6xl mx-auto">
                                        {/* Header */}
                                        <motion.div className="mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                                            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                                                Que souhaitez-vous {selectedContract === "sale" ? "acheter" : "louer"} ?
                                            </h1>
                                            <p className="text-lg text-muted-foreground">Choisissez le type de bien qui correspond à vos besoins</p>
                                        </motion.div>

                                        {/* Property Types Grid */}
                                        <motion.div
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                        >
                                            {getPropertyTypesForContract(selectedContract).map((propertyType, index) => {
                                                const IconComponent = propertyType.icon;
                                                const isSelected = selectedPropertyType === propertyType.id;
                                                return (
                                                    <motion.div
                                                        key={propertyType.id}
                                                        variants={cardVariants}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="group cursor-pointer relative"
                                                        onClick={() => handlePropertyTypeSelect(propertyType.id)}
                                                    >
                                                        <Card
                                                            className={`h-48 overflow-hidden border-2 transition-all duration-300 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm ${
                                                                isSelected ? "border-primary shadow-lg" : "border-transparent group-hover:border-primary/20"
                                                            }`}
                                                        >
                                                            <CardContent className="h-full flex flex-col justify-center items-center text-center p-6">
                                                                <motion.div className="mb-4">
                                                                    <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                                                        <IconComponent className="w-8 h-8 text-primary" />
                                                                    </div>
                                                                </motion.div>

                                                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                                                                    {propertyType.name}
                                                                </h3>

                                                                <p className="text-sm text-muted-foreground mb-4">
                                                                    {propertyType.count} annonce{propertyType.count > 1 ? "s" : ""}
                                                                </p>

                                                                <motion.div className="flex items-center text-primary font-semibold group-hover:text-primary/80 transition-colors duration-300">
                                                                    Continuer
                                                                    <ChevronRight className="w-4 h-4 ml-1" />
                                                                </motion.div>
                                                            </CardContent>
                                                        </Card>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Étape 3: Sélection de zone */}
                        {showZoneSelection && (
                            <motion.div ref={zoneRef} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
                                <ZoneSelector onZoneSelect={handleZoneSelect} />
                            </motion.div>
                        )}

                        {/* Étape 4: Sélection des communes */}
                        {showCommuneSelection && (
                            <motion.div
                                ref={communesRef}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <CommuneSelector onBack={handleBackToZone} onSearch={handleCommuneSearch} />
                            </motion.div>
                        )}
                    </main>
                </div>
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
