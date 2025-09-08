import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Menu, Home, PlusCircle, User, Heart, Filter, RotateCcw } from "lucide-react";
import ViewToggle from "@/components/ui/view-toggle";
import MobileMenu from "./MobileMenu";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

interface HeaderProps {
    onOpenFilters: () => void;
    onSearch: (query: string) => void;
    onReset: () => void;
    view: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
    activeFiltersCount?: number;
}

const Header = ({ onOpenFilters, onSearch, onReset, view, onViewChange, activeFiltersCount = 0 }: HeaderProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { navigateWithTransition } = useNavigationTransition();

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            onSearch(searchQuery);
            onOpenFilters(); // Ouvrir automatiquement les filtres sur tablette/desktop
        }
    };

    const handleReset = () => {
        setSearchQuery("");
        onReset();
    };

    const handleHomeClick = () => {
        navigateWithTransition("/");
    };

    return (
        <motion.header
            className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <motion.div
                    className="flex items-center space-x-2 cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleHomeClick}
                >
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.4, ease: "easeInOut" }}>
                        <Home className="h-8 w-8 text-primary" />
                    </motion.div>
                    <span className="text-xl font-bold text-foreground">Kylimmo</span>
                </motion.div>

                {/* Search Bar - Hidden on mobile and tablet */}
                <div className="hidden lg:flex flex-1 max-w-md mx-8">
                    <div className="relative w-full flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un bien, une ville..."
                                className="pl-10 bg-secondary/50 border-border focus:bg-card transition-colors"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                        <Button variant="outline" size="sm" onClick={onOpenFilters} className="relative">
                            <Filter className="h-4 w-4" />
                            {activeFiltersCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset} title="Réinitialiser les filtres et la recherche">
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex items-center space-x-2">
                    <div className="hidden md:block">
                        <ViewToggle view={view} onViewChange={onViewChange} />
                    </div>

                    <Button variant="ghost" size="sm" className="hidden md:flex">
                        <Heart className="h-4 w-4 mr-2" />
                        Favoris
                    </Button>

                    <Button variant="ghost" size="sm" className="hidden md:flex">
                        <User className="h-4 w-4 mr-2" />
                        Connexion
                    </Button>

                    <Button variant="hero" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Publier
                    </Button>

                    <Button variant="ghost" size="sm" className="sm:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                </nav>
            </div>

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onOpenFilters={onOpenFilters}
                onSearch={onSearch}
                view={view}
                onViewChange={onViewChange}
            />
        </motion.header>
    );
};

export default Header;
