import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { fetchGlobals, Globals } from "@/lib/directus-api";

const Footer = () => {
  const [globals, setGlobals] = useState<Globals | null>(null);

  useEffect(() => {
    const loadGlobals = async () => {
      const data = await fetchGlobals();
      setGlobals(data);
    };
    loadGlobals();
  }, []);

  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Kylimmo</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              {globals?.short_description || "Votre partenaire de confiance pour tous vos projets immobiliers."}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="https://kylimmo.net/qui-sommes-nous/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Qui sommes nous</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Notre équipe</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Témoignages</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog immobilier</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mentions légales</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3 text-background/80">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>contact@immobilierpro.fr</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Cocody, Riviera Palmeraie</span>
              </div>
            </div>
            
            {/* Lien Nous contacter */}
            <div className="pt-4">
              <a 
                href="https://kylimmo.net/contactez-nous/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-background/80 hover:text-primary transition-colors underline"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-8 text-center text-background/60">
          <p>&copy; 2025 Kylimmo. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;