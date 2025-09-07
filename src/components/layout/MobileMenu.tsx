import { useState, useEffect } from "react";
import { X, Search, Filter, Heart, User, PlusCircle } from "lucide-react";
import ViewToggle from "@/components/ui/view-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFilters: () => void;
  onSearch: (query: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

const MobileMenu = ({ isOpen, onClose, onOpenFilters, onSearch, view, onViewChange }: MobileMenuProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [preventFocus, setPreventFocus] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setPreventFocus(true);
      // Permettre le focus après un délai
      const timer = setTimeout(() => {
        setPreventFocus(false);
      }, 300);
      return () => clearTimeout(timer);
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-80">
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
                  placeholder="Rechercher un bien, une ville..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  autoFocus={false}
                  tabIndex={preventFocus ? -1 : 0}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="w-full"
                disabled={!searchQuery.trim()}
              >
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
              
              <Button variant="ghost" className="w-full justify-start h-12">
                <User className="h-4 w-4 mr-3" />
                Mon compte
              </Button>
              
              <Button variant="hero" className="w-full justify-start h-12">
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