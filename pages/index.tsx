import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
// Removed progressive cards flow; using top search banner instead
import HomeHeader from "@/components/layout/HomeHeader";
import PromoBanner from "@/components/sections/PromoBanner";
import PropertyCardAnimated from "@/components/ui/property-card-animated";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Award, ChevronDown } from "lucide-react";
import { fetchGeoZones, GeoZone, fetchSubscriptionPlans, SubscriptionPlan, fetchFeaturedPropertiesByZone, fetchVipProperties, zoneNameToSlug } from "@/lib/directus-api";
import { Property } from "@/data/properties";

interface FeaturedPropertiesByZone {
    zone: GeoZone;
    properties: Property[];
}

interface HomePageProps {
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
    geoZones: GeoZone[];
    featuredPropertiesByZone: FeaturedPropertiesByZone[];
    vipProperties: Property[];
}

type ContractType = "sale" | "rent";

const HomePage = ({ seoData, geoZones, featuredPropertiesByZone, vipProperties }: HomePageProps) => {
    const router = useRouter();
    const [selectedContract, setSelectedContract] = useState<ContractType>("rent");
    const [zone, setZone] = useState<string>("");
    const [areas, setAreas] = useState<string[]>([]);
    const [areasOpen, setAreasOpen] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée (slug)
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return geoZones.find((z) => zoneNameToSlug(z.name) === zoneValue) || null;
    };

    // Obtenir la zone actuellement sélectionnée
    const selectedZone = zone ? getZoneByValue(zone) : null;

    // Obtenir l'ID de la zone sélectionnée (pour utilisation future dans les filtres)
    const selectedZoneId = selectedZone?.id || null;

    useEffect(() => {
        const { contractType, zone: qZone, areas: qAreas } = router.query as Record<string, string>;
        if (contractType === "rent" || contractType === "sale") setSelectedContract(contractType);
        // Vérifier si le slug de zone existe dans les zones disponibles
        if (qZone && geoZones.some((z) => zoneNameToSlug(z.name) === qZone)) {
            setZone(qZone);
        }
        if (typeof qAreas === "string" && qAreas.length > 0) setAreas(qAreas.split(","));
    }, [router.query, geoZones]);

    // Charger les plans d'abonnement et trouver celui avec code="kylimmo"
    useEffect(() => {
        const loadSubscriptionPlans = async () => {
            try {
                const plans = await fetchSubscriptionPlans();
                const kylimmoPlan = plans.find((plan) => plan.code === "kylimmo");
                if (kylimmoPlan) {
                    setSubscriptionPlan(kylimmoPlan);
                }
            } catch (error) {
                console.error("[HOMEPAGE] Error loading subscription plans:", error);
            }
        };

        loadSubscriptionPlans();
    }, []);

    const toggleArea = (id: string) => {
        // Sélection unique: remplace toujours par l'ID cliqué
        setAreas([id]);
        // Fermer automatiquement le Popover après sélection
        setAreasOpen(false);
    };

    const getAreaName = (id: string) => {
        if (!selectedZone) return "";
        // Chercher dans les towns de la zone sélectionnée
        const town = selectedZone.towns.find((t) => t.id === id);
        return town?.name || "";
    };

    // Obtenir les towns de la zone sélectionnée
    const getTownsForSelectedZone = () => {
        if (!selectedZone) return [];
        return selectedZone.towns || [];
    };

    const handleCommuneSearch = (communes: string[]) => {
        // Construire l'URL avec tous les paramètres
        const params = new URLSearchParams();
        if (selectedContract) params.set("contractType", selectedContract);
        if (zone) params.set("zone", zone);
        if (communes.length > 0) params.set("areas", communes.join(","));
        router.push(`/properties?${params.toString()}`);
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
                {/* Bannière publicitaire */}
                <PromoBanner />
                {/* Bandeau de recherche */}
                <div className="container py-6">
                    <Card className="border-border/60 bg-card/80 backdrop-blur">
                        <CardContent className="p-4 md:p-6">
                            {/* Radios */}
                            <div className="flex items-center gap-4 mb-4">
                                <Label className="text-sm text-muted-foreground">Type d'annonce</Label>
                                <RadioGroup value={selectedContract} onValueChange={(v) => setSelectedContract(v as ContractType)} className="flex gap-2">
                                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border hover:bg-muted cursor-pointer">
                                        <RadioGroupItem id="rent" value="rent" />
                                        <Label htmlFor="rent" className="cursor-pointer">
                                            Location
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border hover:bg-muted cursor-pointer">
                                        <RadioGroupItem id="sale" value="sale" />
                                        <Label htmlFor="sale" className="cursor-pointer">
                                            Vente
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Ligne des filtres */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                {/* Zone */}
                                <div className="md:col-span-4">
                                    <Label className="text-xs text-muted-foreground">Zone</Label>
                                    <Select
                                        value={zone}
                                        onValueChange={(v: any) => {
                                            setZone(v);
                                            setAreas([]);
                                        }}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Choisir une zone" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {geoZones.map((geoZone) => {
                                                // Générer dynamiquement le slug pour chaque zone
                                                const zoneValue = zoneNameToSlug(geoZone.name);

                                                return (
                                                    <SelectItem key={geoZone.id} value={zoneValue}>
                                                        {geoZone.name}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Communes / Départements */}
                                <div className="md:col-span-6">
                                    <Label className="text-xs text-muted-foreground">Commune ou département</Label>
                                    <Popover open={areasOpen} onOpenChange={setAreasOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between mt-1" disabled={!zone}>
                                                <span className="truncate min-w-0 flex-1 text-left">
                                                    {areas.length === 1 ? getAreaName(areas[0]) : "Choisir une commune ou un département"}
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[320px] p-3">
                                            <div className="max-h-64 overflow-auto pr-1">
                                                {getTownsForSelectedZone().map((town) => (
                                                    <button
                                                        type="button"
                                                        key={town.id}
                                                        onClick={() => toggleArea(town.id)}
                                                        className="w-full flex items-center justify-between py-2 text-sm hover:bg-muted rounded px-2"
                                                    >
                                                        <span>{town.name}</span>
                                                        <Checkbox checked={areas[0] === town.id} onCheckedChange={() => toggleArea(town.id)} />
                                                    </button>
                                                ))}
                                            </div>
                                            <Separator className="my-2" />
                                            <div className="flex items-center justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setAreas([]);
                                                        setAreasOpen(false);
                                                    }}
                                                >
                                                    Effacer
                                                </Button>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Rechercher */}
                                <div className="md:col-span-2 flex md:justify-end">
                                    <Button className="w-full md:w-auto mt-6 md:mt-5" disabled={!zone} onClick={() => handleCommuneSearch(areas)}>
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="container grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                    {/* Colonne gauche - En vedette */}
                    <aside className="order-1 lg:order-1">
                        <Card className="border-2 border-primary/30 bg-white shadow-lg">
                            <CardContent className="p-6">
                                {/* Header annonces */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">En vedette</h2>
                                    </div>
                                    <Button
                                        onClick={() => router.push(`/properties?plan=premium`)}
                                        variant="default"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <Award className="h-4 w-4 mr-2" />
                                        Voir plus
                                    </Button>
                                </div>

                                {/* Sections dynamiques par zone */}
                                {featuredPropertiesByZone.length > 0 ? (
                                    featuredPropertiesByZone.map((zoneData, zoneIndex) => {
                                        const isLastZone = zoneIndex === featuredPropertiesByZone.length - 1;
                                        return (
                                            <div key={`zone-${zoneData.zone.id}`} className={isLastZone ? '' : 'mb-8'}>
                                                <div className="flex items-center justify-center mb-4">
                                                    <Separator className="flex-1" />
                                                    <h3 className="text-lg font-semibold text-foreground mx-4">{zoneData.zone.name}</h3>
                                                    <Separator className="flex-1" />
                                                </div>
                                                {zoneData.properties.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                                        {zoneData.properties.map((property, index) => (
                                                            <div key={`featured-${zoneData.zone.id}-${property.id}`} className="group relative h-full">
                                                                {/* Badge Premium positionné collé au type de contrat à droite */}
                                                                <span className="pointer-events-none absolute top-10 right-3 z-20 rounded-full bg-primary/70 text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 shadow-sm tracking-wide">
                                                                    Premium
                                                                </span>

                                                                {/* Carte premium */}
                                                                <div className="h-full transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 rounded-xl overflow-hidden">
                                                                    <PropertyCardAnimated {...property} index={index} />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8">
                                                        <p className="text-sm text-muted-foreground">Aucune annonce en vedette pour {zoneData.zone.name}.</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-muted-foreground">Aucune zone disponible pour le moment.</p>
                                    </div>
                                )}

                                {/* Footer avec séparateur et bouton */}
                                <div className="mt-8 pt-6 border-t-2 border-primary/20">
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={() => router.push(`/properties?plan=premium`)}
                                            variant="default"
                                            size="lg"
                                            className="shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            <Award className="h-4 w-4 mr-2" />
                                            Voir plus
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Colonne droite - Annonces VIP */}
                    <main className="order-2 lg:order-2">
                        <Card className="border-2 border-primary/30 bg-white shadow-lg">
                            <CardContent className="p-6">
                                {/* Header annonces */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">{subscriptionPlan?.title || "Annonces kylimmo"}</h2>
                                    </div>
                                    <Button
                                        onClick={() => router.push(`/properties?plan=kylimmo`)}
                                        variant="default"
                                        size="sm"
                                        className="shadow-md hover:shadow-lg transition-shadow"
                                    >
                                        <Award className="h-4 w-4 mr-2" />
                                        Voir plus
                                    </Button>
                                </div>

                                {/* Grille des annonces VIP */}
                                {vipProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                                        {vipProperties.slice(0, 9).map((property, index) => (
                                            <div key={`vip-${property.id}`} className="group relative h-full">
                                                {/* Badge VIP positionné collé au type de contrat à droite */}
                                                <span className="pointer-events-none absolute top-10 right-3 z-20 rounded-full bg-primary/70 text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 shadow-sm tracking-wide">
                                                    {subscriptionPlan?.code || "kylimmo"}
                                                </span>

                                                {/* Carte premium */}
                                                <div className="h-full transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 rounded-xl overflow-hidden">
                                                    <PropertyCardAnimated {...property} index={index} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">Aucune annonce {subscriptionPlan?.code || "kylimmo"} pour le moment.</p>
                                    </div>
                                )}

                                {/* Footer avec séparateur et bouton */}
                                <div className="mt-8 pt-6 border-t-2 border-primary/20">
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={() => router.push(`/properties?plan=kylimmo`)}
                                            variant="default"
                                            size="lg"
                                            className="shadow-md hover:shadow-lg transition-shadow"
                                        >
                                            <Award className="h-4 w-4 mr-2" />
                                            Voir plus
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </>
    );
};

/**
 * Extrait l'ID de la zone depuis une propriété
 * La zone peut être dans property.town.zone (string ou objet)
 */
function getPropertyZoneId(property: Property): string | null {
    const town = (property as any).town;
    if (!town) return null;
    
    if (typeof town === "string") {
        // Si town est juste un ID, on ne peut pas déterminer la zone
        return null;
    }
    
    if (typeof town === "object") {
        const zone = town.zone;
        if (!zone) return null;
        
        // Si zone est un ID (string)
        if (typeof zone === "string") {
            return zone;
        }
        
        // Si zone est un objet avec un ID
        if (typeof zone === "object" && zone.id) {
            return zone.id;
        }
    }
    
    return null;
}

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

        // Récupérer les zones géographiques depuis l'API
        const geoZones = await fetchGeoZones();

        // Récupérer toutes les propriétés featured une seule fois (sans filtre)
        const allFeaturedProperties = await fetchFeaturedPropertiesByZone(null, 999);

        // Filtrer côté client pour chaque zone
        const featuredPropertiesByZone = geoZones.map((zone) => {
            const properties = allFeaturedProperties.filter((property) => {
                const propertyZoneId = getPropertyZoneId(property);
                return propertyZoneId === zone.id;
            }).slice(0, 6); // Limiter à 6 par zone
            
            return { zone, properties };
        });

        // Récupérer les annonces VIP (kylimmo) en parallèle
        const vipProperties = await fetchVipProperties(9); // Limite à 9 éléments pour les annonces kylimmo

        // Headers pour la mise en cache - longue durée pour la page d'accueil
        context.res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");

        return {
            props: {
                seoData,
                geoZones: geoZones || [],
                featuredPropertiesByZone: featuredPropertiesByZone || [],
                vipProperties: vipProperties || [],
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
                geoZones: [],
                featuredPropertiesByZone: [],
                vipProperties: [],
            },
        };
    }
};

export default HomePage;
