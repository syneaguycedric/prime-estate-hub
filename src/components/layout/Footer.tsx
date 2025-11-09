import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Mail, Phone, Smartphone, MapPin, Facebook, Clock, ExternalLink } from "lucide-react";
import { fetchGlobals, Globals } from "@/lib/directus-api";

// Icône TikTok personnalisée
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
);

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
                        <p className="text-background/80 leading-relaxed">{globals?.short_description || "Votre partenaire de confiance pour tous vos projets immobiliers."}</p>
                        <div>
                            <a
                                href="https://kylimmo.net"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-white text-foreground hover:bg-white/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 px-6 py-2.5"
                            >
                                Accéder au site
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </div>
                        <div className="flex space-x-4">
                            <a
                                href="https://www.facebook.com/share/1DkQ9q42Y3/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Facebook"
                            >
                                <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                                    <Facebook className="h-5 w-5" />
                                </Button>
                            </a>
                            <a
                                href="https://www.tiktok.com/@kylimmosarl?_r=1&_t=ZS-91GObyi19lK"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                            >
                                <Button variant="ghost" size="icon" className="text-background hover:text-primary">
                                    <TikTokIcon className="h-5 w-5" />
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Informations */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informations</h3>
                        <ul className="space-y-2 text-background/80">
                            <li>
                                <a href="https://kylimmo.net/qui-sommes-nous/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    Qui sommes nous
                                </a>
                            </li>
                            <li>
                                <a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    Notre équipe
                                </a>
                            </li>
                            <li>
                                <a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    Témoignages
                                </a>
                            </li>
                            <li>
                                <a href="https://kylimmo.net" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                    Mentions légales
                                </a>
                            </li>
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
