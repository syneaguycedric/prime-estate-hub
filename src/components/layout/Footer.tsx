import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Home className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">ImmobilierPro</span>
            </div>
            <p className="text-background/80 leading-relaxed">
              Votre partenaire de confiance pour tous vos projets immobiliers. 
              Expertise, sérieux et proximité depuis plus de 15 ans.
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

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-primary transition-colors">Achat immobilier</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Vente immobilier</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Location</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gestion locative</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Estimation gratuite</a></li>
            </ul>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations</h3>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-primary transition-colors">À propos</a></li>
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
                <span>123 Avenue des Champs, 75008 Paris</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="space-y-2 pt-4">
              <h4 className="font-medium">Newsletter</h4>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Votre email" 
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
                />
                <Button variant="secondary" size="sm">S'abonner</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 mt-8 text-center text-background/60">
          <p>&copy; 2024 ImmobilierPro. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;