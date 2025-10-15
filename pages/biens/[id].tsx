import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Property } from "@/data/properties";
import { fetchPropertyById } from "@/lib/directus-api";
import { formatPrice, formatSurface, getPropertyTypeLabel, getContractTypeLabel, getAllImageUrls, formatCharacteristics } from "@/lib/property-helpers";
import PageNavbar from "@/components/layout/PageNavbar";
// Import dynamique temporairement désactivé

interface PropertyDetailPageProps {
    property: Property | null;
    seoData: {
        title: string;
        description: string;
        keywords: string;
        canonicalUrl: string;
        ogImage: string;
    };
}

const PropertyDetailPage = ({ property, seoData }: PropertyDetailPageProps) => {
    const router = useRouter();
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    // Détecter la navigation VERS cette page (pas le chargement initial)
    useEffect(() => {
        const handleRouteChangeStart = (url: string) => {
            // Activer le skeleton seulement si on navigue VERS une page de détail
            if (url.includes("/biens/")) {
                setIsNavigating(true);
            }
        };

        const handleRouteChangeComplete = () => {
            setIsNavigating(false);
        };

        router.events.on("routeChangeStart", handleRouteChangeStart);
        router.events.on("routeChangeComplete", handleRouteChangeComplete);
        router.events.on("routeChangeError", handleRouteChangeComplete);

        return () => {
            router.events.off("routeChangeStart", handleRouteChangeStart);
            router.events.off("routeChangeComplete", handleRouteChangeComplete);
            router.events.off("routeChangeError", handleRouteChangeComplete);
        };
    }, [router.events]);

    // Formater les données pour l'affichage
    const formattedPrice = property ? formatPrice(property.price, property.billingCycle) : "";
    const formattedSurface = property ? formatSurface(property.surfaceArea, property.surfaceAreaUnit) : "";
    const propertyTypeLabel = property ? getPropertyTypeLabel(property.type) : "";
    const contractTypeLabel = property ? getContractTypeLabel(property.contractType) : "";
    const imageUrls = property ? getAllImageUrls(property) : [];
    const characteristicsList = property ? formatCharacteristics(property.characteristics) : [];

    // Afficher le skeleton pendant la navigation VERS cette page
    if (isNavigating) {
        return (
            <div className="bg-background min-h-screen">
                <PageNavbar breadcrumbs={[{ label: "Chargement du bien..." }]} />
                <main className="container py-16 pt-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Gros bloc à gauche - 2/3 de la largeur */}
                        <div className="lg:col-span-2">
                            {/* Titre et localisation skeleton */}
                            <div className="mb-6">
                                <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-3 animate-pulse"></div>
                                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            </div>

                            {/* Image principale skeleton */}
                            <div className="mb-6">
                                <div className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>
                            </div>

                            {/* Miniatures skeleton */}
                            <div className="flex gap-3 mb-8">
                                <div className="w-20 h-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-gray-200 rounded animate-pulse"></div>
                                <div className="w-20 h-16 bg-gray-200 rounded animate-pulse"></div>
                            </div>

                            {/* Section Détails skeleton */}
                            <div className="mb-8">
                                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-22 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Description skeleton */}
                            <div className="mb-8">
                                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar à droite - 1/3 de la largeur */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24">
                                <CardContent className="p-6">
                                    {/* Prix skeleton */}
                                    <div className="mb-6">
                                        <div className="h-10 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                                    </div>

                                    {/* Boutons skeleton */}
                                    <div className="space-y-3 mb-6">
                                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                                    </div>

                                    {/* Informations de contact skeleton */}
                                    <div>
                                        <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                                            </div>
                                            <div className="h-3 bg-gray-200 rounded w-40 animate-pulse"></div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-200 rounded w-44 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // Pas de skeleton - laisser le système global gérer les transitions

    if (!property) {
        return (
            <>
                <Head>
                    <title>Bien introuvable - Kylimmo</title>
                    <meta name="description" content="Le bien immobilier demandé n'a pas été trouvé." />
                    <meta name="robots" content="noindex, nofollow" />
                </Head>
                <div className="bg-background">
                    <PageNavbar breadcrumbs={[{ label: "Bien introuvable" }]} />
                    <main className="container py-16 pt-20">
                        <h1 className="text-2xl font-bold text-foreground">Bien introuvable</h1>
                        <p className="text-muted-foreground mt-2">Le bien demandé n'existe pas ou a été déplacé.</p>
                        <Button onClick={() => router.push("/")} className="mt-4">
                            Retour à l'accueil
                        </Button>
                    </main>
                </div>
            </>
        );
    }

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
                <meta property="og:type" content="article" />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content={`Photo de ${property.title}`} />

                {/* Twitter Card */}
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="twitter:card" content="summary_large_image" />

                {/* Preload de l'image principale */}
                <link rel="preload" as="image" href={property.images[0]} />

                {/* Structured Data - Real Estate Listing */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "RealEstateListing",
                            name: property.title,
                            description: `${property.type} de ${property.surfaceArea} ${property.surfaceAreaUnit} situé à ${property.location}`,
                            url: seoData.canonicalUrl,
                            image: property.images,
                            priceRange: property.price,
                            address: {
                                "@type": "PostalAddress",
                                addressLocality: property.location.split(", ")[0],
                                addressRegion: property.location.split(", ")[1] || property.location.split(", ")[0],
                                addressCountry: "CI",
                            },
                            floorSize: {
                                "@type": "QuantitativeValue",
                                value: parseInt(property.surfaceArea?.replace(/\D/g, "") || "0"),
                                unitText: "m²",
                            },
                            ...(property.bedrooms && {
                                numberOfRooms: property.bedrooms,
                            }),
                            ...(property.bathrooms && {
                                numberOfBathroomsTotal: property.bathrooms,
                            }),
                            category: property.type,
                            availableAtOrFrom: {
                                "@type": "Place",
                                address: {
                                    "@type": "PostalAddress",
                                    addressLocality: property.location.split(", ")[0],
                                    addressRegion: property.location.split(", ")[1] || property.location.split(", ")[0],
                                    addressCountry: "CI",
                                },
                            },
                            offers: {
                                "@type": "Offer",
                                price: property.price,
                                priceCurrency: "XOF",
                                availability: "https://schema.org/InStock",
                                seller: {
                                    "@type": "Organization",
                                    name: "Kylimmo",
                                },
                            },
                        }),
                    }}
                />
            </Head>

            <div className="bg-background">
                <PageNavbar breadcrumbs={[{ label: "Biens immobiliers", href: "/" }]} />
                <main>
                    <section className="container py-6 pt-20">
                        <motion.h1
                            className="text-3xl md:text-4xl font-bold text-foreground mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            {property.title}
                        </motion.h1>
                        <motion.p
                            className="text-lg text-muted-foreground mb-6 flex items-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <MapPin className="h-4 w-4 mr-2" />
                            {property.location}
                        </motion.p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                {/* Image principale */}
                                <motion.div
                                    className="mb-4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    <motion.img
                                        src={imageUrls[selectedImageIndex]}
                                        alt={`Photo ${selectedImageIndex + 1} du bien: ${property.title} – ${property.location}`}
                                        loading={selectedImageIndex === 0 ? "eager" : "lazy"}
                                        className="w-full h-80 md:h-[28rem] object-cover rounded-lg shadow-sm"
                                        key={selectedImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.div>

                                {/* Miniatures */}
                                <motion.div
                                    className="flex gap-2 overflow-x-auto pb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                                >
                                    {imageUrls.map((imageUrl, index) => (
                                        <motion.button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                                selectedImageIndex === index ? "border-primary shadow-md" : "border-transparent hover:border-muted-foreground/30"
                                            }`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + index * 0.05 }}
                                        >
                                            <img src={imageUrl} alt={`Miniature ${index + 1}`} className="w-20 h-16 object-cover" loading="lazy" />
                                        </motion.button>
                                    ))}
                                </motion.div>

                                {/* Card Prix - Mobile uniquement */}
                                <Card className="mt-4 lg:hidden">
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-primary">{formattedPrice}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button className="w-full" size="lg">
                                            Appeler
                                        </Button>
                                        <Button variant="outline" className="w-full" size="lg">
                                            Demander une visite
                                        </Button>

                                        {/* Informations de contact - Mobile uniquement */}
                                        <div className="pt-4 border-t border-border space-y-3">
                                            <h3 className="text-lg font-semibold">Informations de contact</h3>
                                            <div className="flex items-center text-sm">
                                                <User className="h-4 w-4 mr-3 text-primary" />
                                                <div>
                                                    <p className="font-medium">Marie Dubois</p>
                                                    <p className="text-muted-foreground">Agent immobilier</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Phone className="h-4 w-4 mr-3 text-primary" />
                                                <span>01 23 45 67 89</span>
                                            </div>
                                            <div className="flex items-center text-sm">
                                                <Mail className="h-4 w-4 mr-3 text-primary" />
                                                <span>marie.dubois@immobilier.fr</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="text-2xl">Détails</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                                            <div className="flex items-center text-foreground">
                                                <Square className="h-4 w-4 mr-2" />
                                                {formattedSurface}
                                            </div>
                                            {property.rooms !== undefined && (
                                                <div className="flex items-center text-foreground">
                                                    <Bed className="h-4 w-4 mr-2" />
                                                    {property.rooms} pièce(s)
                                                </div>
                                            )}
                                            {property.bathrooms !== undefined && (
                                                <div className="flex items-center text-foreground">
                                                    <Bath className="h-4 w-4 mr-2" />
                                                    {property.bathrooms} salle(s) de bain
                                                </div>
                                            )}
                                            {property.kitchens !== undefined && (
                                                <div className="flex items-center text-foreground">
                                                    <Square className="h-4 w-4 mr-2" />
                                                    {property.kitchens} cuisine(s)
                                                </div>
                                            )}
                                            <div className="text-foreground">Type: {propertyTypeLabel}</div>
                                            <div className="text-foreground">Contrat: {contractTypeLabel}</div>
                                            {property.floors !== undefined && <div className="text-foreground">Étages: {property.floors}</div>}
                                        </div>

                                        {/* Caractéristiques - Mobile uniquement dans la card Détails */}
                                        {characteristicsList.length > 0 && (
                                            <div className="lg:hidden">
                                                <h3 className="text-lg font-semibold mb-3 pt-4 border-t border-border">Caractéristiques</h3>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    {characteristicsList.map((characteristic, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                                            {characteristic}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar Desktop uniquement */}
                            <aside className="hidden lg:block lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-2xl text-primary">{formattedPrice}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button className="w-full" size="lg">
                                            Appeler
                                        </Button>
                                        <Button variant="outline" className="w-full" size="lg">
                                            Demander une visite
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card className="mt-4">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Informations de contact</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center text-sm">
                                            <User className="h-4 w-4 mr-3 text-primary" />
                                            <div>
                                                <p className="font-medium">Marie Dubois</p>
                                                <p className="text-muted-foreground">Agent immobilier</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Phone className="h-4 w-4 mr-3 text-primary" />
                                            <span>01 23 45 67 89</span>
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <Mail className="h-4 w-4 mr-3 text-primary" />
                                            <span>marie.dubois@immobilier.fr</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </aside>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {property.description && (
                                        <div
                                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: property.description,
                                            }}
                                        />
                                    )}

                                    {/* Emplacement - Mobile uniquement dans la card Description */}
                                    <div className="lg:hidden">
                                        <h3 className="text-lg font-semibold mb-3 pt-6 border-t border-border">Emplacement</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Situé dans un quartier recherché, ce bien bénéficie d'un environnement calme tout en restant proche des commodités essentielles :
                                            commerces, écoles, transports en commun et espaces verts.
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                Centre-ville : 5 min
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                Métro : 3 min à pied
                                            </div>
                                            <div className="flex items-center text-muted-foreground">
                                                <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                Écoles : 2 min à pied
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <h4 className="text-base font-medium mb-3 lg:hidden">Localisation</h4>
                                            <div className="w-full h-64 rounded-lg border border-border bg-muted flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-muted-foreground">Carte temporairement indisponible</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Localisation : {property.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Caractéristiques - Desktop/Tablette uniquement */}
                            {characteristicsList.length > 0 && (
                                <Card className="hidden lg:block">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Caractéristiques</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {characteristicsList.map((characteristic, index) => (
                                                <div key={index} className="flex items-center">
                                                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                                                    {characteristic}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Emplacement - Desktop/Tablette uniquement */}
                            <Card className="hidden lg:block lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-xl">Emplacement</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Emplacement */}
                                        <div>
                                            <p className="text-muted-foreground mb-4">
                                                Situé dans un quartier recherché, ce bien bénéficie d'un environnement calme tout en restant proche des commodités essentielles :
                                                commerces, écoles, transports en commun et espaces verts.
                                            </p>
                                            <div className="grid grid-cols-1 gap-3 text-sm">
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                    Centre-ville : 5 min
                                                </div>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                    Métro : 3 min à pied
                                                </div>
                                                <div className="flex items-center text-muted-foreground">
                                                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                                                    Écoles : 2 min à pied
                                                </div>
                                            </div>
                                        </div>

                                        {/* Localisation */}
                                        <div>
                                            <div className="w-full h-64 rounded-lg border border-border bg-muted flex items-center justify-center">
                                                <div className="text-center">
                                                    <p className="text-muted-foreground">Carte temporairement indisponible</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Localisation : {property.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

// Fonction pour générer les données SEO
function generateSeoData(property: Property, baseUrl: string) {
    return {
        title: `${property.title} - ${property.price} | Kylimmo`,
        description: `${property.type} de ${property.surfaceArea} ${property.surfaceAreaUnit} à ${property.location}. ${
            property.bedrooms ? `${property.bedrooms} chambres, ` : ""
        }${property.bathrooms ? `${property.bathrooms} salles de bain. ` : ""}Prix: ${property.price}`,
        keywords: `${property.type.toLowerCase()}, ${property.location.toLowerCase()}, immobilier côte d'ivoire, ${property.surfaceArea} ${
            property.surfaceAreaUnit
        }, ${property.price.toLowerCase()}`,
        canonicalUrl: `${baseUrl}/biens/${property.id}`,
        ogImage: property.images[0],
    };
}

// Server-Side Rendering pour une page de bien spécifique
export const getServerSideProps: GetServerSideProps<PropertyDetailPageProps> = async (context) => {
    try {
        const { id } = context.params!;

        // Construire l'URL de base
        const protocol = context.req.headers["x-forwarded-proto"] || "http";
        const host = context.req.headers["x-forwarded-host"] || context.req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        // Récupérer le bien immobilier depuis l'API Directus
        // Forcer le refresh pour éviter les données en cache lors des modifications
        const property = await fetchPropertyById(id as string, true);

        if (!property) {
            // Retourner 404 si le bien n'existe pas
            return {
                notFound: true,
            };
        }

        // Génération des données SEO
        const seoData = generateSeoData(property, baseUrl);

        // Pas de délai artificiel pour une meilleure expérience utilisateur

        // Headers pour la mise en cache - plus long pour les pages de détail
        context.res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

        return {
            props: {
                property,
                seoData,
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps for property detail:", error);

        // En cas d'erreur, retourner 404
        return {
            notFound: true,
        };
    }
};

export default PropertyDetailPage;
