import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

interface PropertyListCardAnimatedProps {
    id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    surface: string;
    bedrooms?: number;
    bathrooms?: number;
    images: string[];
    index: number;
}

const PropertyListCardAnimated = ({ id, title, price, location, type, surface, bedrooms, bathrooms, images, index }: PropertyListCardAnimatedProps) => {
    const { navigateWithTransition } = useNavigationTransition();

    const handleCardClick = () => {
        navigateWithTransition(`/biens/${id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.3,
                delay: index * 0.05,
            }}
            whileHover={{
                y: -2,
                transition: { duration: 0.2 },
            }}
        >
            <div onClick={handleCardClick} className="block mb-4 cursor-pointer">
                <div>
                    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 bg-gradient-card border-border/50">
                        <CardContent className="p-3">
                            <div className="flex gap-3">
                                {/* Image avec animation */}
                                <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                                    <img src={images[0]} alt={title} loading="lazy" className="w-full h-full object-cover rounded-md" />
                                </div>

                                {/* Contenu avec animations échelonnées */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-medium text-sm sm:text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                                            <Badge variant="secondary" className="flex-shrink-0 text-xs h-5">
                                                {type}
                                            </Badge>
                                        </div>

                                        <p className="text-xs sm:text-sm text-muted-foreground flex items-center mb-2">
                                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="line-clamp-1">{location}</span>
                                        </p>

                                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mb-2">
                                            <div className="flex items-center">
                                                <Square className="h-3 w-3 mr-1" />
                                                {surface}
                                            </div>
                                            {bedrooms !== undefined && (
                                                <div className="flex items-center">
                                                    <Bed className="h-3 w-3 mr-1" />
                                                    {bedrooms}
                                                </div>
                                            )}
                                            {bathrooms !== undefined && (
                                                <div className="flex items-center">
                                                    <Bath className="h-3 w-3 mr-1" />
                                                    {bathrooms}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <p className="text-sm sm:text-lg font-bold text-primary">{price}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};

export default PropertyListCardAnimated;
