import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

interface PropertyCardAnimatedProps {
    id: string;
    title: string;
    price: string;
    location: string;
    type: string;
    surface: string;
    bedrooms?: number;
    bathrooms?: number;
    image: string;
    isNew?: boolean;
    isFavorite?: boolean;
    index?: number;
}

const PropertyCardAnimated = ({ id, title, price, location, type, surface, bedrooms, bathrooms, image, isNew, isFavorite = false, index = 0 }: PropertyCardAnimatedProps) => {
    const { navigateWithTransition } = useNavigationTransition();

    const handleCardClick = () => {
        navigateWithTransition(`/biens/${id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
        >
            <div onClick={handleCardClick} className="block h-full cursor-pointer">
                <Card className="group bg-gradient-card border-border/50 cursor-pointer h-full flex flex-col overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
                    <div className="relative overflow-hidden rounded-t-lg">
                        <img src={image} alt={title} className="w-full h-48 object-cover" />

                        {/* Overlay badges */}
                        <div className="absolute top-4 left-4 flex gap-2">
                            {isNew && <Badge className="bg-success text-success-foreground">Nouveau</Badge>}
                            <Badge variant="secondary" className="bg-card/90 text-foreground">
                                {type}
                            </Badge>
                        </div>

                        {/* Favorite button */}
                        <div className="absolute top-4 right-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`bg-card/90 hover:bg-card ${isFavorite ? "text-red-500" : "text-muted-foreground"}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                            </Button>
                        </div>

                        {/* Price overlay */}
                        <div className="absolute bottom-4 left-4">
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg font-semibold shadow-lg">{price}</div>
                        </div>
                    </div>

                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>

                            <div className="flex items-center text-muted-foreground text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                {location}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                    <Square className="h-4 w-4 mr-1" />
                                    {surface}
                                </div>
                                {bedrooms && (
                                    <div className="flex items-center">
                                        <Bed className="h-4 w-4 mr-1" />
                                        {bedrooms}
                                    </div>
                                )}
                                {bathrooms && (
                                    <div className="flex items-center">
                                        <Bath className="h-4 w-4 mr-1" />
                                        {bathrooms}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardClick();
                                }}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                Voir
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                Contacter
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default PropertyCardAnimated;
