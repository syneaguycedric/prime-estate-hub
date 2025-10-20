/** @type {import('next').NextConfig} */
const nextConfig = {
    // Note: devIndicators.buildActivity est déprécié dans Next.js 15+
    // L'indicateur est masqué via CSS dans src/index.css

    // Bypass ESLint en mode build pour accélérer le développement
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Configuration pour le SSR strict
    serverExternalPackages: [],

    // Configuration des images pour optimisation
    images: {
        domains: [],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Configuration Tailwind CSS
    transpilePackages: ["@radix-ui/react-*"],

    // Configuration pour l'optimisation
    // swcMinify est activé par défaut dans Next.js 13+

    // Configuration pour les rewrites API (pour intercepter les requêtes)
    async rewrites() {
        return [
            {
                source: "/api/external/:path*",
                destination: "/api/proxy/:path*",
            },
        ];
    },

    // Headers de sécurité
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                ],
            },
        ];
    },

    // Configuration pour la génération statique optimisée
    output: "standalone",

    // Configuration des polyfills pour la compatibilité SSR
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Configuration côté client
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                os: false,
            };
        }

        return config;
    },
};

module.exports = nextConfig;
