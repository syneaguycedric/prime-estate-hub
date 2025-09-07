import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Search, Menu, Home, PlusCircle, User, Heart, Filter } from "lucide-react";
import ViewToggle from "@/components/ui/view-toggle";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  onOpenFilters: () => void;
  onSearch: (query: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  activeFiltersCount?: number;
}

const Header = ({ onOpenFilters, onSearch, view, onViewChange, activeFiltersCount = 0 }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSearch(searchQuery);
      onOpenFilters();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">Kylimmo</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOpenFilters}
              className="relative"
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -left-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {activeFiltersCount}
                </Badge>
              )}
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
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
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
    </header>
  );
};

export default Header;