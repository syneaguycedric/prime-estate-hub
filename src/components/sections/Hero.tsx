import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-immobilier.jpg";

const Hero = () => {
  return (
    <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Immobilier moderne"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-in slide-in-from-bottom-4 duration-700">
          Trouvez votre bien idéal
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 animate-in slide-in-from-bottom-4 duration-700 delay-150">
          Achat, vente, location - Votre partenaire immobilier de confiance
        </p>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Type</label>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Achat / Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="achat">Achat</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bien</label>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Appartement, Maison..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="terrain">Terrain</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Localisation</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ville, code postal..."
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>

            <Button variant="hero" size="lg" className="h-11">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12 animate-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="text-center">
            <div className="text-3xl font-bold">15K+</div>
            <div className="text-white/80">Biens disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">8K+</div>
            <div className="text-white/80">Clients satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-white/80">Agences partenaires</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">24/7</div>
            <div className="text-white/80">Support client</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;