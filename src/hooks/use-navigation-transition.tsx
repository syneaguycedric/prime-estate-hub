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

            // Navigation avec une transition subtile
            setTimeout(() => {
                router.push(to);
            }, 150); // Petit délai pour permettre l'animation de sortie
        },
        [router]
    );

    return { navigateWithTransition };
};
