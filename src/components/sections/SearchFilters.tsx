import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, MapPin, Home, Euro, Bed, Bath, Car, Ruler } from "lucide-react";

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange?: (count: number) => void;
}

const SearchFilters = ({ isOpen, onClose, onFiltersChange }: SearchFiltersProps) => {
  const [filters, setFilters] = useState({
    location: "",
    transaction: "",
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    minSurface: "",
    maxSurface: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    parking: ""
  });

  const countActiveFilters = () => {
    return Object.values(filters).filter(value => value && value.trim() !== "").length;
  };

  useEffect(() => {
    const count = countActiveFilters();
    onFiltersChange?.(count);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: "",
      transaction: "",
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      minSurface: "",
      maxSurface: "",
      rooms: "",
      bedrooms: "",
      bathrooms: "",
      parking: ""
    });
    onFiltersChange?.(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-card border-r border-border shadow-lg z-40">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Filtres de recherche</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto h-full">
        {/* Localisation */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            Localisation
          </label>
          <Input placeholder="Ville, département, code postal..." value={filters.location} onChange={(e) => updateFilter("location", e.target.value)} />
        </div>

        <Separator />

        {/* Type de transaction */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Type de transaction</label>
          <Select value={filters.transaction} onValueChange={(value) => updateFilter("transaction", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Achat ou Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="achat">Achat</SelectItem>
              <SelectItem value="location">Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type de bien */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Type de bien
          </label>
          <Select value={filters.propertyType} onValueChange={(value) => updateFilter("propertyType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="appartement">Appartement</SelectItem>
              <SelectItem value="maison">Maison</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="terrain">Terrain</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Prix */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Euro className="h-4 w-4 mr-2" />
            Budget
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Prix min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} />
            <Input placeholder="Prix max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} />
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[82500000]}
              max={412500000}
              min={20625000}
              step={4125000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>20M FCFA</span>
              <span>412M FCFA</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Surface */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Ruler className="h-4 w-4 mr-2" />
            Surface (m²)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Min" value={filters.minSurface} onChange={(e) => updateFilter("minSurface", e.target.value)} />
            <Input placeholder="Max" value={filters.maxSurface} onChange={(e) => updateFilter("maxSurface", e.target.value)} />
          </div>
        </div>

        {/* Nombre de pièces */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Bed className="h-4 w-4 mr-2" />
            Nombre de pièces
          </label>
          <Select value={filters.rooms} onValueChange={(value) => updateFilter("rooms", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Indifférent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 pièce</SelectItem>
              <SelectItem value="2">2 pièces</SelectItem>
              <SelectItem value="3">3 pièces</SelectItem>
              <SelectItem value="4">4 pièces</SelectItem>
              <SelectItem value="5">5+ pièces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Nombre de chambres */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Chambres</label>
          <Select value={filters.bedrooms} onValueChange={(value) => updateFilter("bedrooms", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Indifférent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 chambre</SelectItem>
              <SelectItem value="2">2 chambres</SelectItem>
              <SelectItem value="3">3 chambres</SelectItem>
              <SelectItem value="4">4+ chambres</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Salles de bain */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Bath className="h-4 w-4 mr-2" />
            Salles de bain
          </label>
          <Select value={filters.bathrooms} onValueChange={(value) => updateFilter("bathrooms", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Indifférent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 salle de bain</SelectItem>
              <SelectItem value="2">2 salles de bain</SelectItem>
              <SelectItem value="3">3+ salles de bain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Parking */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Parking
          </label>
          <Select value={filters.parking} onValueChange={(value) => updateFilter("parking", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Indifférent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucun</SelectItem>
              <SelectItem value="1">1 place</SelectItem>
              <SelectItem value="2">2+ places</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Boutons d'action */}
        <div className="flex flex-col gap-2 pt-4">
          <Button variant="default" className="w-full">
            Appliquer les filtres
          </Button>
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;