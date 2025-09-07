import { useState } from "react";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/sections/SearchFilters";
import MobileSearchBar from "@/components/sections/MobileSearchBar";

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenFilters={() => setShowFilters(true)} onSearch={handleSearch} />
      <MobileSearchBar onSearch={handleSearch} onOpenFilters={() => setShowFilters(true)} />
      <div className="relative">
        <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
        <div className={`transition-all duration-300 ${showFilters ? 'ml-80' : 'ml-0'}`}>
          <FeaturedProperties searchQuery={searchQuery} />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
