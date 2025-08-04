import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { X, MapPin, Home, Euro, Bed, Bath, Car, Ruler } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchFilters = ({ isOpen, onClose }: SearchFiltersProps) => {
  if (!isOpen) return null;

  return (
    <Sidebar className="w-80 border-r border-border bg-card">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Filtres de recherche</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 space-y-6 overflow-y-auto">
        {/* ... keep existing code (all filter sections) */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              Localisation
            </label>
            <Input placeholder="Ville, département, code postal..." />
          </div>

          <Separator />

          {/* Type de transaction */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Type de transaction</label>
            <Select>
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
            <Select>
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
              <Input placeholder="Prix min" />
              <Input placeholder="Prix max" />
            </div>
            <div className="px-2">
              <Slider
                defaultValue={[200000]}
                max={1000000}
                min={50000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>50k€</span>
                <span>1M€</span>
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
              <Input placeholder="Min" />
              <Input placeholder="Max" />
            </div>
          </div>

          {/* Nombre de pièces */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground flex items-center">
              <Bed className="h-4 w-4 mr-2" />
              Nombre de pièces
            </label>
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Button variant="outline" className="w-full">
              Réinitialiser
            </Button>
          </div>
        </SidebarContent>
    </Sidebar>
  );
};

export default SearchFilters;