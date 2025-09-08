import { useState } from "react";
import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface MobileSearchBarProps {
    onSearch: (query: string) => void;
    onOpenFilters: () => void;
    onReset: () => void;
    activeFiltersCount?: number;
}

const MobileSearchBar = ({ onSearch, onOpenFilters, onReset, activeFiltersCount = 0 }: MobileSearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            // Ne pas ouvrir automatiquement les filtres sur mobile
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const handleReset = () => {
        setSearchQuery("");
        onReset();
    };

    return (
        <div className="lg:hidden sticky top-16 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border py-4">
            <div className="container flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un bien, une ville..."
                        className="pl-10 h-11 bg-secondary/50 border-border focus:bg-card transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyPress}
                    />
                </div>
                <Button variant="outline" size="sm" onClick={onOpenFilters} className="h-11 px-3 relative">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="h-11 px-3" title="Réinitialiser les filtres et la recherche">
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default MobileSearchBar;
