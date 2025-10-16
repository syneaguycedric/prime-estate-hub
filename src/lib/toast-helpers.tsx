import { toast as sonnerToast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

/**
 * Helper pour afficher des toasts avec icônes et styles personnalisés
 */

export const toast = {
    /**
     * Toast de succès avec icône verte
     */
    success: (message: string, options?: { description?: string; duration?: number }) => {
        return sonnerToast.success(message, {
            description: options?.description,
            duration: options?.duration || 3000,
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
            className: "animate-slide-in-right",
        });
    },

    /**
     * Toast d'erreur avec icône rouge et shake
     */
    error: (message: string, options?: { description?: string; duration?: number }) => {
        return sonnerToast.error(message, {
            description: options?.description,
            duration: options?.duration || 5000,
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            className: "animate-shake",
        });
    },

    /**
     * Toast d'avertissement avec icône orange
     */
    warning: (message: string, options?: { description?: string; duration?: number }) => {
        return sonnerToast.warning(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
            className: "animate-slide-in-right",
        });
    },

    /**
     * Toast d'information avec icône bleue
     */
    info: (message: string, options?: { description?: string; duration?: number }) => {
        return sonnerToast.info(message, {
            description: options?.description,
            duration: options?.duration || 4000,
            icon: <Info className="h-5 w-5 text-blue-600" />,
            className: "animate-slide-in-right",
        });
    },

    /**
     * Toast générique (utilise le style par défaut de Sonner)
     */
    message: (message: string, options?: { description?: string; duration?: number }) => {
        return sonnerToast(message, {
            description: options?.description,
            duration: options?.duration || 3000,
            className: "animate-slide-in-right",
        });
    },
};
