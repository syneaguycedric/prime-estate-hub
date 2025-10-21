import { useState, useEffect, useRef } from "react";
import { X, Search, Filter, Heart, User, PlusCircle, Building2 } from "lucide-react";
import ViewToggle from "@/components/ui/view-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenFilters: () => void;
    onSearch: (query: string) => void;
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
}

const MobileMenu = ({ isOpen, onClose, onOpenFilters, onSearch, view, onViewChange }: MobileMenuProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const sheetRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, user } = useAuth();
    const { navigateWithTransition } = useNavigationTransition();

    useEffect(() => {
        if (isOpen) {
            // Empêcher le focus automatique en utilisant plusieurs méthodes
            const preventFocus = () => {
                if (inputRef.current) {
                    inputRef.current.blur();
                }
                // Focus sur le conteneur du sheet pour éviter le focus sur l'input
                if (sheetRef.current) {
                    sheetRef.current.focus();
                }
            };

            // Exécuter immédiatement et après un court délai
            preventFocus();
            const timer1 = setTimeout(preventFocus, 50);
            const timer2 = setTimeout(preventFocus, 150);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, [isOpen]);

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            onOpenFilters();
            onClose();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handlePublishClick = () => {
        if (!isAuthenticated) {
            // Stocker l'intention de redirection après connexion
            if (typeof window !== "undefined") {
                sessionStorage.setItem("redirect_after_login", "/create-listing");
            }

            // Afficher un toast d'invitation à se connecter
            import("@/lib/toast-helpers").then(({ toast }) => {
                toast.warning("Connexion requise", {
                    description: "Vous devez être connecté pour publier une annonce. Connectez-vous ou créez un compte.",
                    duration: 5000,
                });
            });
            // Rediriger vers la page de connexion
            navigateWithTransition("/login");
            onClose();
        } else {
            // Vérifier si l'utilisateur est un annonceur ET rattaché à une agence
            if (user?.account?.account_type !== "advertiser" || !user?.account?.agency) {
                // Rediriger vers l'onglet "Devenir annonceur"
                navigateWithTransition("/my-listings?tab=advertiser");
                import("@/lib/toast-helpers").then(({ toast }) => {
                    toast.info("Devenez annonceur", {
                        description: "Vous devez être annonceur avec une agence pour publier des annonces.",
                        duration: 7000,
                    });
                });
                onClose();
                return;
            }

            // Rediriger vers la page de création d'annonce
            navigateWithTransition("/create-listing");
            onClose();
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:w-80" ref={sheetRef} tabIndex={0}>
                <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Search Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Recherche</h3>
                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    ref={inputRef}
                                    placeholder="Rechercher un bien, une ville..."
                                    className="pl-10"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    autoFocus={false}
                                    tabIndex={-1}
                                    onFocus={(e) => {
                                        // Empêcher le focus automatique en forçant le blur
                                        e.target.blur();
                                    }}
                                    onClick={(e) => {
                                        // Permettre le focus uniquement sur click intentionnel
                                        e.currentTarget.tabIndex = 0;
                                        e.currentTarget.focus();
                                    }}
                                />
                            </div>
                            <Button onClick={handleSearch} className="w-full" disabled={!searchQuery.trim()}>
                                <Search className="h-4 w-4 mr-2" />
                                Rechercher
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenFilters();
                                    onClose();
                                }}
                                className="w-full"
                            >
                                <Filter className="h-4 w-4 mr-2" />
                                Filtres avancés
                            </Button>
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Affichage</h3>
                        <ViewToggle view={view} onViewChange={onViewChange} />
                    </div>

                    {/* Navigation */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                        <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start h-12">
                                <Heart className="h-4 w-4 mr-3" />
                                Mes favoris
                            </Button>

                            <Button
                                variant="ghost"
                                className="w-full justify-start h-12"
                                onClick={() => {
                                    navigateWithTransition("/my-listings");
                                    onClose();
                                }}
                            >
                                <Building2 className="h-4 w-4 mr-3" />
                                Mon espace
                            </Button>

                            <Button variant="ghost" className="w-full justify-start h-12">
                                <User className="h-4 w-4 mr-3" />
                                Mon compte
                            </Button>

                            <Button variant="hero" className="w-full justify-start h-12" onClick={handlePublishClick}>
                                <PlusCircle className="h-4 w-4 mr-3" />
                                Publier une annonce
                            </Button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Actions rapides</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="h-12">
                                Acheter
                            </Button>
                            <Button variant="outline" size="sm" className="h-12">
                                Louer
                            </Button>
                            <Button variant="outline" size="sm" className="h-12">
                                Estimer
                            </Button>
                            <Button variant="outline" size="sm" className="h-12">
                                Vendre
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MobileMenu;
