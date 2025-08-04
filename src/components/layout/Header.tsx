import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, Home, PlusCircle, User, Heart, Filter } from "lucide-react";

interface HeaderProps {
  onOpenFilters: () => void;
}

const Header = ({ onOpenFilters }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">ImmobilierPro</span>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un bien, une ville..."
                className="pl-10 bg-secondary/50 border-border focus:bg-card transition-colors"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOpenFilters}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2">
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
          
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;