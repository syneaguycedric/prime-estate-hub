import { toast } from "sonner";
import { useCallback } from "react";

interface ErrorHandlerOptions {
    title?: string;
    description?: string;
    duration?: number;
    showFallbackMessage?: boolean;
}

export function useErrorHandler() {
    const handleError = useCallback((error: Error | unknown, options: ErrorHandlerOptions = {}) => {
        const { title = "Erreur", description, duration = 5000, showFallbackMessage = true } = options;

        // Extraire le message d'erreur
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Déterminer la description à afficher
        const finalDescription = description || (showFallbackMessage ? "Une erreur inattendue s'est produite." : undefined);

        // Afficher le toast d'erreur
        toast.error(title, {
            description: finalDescription,
            duration,
            action: {
                label: "Détails",
                onClick: () => {
                    console.error("Error details:", error);
                    toast.info("Détails de l'erreur", {
                        description: errorMessage,
                        duration: 8000,
                    });
                },
            },
        });

        // Logger l'erreur pour le debugging
        console.error("[ERROR HANDLER]", error);
    }, []);

    const handleApiError = useCallback(
        (error: Error | unknown, context: string = "API") => {
            handleError(error, {
                title: "Erreur de connexion",
                description: `Impossible de se connecter à ${context}. Vérifiez votre connexion internet.`,
                duration: 6000,
            });
        },
        [handleError]
    );

    const handleDirectusError = useCallback(
        (error: Error | unknown) => {
            handleApiError(error, "l'API Directus");
        },
        [handleApiError]
    );

    return {
        handleError,
        handleApiError,
        handleDirectusError,
    };
}
