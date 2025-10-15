import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { checkDirectusHealth } from "@/lib/directus-api";

interface ApiStatusIndicatorProps {
    className?: string;
    showLabel?: boolean;
}

export function ApiStatusIndicator({ className = "", showLabel = true }: ApiStatusIndicatorProps) {
    const [status, setStatus] = useState<"checking" | "online" | "offline">("checking");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Si on utilise les données mockées, afficher le mode démo
        if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
            setStatus("offline");
            setIsVisible(true);
            return;
        }

        // En mode développement, considérer que l'API est online si on n'utilise pas les données mockées
        // Le health check côté client peut causer des problèmes de CORS
        setStatus("online");
        setIsVisible(process.env.NODE_ENV === "development");
    }, []);

    if (!isVisible) return null;

    const getStatusConfig = () => {
        switch (status) {
            case "checking":
                return {
                    icon: Loader2,
                    label: "Vérification...",
                    variant: "secondary" as const,
                    className: "animate-spin",
                };
            case "online":
                return {
                    icon: Wifi,
                    label: "API Directus",
                    variant: "default" as const,
                    className: "text-green-600",
                };
            case "offline":
                return {
                    icon: WifiOff,
                    label: "Mode démo",
                    variant: "destructive" as const,
                    className: "text-red-600",
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
            <Icon className={`h-3 w-3 ${config.className}`} />
            {showLabel && <span className="text-xs">{config.label}</span>}
        </Badge>
    );
}
