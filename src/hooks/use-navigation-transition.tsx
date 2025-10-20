import { useRouter } from "next/router";
import { useCallback } from "react";

export const useNavigationTransition = () => {
    const router = useRouter();

    const navigateWithTransition = useCallback(
        (to: string) => {
            // Optimisation: preload de la page de destination
            router.prefetch(to).catch(() => {
                // Ignorer les erreurs de prefetch
            });

            // Pour les pages de détail, navigation immédiate pour éviter les conflits de skeleton
            if (to.includes("/biens/")) {
                router.push(to);
            } else {
                // Navigation avec une transition subtile pour les autres pages
                setTimeout(() => {
                    router.push(to);
                }, 150); // Petit délai pour permettre l'animation de sortie
            }
        },
        [router]
    );

    return { navigateWithTransition };
};
