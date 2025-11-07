import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
// Removed progressive cards flow; using top search banner instead
import HomeHeader from "@/components/layout/HomeHeader";
import PropertyListCardAnimated from "@/components/ui/property-list-card-animated";
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
import { Search, Award } from "lucide-react";
import { fetchGeoZones, GeoZone, fetchSubscriptionPlans, SubscriptionPlan, fetchFeaturedProperties, fetchVipProperties } from "@/lib/directus-api";
import { Property } from "@/data/properties";

interface HomePageProps {
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
    };
    geoZones: GeoZone[];
    featuredProperties: Property[];
    vipProperties: Property[];
}

type ContractType = "sale" | "rent";

const HomePage = ({ seoData, geoZones, featuredProperties, vipProperties }: HomePageProps) => {
    const router = useRouter();
    const [selectedContract, setSelectedContract] = useState<ContractType>("sale");
    const [zone, setZone] = useState<"grand-abidjan" | "hors-abidjan" | "">("");
    const [areas, setAreas] = useState<string[]>([]);
    const [areasOpen, setAreasOpen] = useState(false);
    const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan | null>(null);

    // Mapping entre les valeurs simplifiées (pour l'URL) et les IDs réels des zones
    // Les IDs sont conservés pour utilisation future dans les filtres
    const getZoneMapping = () => {
        const mapping: Record<string, { id: string; zone: GeoZone | null }> = {};
        
        // Trouver "Grand Abidjan" et "Hors Abidjan" dans les zones récupérées
        const grandAbidjan = geoZones.find(z => z.name === "Grand Abidjan");
        const horsAbidjan = geoZones.find(z => z.name === "Hors Abidjan");
        
        mapping["grand-abidjan"] = {
            id: grandAbidjan?.id || "",
            zone: grandAbidjan || null,
        };
        
        mapping["hors-abidjan"] = {
            id: horsAbidjan?.id || "",
            zone: horsAbidjan || null,
        };
        
        return mapping;
    };

    const zoneMapping = getZoneMapping();

    // Helper pour obtenir l'ID de zone à partir de la valeur simplifiée
    const getZoneIdByValue = (zoneValue: string): string | null => {
        return zoneMapping[zoneValue]?.id || null;
    };

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return zoneMapping[zoneValue]?.zone || null;
    };

    // Obtenir la zone actuellement sélectionnée
    const selectedZone = zone ? getZoneByValue(zone) : null;
    
    // Obtenir l'ID de la zone sélectionnée (pour utilisation future dans les filtres)
    const selectedZoneId = zone ? getZoneIdByValue(zone) : null;

    useEffect(() => {
        const { contractType, zone: qZone, areas: qAreas } = router.query as Record<string, string>;
        if (contractType === "rent" || contractType === "sale") setSelectedContract(contractType);
        if (qZone === "grand-abidjan" || qZone === "hors-abidjan") setZone(qZone);
        if (typeof qAreas === "string" && qAreas.length > 0) setAreas(qAreas.split(","));
    }, [router.query]);

    // Charger les plans d'abonnement et trouver celui avec code="kylimmo"
    useEffect(() => {
        const loadSubscriptionPlans = async () => {
            try {
                const plans = await fetchSubscriptionPlans();
                const kylimmoPlan = plans.find(plan => plan.code === "kylimmo");
                if (kylimmoPlan) {
                    setSubscriptionPlan(kylimmoPlan);
                }
            } catch (error) {
                console.error('[HOMEPAGE] Error loading subscription plans:', error);
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
                {/* Bandeau de recherche */}
                <div className="container py-6">
                    <Card className="border-border/60 bg-card/80 backdrop-blur">
                        <CardContent className="p-4 md:p-6">
                            {/* Radios */}
                            <div className="flex items-center gap-4 mb-4">
                                <Label className="text-sm text-muted-foreground">Type d'annonce</Label>
                                <RadioGroup value={selectedContract} onValueChange={(v) => setSelectedContract(v as ContractType)} className="flex gap-2">
                                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border hover:bg-muted cursor-pointer">
                                        <RadioGroupItem id="sale" value="sale" />
                                        <Label htmlFor="sale" className="cursor-pointer">
                                            Vente
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full border hover:bg-muted cursor-pointer">
                                        <RadioGroupItem id="rent" value="rent" />
                                        <Label htmlFor="rent" className="cursor-pointer">
                                            Location
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
                                                // Mapper le nom de zone vers la valeur simplifiée
                                                const zoneValue = geoZone.name === "Grand Abidjan" 
                                                    ? "grand-abidjan" 
                                                    : geoZone.name === "Hors Abidjan" 
                                                    ? "hors-abidjan" 
                                                    : null;
                                                
                                                if (!zoneValue) return null;
                                                
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
                                                {areas.length === 1 ? getAreaName(areas[0]) : "Choisir..."}
                                                <Search className="h-4 w-4 opacity-60" />
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

                <div className="container grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
                    {/* Colonne gauche - En vedette */}
                    <aside className="lg:col-span-1 order-2 lg:order-1">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">En vedette</h3>
                            <div>
                                {featuredProperties.length > 0 ? (
                                    featuredProperties.slice(0, 4).map((p, idx) => (
                                        <PropertyListCardAnimated key={p.id} {...p} index={idx} />
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Aucune annonce en vedette pour le moment.</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Colonne principale - Annonces VIP */}
                    <main className="lg:col-span-3 order-1 lg:order-2">
                        <Card className="border-2 border-primary/30 bg-white shadow-lg">
                            <CardContent className="p-6">
                                {/* Header annonces */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground">{subscriptionPlan?.title || "Les annonces"}</h2>
                                    </div>
                                </div>

                                {/* Grille des annonces VIP */}
                                {vipProperties.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vipProperties.slice(0, 6).map((property, index) => (
                                            <div key={`vip-${property.id}`} className="group relative">
                                                {/* Badge VIP simple en coin */}
                                                <span className="pointer-events-none absolute top-2 right-2 z-20 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 shadow-sm tracking-wide">
                                                    {subscriptionPlan?.code || "VIP"}
                                                </span>

                                                {/* Carte premium */}
                                                <div className="transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:-translate-y-1 rounded-xl overflow-hidden">
                                                    <PropertyCardAnimated {...property} index={index} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-muted-foreground">Aucune annonce VIP pour le moment.</p>
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
                                            Voir plus d'annonces {subscriptionPlan?.title || "VIP"}
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

        // Récupérer les annonces en vedette (premium) et VIP (kylimmo)
        const [featuredProperties, vipProperties] = await Promise.all([
            fetchFeaturedProperties(),
            fetchVipProperties()
        ]);

        // Headers pour la mise en cache - longue durée pour la page d'accueil
        context.res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=7200");

        return {
            props: {
                seoData,
                geoZones: geoZones || [],
                featuredProperties: featuredProperties || [],
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
                featuredProperties: [],
                vipProperties: [],
            },
        };
    }
};

export default HomePage;
