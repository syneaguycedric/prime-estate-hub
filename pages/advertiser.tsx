import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import BecomeAdvertiser from "@/components/dashboard/BecomeAdvertiser";
import { toast } from "@/lib/toast-helpers";

export default function AdvertiserPage() {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAuth();

    useEffect(() => {
        // Attendre que le chargement soit terminé avant de vérifier l'authentification
        if (isLoading) {
            return;
        }

        // Rediriger vers login si non authentifié
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Rediriger vers Mon espace si déjà annonceur
        if (user?.role?.code === "ADVERTISER") {
            toast.info("Accès annonceur", {
                description: "Vous êtes déjà annonceur ! Accédez à votre espace pour publier des annonces.",
                duration: 5000,
            });
            router.push("/my-listings");
        }
    }, [isAuthenticated, user, isLoading, router]);

    // Afficher un skeleton ou rien pendant le chargement
    if (isLoading) {
        return null;
    }

    // Ne pas afficher le contenu pendant la vérification
    if (!isAuthenticated) {
        return null;
    }

    // Ne pas afficher si déjà annonceur (en cours de redirection)
    if (user?.role?.code === "ADVERTISER") {
        return null;
    }

    return (
        <>
            <Head>
                <title>Devenir annonceur - Kylimmo</title>
                <meta name="description" content="Devenez annonceur sur Kylimmo et commencez à publier vos annonces immobilières" />
            </Head>

            <div className="min-h-screen flex flex-col">
                {/* Header identique à PageNavbar */}
                <div className="fixed top-0 z-50 w-full bg-background border-b border-border">
                    <div className="container flex h-14 items-center justify-between">
                        {/* Logo à gauche */}
                        <div className="flex items-center flex-1">
                            <button onClick={() => router.push("/")} className="flex items-center hover:text-primary transition-colors">
                                <span className="text-xl font-bold text-foreground">Kylimmo</span>
                            </button>
                        </div>

                        {/* Bouton retour à droite */}
                        <button
                            onClick={() => router.push("/")}
                            className="flex items-center gap-2 text-muted-foreground hover:text-white hover:bg-primary transition-colors px-3 py-2 rounded-md"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">Retour</span>
                        </button>
                    </div>
                </div>

                {/* Contenu principal */}
                <main className="flex-1 container mx-auto px-4 py-8 pt-20">
                    <div className="max-w-4xl mx-auto">
                        <BecomeAdvertiser />
                    </div>
                </main>
            </div>
        </>
    );
}
