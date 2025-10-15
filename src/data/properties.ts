// Interfaces pour l'API Directus
export interface DirectusFile {
  id: string;
  title: string;
  description: string | null;
  tags: string | null;
  focal_point_x: number | null;
  focal_point_y: number | null;
  filename_download: string;
  metadata: Record<string, any>;
  type: string;
  filesize: string;
  width: number;
  height: number;
  charset: string | null;
  duration: number | null;
  created_on: string;
  embed: string | null;
  modified_on: string;
}

export interface PropertyImage {
  directus_files_id: DirectusFile;
}

export interface Property {
  id: string;
  status: string;
  sort: number | null;
  user_created: string;
  date_created: string;
  user_updated: string | null;
  date_updated: string | null;
  title: string;
  description: string | null;
  price: string;
  billingCycle: "monthly" | "yearly" | "daily";
  contractType: "leasing" | "sale" | "rent";
  surfaceArea: string;
  surfaceAreaUnit: string;
  rooms: number;
  bathrooms: number;
  kitchens: number;
  floors: number;
  address: number | string;
  agency: string;
  characteristics: Array<{ name: string; value: string }>;
  type: "appartment" | "house" | "villa" | "land" | "commercial";
  documents: number[];
  images: PropertyImage[]; // Objets PropertyImage avec métadonnées complètes
  // Champs calculés/dérivés pour compatibilité UI
  location?: string; // À construire depuis address
  isNew?: boolean; // À calculer depuis date_created
  isFavorite?: boolean; // État local
}

// Remplacés par des chemins directs pour compatibilité Next.js (fallback)
const appartement1 = "/assets/appartement-1.jpg";
const maison1 = "/assets/maison-1.jpg";
const villa1 = "/assets/villa-1.jpg";

export const properties: Property[] = [
  {
    id: "1",
    status: "published",
    sort: null,
    user_created: "mock-user-id",
    date_created: "2024-01-15T10:00:00.000Z",
    user_updated: null,
    date_updated: null,
    title: "Magnifique appartement avec vue panoramique",
    description: "Découvrez ce magnifique appartement avec vue panoramique sur la ville.",
    price: "185000000.00",
    billingCycle: "monthly",
    contractType: "sale",
    surfaceArea: "85.00000",
    surfaceAreaUnit: "m2",
    rooms: 3,
    bathrooms: 2,
    kitchens: 1,
    floors: 1,
    address: 1,
    agency: "mock-agency-id",
    characteristics: [
      { name: "Vue", value: "Panoramique" },
      { name: "Étage", value: "5ème" }
    ],
    type: "appartment",
    documents: [],
    images: [
      {
        directus_files_id: {
          id: "mock-file-1",
          title: "Appartement 1",
          description: null,
          tags: null,
          focal_point_x: null,
          focal_point_y: null,
          filename_download: "appartement-1.jpg",
          metadata: {},
          type: "image/jpeg",
          filesize: "150000",
          width: 800,
          height: 600,
          charset: null,
          duration: null,
          created_on: "2024-01-15T10:00:00.000Z",
          embed: null,
          modified_on: "2024-01-15T10:00:00.000Z"
        }
      }
    ],
    // Champs calculés pour compatibilité
    location: "Plateau, Abidjan",
    isNew: true,
    isFavorite: false
  },
  {
    id: "2",
    status: "published",
    sort: null,
    user_created: "mock-user-id",
    date_created: "2024-01-10T10:00:00.000Z",
    user_updated: null,
    date_updated: null,
    title: "Maison moderne avec jardin",
    description: "Magnifique maison moderne avec un beau jardin, idéale pour les familles.",
    price: "267500000.00",
    billingCycle: "monthly",
    contractType: "sale",
    surfaceArea: "150.00000",
    surfaceAreaUnit: "m2",
    rooms: 4,
    bathrooms: 3,
    kitchens: 1,
    floors: 2,
    address: 2,
    agency: "mock-agency-id",
    characteristics: [
      { name: "Jardin", value: "Oui" },
      { name: "Garage", value: "2 places" }
    ],
    type: "house",
    documents: [],
    images: [
      {
        directus_files_id: {
          id: "mock-file-2",
          title: "Maison 1",
          description: null,
          tags: null,
          focal_point_x: null,
          focal_point_y: null,
          filename_download: "maison-1.jpg",
          metadata: {},
          type: "image/jpeg",
          filesize: "200000",
          width: 800,
          height: 600,
          charset: null,
          duration: null,
          created_on: "2024-01-10T10:00:00.000Z",
          embed: null,
          modified_on: "2024-01-10T10:00:00.000Z"
        }
      }
    ],
    // Champs calculés pour compatibilité
    location: "Cocody, Abidjan",
    isNew: false,
    isFavorite: true
  },
  {
    id: "3",
    status: "published",
    sort: null,
    user_created: "mock-user-id",
    date_created: "2024-01-20T10:00:00.000Z",
    user_updated: null,
    date_updated: null,
    title: "Villa de luxe avec piscine",
    description: "Villa de luxe exceptionnelle avec piscine privée et vue sur mer.",
    price: "494000000.00",
    billingCycle: "monthly",
    contractType: "sale",
    surfaceArea: "280.00000",
    surfaceAreaUnit: "m2",
    rooms: 5,
    bathrooms: 4,
    kitchens: 2,
    floors: 2,
    address: 3,
    agency: "mock-agency-id",
    characteristics: [
      { name: "Piscine", value: "Privée" },
      { name: "Vue", value: "Mer" },
      { name: "Garage", value: "3 places" }
    ],
    type: "villa",
    documents: [],
    images: [
      {
        directus_files_id: {
          id: "mock-file-3",
          title: "Villa 1",
          description: null,
          tags: null,
          focal_point_x: null,
          focal_point_y: null,
          filename_download: "villa-1.jpg",
          metadata: {},
          type: "image/jpeg",
          filesize: "250000",
          width: 800,
          height: 600,
          charset: null,
          duration: null,
          created_on: "2024-01-20T10:00:00.000Z",
          embed: null,
          modified_on: "2024-01-20T10:00:00.000Z"
        }
      }
    ],
    // Champs calculés pour compatibilité
    location: "Grand-Bassam, Comoé",
    isNew: true,
    isFavorite: false
  },
  {
    id: "4",
    status: "published",
    sort: null,
    user_created: "mock-user-id",
    date_created: "2024-01-05T10:00:00.000Z",
    user_updated: null,
    date_updated: null,
    title: "Studio lumineux centre-ville",
    description: "Studio moderne et lumineux en plein centre-ville, parfait pour les jeunes actifs.",
    price: "495000.00",
    billingCycle: "monthly",
    contractType: "leasing",
    surfaceArea: "35.00000",
    surfaceAreaUnit: "m2",
    rooms: 1,
    bathrooms: 1,
    kitchens: 1,
    floors: 1,
    address: 4,
    agency: "mock-agency-id",
    characteristics: [
      { name: "Meublé", value: "Oui" },
      { name: "Climatisation", value: "Oui" }
    ],
    type: "appartment",
    documents: [],
    images: [
      {
        directus_files_id: {
          id: "mock-file-4",
          title: "Studio 1",
          description: null,
          tags: null,
          focal_point_x: null,
          focal_point_y: null,
          filename_download: "appartement-1.jpg",
          metadata: {},
          type: "image/jpeg",
          filesize: "120000",
          width: 800,
          height: 600,
          charset: null,
          duration: null,
          created_on: "2024-01-05T10:00:00.000Z",
          embed: null,
          modified_on: "2024-01-05T10:00:00.000Z"
        }
      }
    ],
    // Champs calculés pour compatibilité
    location: "Marcory, Abidjan",
    isNew: false,
    isFavorite: false
  }
];

export const getPropertyById = (id: string) => properties.find(p => p.id === id);