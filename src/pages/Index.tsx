import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/sections/SearchFilters";
import MobileSearchBar from "@/components/sections/MobileSearchBar";

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Définir la vue par défaut selon la taille de l'écran
  const [view, setView] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'list' : 'grid';
    }
    return 'grid';
  });

  // Écouter les changements de taille d'écran pour ajuster la vue par défaut
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && view === 'grid') {
        setView('list');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onOpenFilters={() => setShowFilters(true)} 
        onSearch={handleSearch}
        view={view}
        onViewChange={setView}
      />
      <MobileSearchBar onSearch={handleSearch} onOpenFilters={() => setShowFilters(true)} />
      <div className="relative">
        <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
        <div className={`transition-all duration-300 ${showFilters ? 'ml-80' : 'ml-0'}`}>
          <FeaturedProperties searchQuery={searchQuery} view={view} />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
