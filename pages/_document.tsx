import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="fr" dir="ltr">
            <Head>
                {/* Favicon Kylimmo */}
                <link rel="icon" href="/assets/killimologofavicon.png" />
                <link rel="apple-touch-icon" href="/assets/killimologofavicon.png" />
                <link rel="shortcut icon" href="/assets/killimologofavicon.png" />

                {/* Preload des fonts critiques */}
                <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

                {/* Meta tags pour les performances */}
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />

                {/* Theme color pour les navigateurs mobiles - Couleur primaire Kylimmo */}
                <meta name="theme-color" content="#9E6D26" />
                <meta name="msapplication-TileColor" content="#9E6D26" />

                {/* Manifest pour PWA */}
                <link rel="manifest" href="/manifest.json" />

                {/* Styles critiques inline pour éviter le FOUC */}
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
            /* Reset critique pour éviter le flash */
            *, *::before, *::after {
              box-sizing: border-box;
            }
            
            /* Variables CSS critiques */
            :root {
              --background: 0 0% 100%;
              --foreground: 222.2 84% 4.9%;
              --card: 0 0% 100%;
              --card-foreground: 222.2 84% 4.9%;
              --popover: 0 0% 100%;
              --popover-foreground: 222.2 84% 4.9%;
              --primary: 221.2 83.2% 53.3%;
              --primary-foreground: 210 40% 98%;
              --secondary: 210 40% 96%;
              --secondary-foreground: 222.2 84% 4.9%;
              --muted: 210 40% 96%;
              --muted-foreground: 215.4 16.3% 46.9%;
              --accent: 210 40% 96%;
              --accent-foreground: 222.2 84% 4.9%;
              --destructive: 0 72.2% 50.6%;
              --destructive-foreground: 210 40% 98%;
              --border: 214.3 31.8% 91.4%;
              --input: 214.3 31.8% 91.4%;
              --ring: 221.2 83.2% 53.3%;
              --radius: 0.75rem;
            }
            
            .dark {
              --background: 222.2 84% 4.9%;
              --foreground: 210 40% 98%;
              --card: 222.2 84% 4.9%;
              --card-foreground: 210 40% 98%;
              --popover: 222.2 84% 4.9%;
              --popover-foreground: 210 40% 98%;
              --primary: 217.2 91.2% 59.8%;
              --primary-foreground: 222.2 84% 4.9%;
              --secondary: 217.2 32.6% 17.5%;
              --secondary-foreground: 210 40% 98%;
              --muted: 217.2 32.6% 17.5%;
              --muted-foreground: 215 20.2% 65.1%;
              --accent: 217.2 32.6% 17.5%;
              --accent-foreground: 210 40% 98%;
              --destructive: 0 62.8% 30.6%;
              --destructive-foreground: 210 40% 98%;
              --border: 217.2 32.6% 17.5%;
              --input: 217.2 32.6% 17.5%;
              --ring: 224.3 76.3% 94.1%;
            }
            
            /* Base body styling */
            body {
              margin: 0;
              padding: 0;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background-color: hsl(var(--background));
              color: hsl(var(--foreground));
              line-height: 1.5;
            }
            
            /* Éviter le flash de contenu non stylisé */
            #__next {
              min-height: 100vh;
            }
            
            /* Spinner de chargement initial */
            .initial-loading {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: hsl(var(--background));
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 9999;
            }
            
            .initial-loading::after {
              content: '';
              width: 32px;
              height: 32px;
              border: 2px solid hsl(var(--muted));
              border-top: 2px solid hsl(var(--primary));
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
                    }}
                />
            </Head>
            <body>
                {/* Spinner de chargement initial qui sera caché par React */}
                <div id="initial-loading" className="initial-loading" />

                <Main />
                <NextScript />

                {/* Script pour cacher le loader une fois que React prend le relais */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
            // Cacher le loader initial dès que possible
            document.addEventListener('DOMContentLoaded', function() {
              const loader = document.getElementById('initial-loading');
              if (loader) {
                loader.style.display = 'none';
              }
            });
            
            // Performance observer pour surveiller les métriques
            if ('PerformanceObserver' in window) {
              try {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                  }
                });
                observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
              } catch (e) {
                // Ignorer les erreurs de PerformanceObserver
              }
            }
          `,
                    }}
                />
            </body>
        </Html>
    );
}
