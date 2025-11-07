import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Mail, Phone, Smartphone, MapPin, Facebook, Twitter, Instagram, Linkedin, Clock } from "lucide-react";
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
              <li><a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Notre équipe</a></li>
              <li><a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Témoignages</a></li>
              <li><a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Mentions légales</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="bg-background/10 rounded-lg p-6 space-y-4 border border-background/20">
              <div className="flex items-start space-x-3 text-background/90">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Abidjan Riviera Après barrage</span>
              </div>
              <div className="flex items-start space-x-3 text-background/90">
                <Smartphone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>(+225) 07 14 59 54 80</span>
              </div>
              <div className="flex items-start space-x-3 text-background/90">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>(+225) 27 22 50 93 54</span>
              </div>
              <div className="flex items-start space-x-3 text-background/90">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>kylimmo@gmail.com</span>
              </div>
              <div className="flex items-start space-x-3 text-background/90">
                <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <span>Lundi - Vendredi : 08h00 - 17h00</span>
              </div>
            </div>
            
            {/* Lien Nous contacter */}
            <div className="pt-2">
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