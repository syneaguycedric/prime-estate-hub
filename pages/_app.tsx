import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Head from "next/head";
import LoadingBar from "@/components/ui/loading-bar";
import { AuthProvider } from "@/contexts/AuthContext";

// Import des styles globaux
import "../src/index.css";

// Configuration du QueryClient pour SSR
function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Éviter le refetch immédiat lors de l'hydratation
                staleTime: 60 * 1000, // 1 minute
                // Retry moins agressif pour le SSR
                retry: 1,
                // Éviter les requêtes automatiques côté serveur
                refetchOnWindowFocus: false,
            },
            mutations: {
                retry: 1,
            },
        },
    });
}

export default function App({ Component, pageProps }: AppProps) {
    // QueryClient stable pour éviter les problèmes d'hydratation
    const [queryClient] = useState(() => createQueryClient());

    // State pour éviter les problèmes d'hydratation avec le thème
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <Head>
                {/* Meta tags de base pour le SEO */}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Kylimmo - Plateforme immobilière moderne en Côte d'Ivoire" />
                <meta name="keywords" content="immobilier, côte d'ivoire, appartement, maison, villa, location, vente" />
                <meta name="author" content="Kylimmo" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Kylimmo" />
                <meta property="og:locale" content="fr_FR" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:creator" content="@kylimmo" />

                {/* Favicon */}
                <link rel="icon" href="/assets/killimologofavicon.png" />
                <link rel="apple-touch-icon" href="/assets/killimologofavicon.png" />

                {/* Preconnect pour les performances */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* DNS Prefetch pour les domaines externes */}
                <link rel="dns-prefetch" href="//unpkg.com" />

                {/* Structured Data - Organisation */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            name: "Kylimmo",
                            url: process.env.NEXT_PUBLIC_SITE_URL || "https://kylimmo.com",
                            logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://kylimmo.com"}/logo.png`,
                            description: "Plateforme immobilière moderne en Côte d'Ivoire",
                            address: {
                                "@type": "PostalAddress",
                                addressCountry: "CI",
                                addressLocality: "Abidjan",
                            },
                            contactPoint: {
                                "@type": "ContactPoint",
                                contactType: "customer service",
                                availableLanguage: "French",
                            },
                        }),
                    }}
                />
            </Head>

            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
                    <AuthProvider>
                        <TooltipProvider>
                            <LoadingBar />

                            {/* Éviter les problèmes d'hydratation du thème */}
                            {mounted && (
                                <>
                                    <Component {...pageProps} />
                                    <Toaster />
                                    <Sonner />
                                </>
                            )}

                            {/* Fallback pendant l'hydratation */}
                            {!mounted && (
                                <div style={{ visibility: "hidden" }}>
                                    <Component {...pageProps} />
                                </div>
                            )}
                        </TooltipProvider>
                    </AuthProvider>
                </ThemeProvider>
            </QueryClientProvider>
        </>
    );
}
