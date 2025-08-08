import { useState, useMemo } from "react";
import PropertyCard from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import appartement1 from "@/assets/appartement-1.jpg";
import maison1 from "@/assets/maison-1.jpg";
import villa1 from "@/assets/villa-1.jpg";

interface FeaturedPropertiesProps {
  searchQuery?: string;
}

const FeaturedProperties = ({ searchQuery = "" }: FeaturedPropertiesProps) => {
  const properties = [
    {
      id: "1",
      title: "Magnifique appartement avec vue panoramique",
      price: "450 000 €",
      location: "Paris 16e, Paris",
      type: "Appartement",
      surface: "85 m²",
      bedrooms: 3,
      bathrooms: 2,
      image: appartement1,
      isNew: true,
      isFavorite: false
    },
    {
      id: "2",
      title: "Maison moderne avec jardin",
      price: "650 000 €",
      location: "Neuilly-sur-Seine, Hauts-de-Seine",
      type: "Maison",
      surface: "150 m²",
      bedrooms: 4,
      bathrooms: 3,
      image: maison1,
      isNew: false,
      isFavorite: true
    },
    {
      id: "3",
      title: "Villa de luxe avec piscine",
      price: "1 200 000 €",
      location: "Cannes, Alpes-Maritimes",
      type: "Villa",
      surface: "280 m²",
      bedrooms: 5,
      bathrooms: 4,
      image: villa1,
      isNew: true,
      isFavorite: false
    },
    {
      id: "4",
      title: "Studio lumineux centre-ville",
      price: "1 200 €/mois",
      location: "Lyon 2ème, Rhône",
      type: "Appartement",
      surface: "35 m²",
      bedrooms: 1,
      bathrooms: 1,
      image: appartement1,
      isNew: false,
      isFavorite: false
    },
    {
      id: "5",
      title: "Maison de ville rénovée",
      price: "2 800 €/mois",
      location: "Bordeaux Centre, Gironde",
      type: "Maison",
      surface: "90 m²",
      bedrooms: 3,
      bathrooms: 2,
      image: maison1,
      isNew: true,
      isFavorite: false
    },
    {
      id: "6",
      title: "Penthouse avec terrasse",
      price: "980 000 €",
      location: "Nice Promenade, Alpes-Maritimes",
      type: "Appartement",
      surface: "110 m²",
      bedrooms: 3,
      bathrooms: 2,
      image: villa1,
      isNew: false,
      isFavorite: true
    }
  ];

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