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
  images: string[];
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
    images: [appartement1, maison1, villa1],
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
    images: [maison1, villa1, appartement1],
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
    images: [villa1, appartement1, maison1],
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
    images: [appartement1, villa1, maison1],
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
    images: [maison1, appartement1, villa1],
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
    images: [villa1, maison1, appartement1],
    isNew: false,
    isFavorite: true
  },
  {
    id: "7",
    title: "Villa moderne avec piscine",
    price: "825 000 000 FCFA",
    location: "Riviera Golf, Abidjan",
    type: "Villa",
    surface: "320 m²",
    bedrooms: 6,
    bathrooms: 5,
    image: villa1,
    images: [villa1, appartement1, maison1],
    isNew: true,
    isFavorite: false
  },
  {
    id: "8",
    title: "Appartement standing",
    price: "2 750 000 FCFA/mois",
    location: "Les Deux Plateaux, Abidjan",
    type: "Appartement",
    surface: "120 m²",
    bedrooms: 3,
    bathrooms: 3,
    image: appartement1,
    images: [appartement1, maison1, villa1],
    isNew: false,
    isFavorite: true
  },
  {
    id: "9",
    title: "Maison familiale spacieuse",
    price: "385 000 000 FCFA",
    location: "Anyama, Abidjan",
    type: "Maison",
    surface: "180 m²",
    bedrooms: 5,
    bathrooms: 3,
    image: maison1,
    images: [maison1, villa1, appartement1],
    isNew: true,
    isFavorite: false
  },
  {
    id: "10",
    title: "Studio moderne",
    price: "742 500 FCFA/mois",
    location: "Treichville, Abidjan",
    type: "Appartement",
    surface: "42 m²",
    bedrooms: 1,
    bathrooms: 1,
    image: appartement1,
    images: [appartement1, villa1, maison1],
    isNew: false,
    isFavorite: false
  },
  {
    id: "11",
    title: "Villa de prestige",
    price: "1 237 500 000 FCFA",
    location: "Bassam Plage, Grand-Bassam",
    type: "Villa",
    surface: "450 m²",
    bedrooms: 7,
    bathrooms: 6,
    image: villa1,
    images: [villa1, maison1, appartement1],
    isNew: true,
    isFavorite: true
  },
  {
    id: "12",
    title: "Duplex avec jardin",
    price: "577 500 000 FCFA",
    location: "Koumassi, Abidjan",
    type: "Maison",
    surface: "200 m²",
    bedrooms: 4,
    bathrooms: 3,
    image: maison1,
    images: [maison1, appartement1, villa1],
    isNew: false,
    isFavorite: false
  },
  {
    id: "13",
    title: "Appartement neuf avec balcon",
    price: "1 485 000 FCFA/mois",
    location: "Yopougon, Abidjan",
    type: "Appartement",
    surface: "75 m²",
    bedrooms: 2,
    bathrooms: 2,
    image: appartement1,
    images: [appartement1, maison1, villa1],
    isNew: true,
    isFavorite: false
  },
  {
    id: "14",
    title: "Villa contemporaine",
    price: "962 500 000 FCFA",
    location: "Bingerville, Abidjan",
    type: "Villa",
    surface: "380 m²",
    bedrooms: 5,
    bathrooms: 4,
    image: villa1,
    images: [villa1, appartement1, maison1],
    isNew: false,
    isFavorite: true
  },
  {
    id: "15",
    title: "Maison traditionnelle rénovée",
    price: "1 237 500 FCFA/mois",
    location: "Daloa Centre, Haut-Sassandra",
    type: "Maison",
    surface: "110 m²",
    bedrooms: 3,
    bathrooms: 2,
    image: maison1,
    images: [maison1, villa1, appartement1],
    isNew: true,
    isFavorite: false
  },
  {
    id: "16",
    title: "Grand appartement familial",
    price: "445 500 000 FCFA",
    location: "Adjamé, Abidjan",
    type: "Appartement",
    surface: "140 m²",
    bedrooms: 4,
    bathrooms: 3,
    image: appartement1,
    images: [appartement1, villa1, maison1],
    isNew: false,
    isFavorite: false
  },
  {
    id: "17",
    title: "Villa avec piscine et jardin",
    price: "1 402 500 000 FCFA",
    location: "Yamoussoukro Centre, Yamoussoukro",
    type: "Villa",
    surface: "520 m²",
    bedrooms: 6,
    bathrooms: 5,
    image: villa1,
    images: [villa1, maison1, appartement1],
    isNew: true,
    isFavorite: true
  },
  {
    id: "18",
    title: "Maison de maître",
    price: "687 500 000 FCFA",
    location: "San-Pédro Centre, San-Pédro",
    type: "Maison",
    surface: "250 m²",
    bedrooms: 5,
    bathrooms: 4,
    image: maison1,
    images: [maison1, villa1, appartement1],
    isNew: false,
    isFavorite: false
  }
];

export const getPropertyById = (id: string) => properties.find(p => p.id === id);