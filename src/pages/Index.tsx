import { useState } from "react";
import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Services from "@/components/sections/Services";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/sections/SearchFilters";

const Index = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenFilters={() => setShowFilters(true)} />
      <div className="flex">
        <SearchFilters isOpen={showFilters} onClose={() => setShowFilters(false)} />
        <div className={`flex-1 transition-all duration-300 ${showFilters ? 'ml-0' : ''}`}>
          <FeaturedProperties />
          <Services />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
