import appartement1 from "@/assets/appartement-1.jpg";
import maison1 from "@/assets/maison-1.jpg";
import villa1 from "@/assets/villa-1.jpg";

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  surface: string;
  bedrooms?: number;
  bathrooms?: number;
  image: string;
  isNew?: boolean;
  isFavorite?: boolean;
}

export const properties: Property[] = [
  {
    id: "1",
    title: "Magnifique appartement avec vue panoramique",
    price: "185 000 000 FCFA",
    location: "Plateau, Abidjan",
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
    price: "267 500 000 FCFA",
    location: "Cocody, Abidjan",
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
    price: "494 000 000 FCFA",
    location: "Grand-Bassam, Comoé",
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
    price: "495 000 FCFA/mois",
    location: "Marcory, Abidjan",
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
    price: "1 155 000 FCFA/mois",
    location: "Bouaké Centre, Gbêkê",
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
    price: "403 700 000 FCFA",
    location: "Zone 4, Abidjan",
    type: "Appartement",
    surface: "110 m²",
    bedrooms: 3,
    bathrooms: 2,
    image: villa1,
    isNew: false,
    isFavorite: true
  }
];

export const getPropertyById = (id: string) => properties.find(p => p.id === id);
