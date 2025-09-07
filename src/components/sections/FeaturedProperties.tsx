import { useState, useMemo } from "react";
import PropertyCard from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { properties } from "@/data/properties";

interface FeaturedPropertiesProps {
  searchQuery?: string;
}

const FeaturedProperties = ({ searchQuery = "" }: FeaturedPropertiesProps) => {
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    
    return properties.filter(property => 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {searchQuery ? `Résultats pour "${searchQuery}"` : "Biens en vedette"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {searchQuery 
              ? `${filteredProperties.length} bien(s) trouvé(s)`
              : "Découvrez notre sélection de biens immobiliers exceptionnels, soigneusement choisis pour leur qualité et leur emplacement."
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild variant="outline" size="lg" aria-label="Voir tous les biens immobiliers">
            <Link to="/biens">
              Voir tous les biens
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;