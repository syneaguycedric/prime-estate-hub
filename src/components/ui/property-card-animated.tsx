import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";
import ImageWithLoading from "@/components/ui/image-with-loading";
import { Property } from "@/data/properties";
import { formatPrice, formatSurface, getPropertyTypeLabel, getContractTypeLabel, getFirstImageUrl } from "@/lib/property-helpers";

interface PropertyCardAnimatedProps extends Property {
    index?: number;
}

const PropertyCardAnimated = ({
    id,
    title,
    price,
    billingCycle,
    contractType,
    location,
    type,
    surfaceArea,
    surfaceAreaUnit,
    rooms,
    bathrooms,
    images,
    isNew,
    index = 0,
}: PropertyCardAnimatedProps) => {
    const { navigateWithTransition } = useNavigationTransition();

    const handleCardClick = () => {
        navigateWithTransition(`/biens/${id}`);
    };

    // Formater les données pour l'affichage
    const formattedPrice = formatPrice(price, billingCycle);
    const formattedSurface = formatSurface(surfaceArea, surfaceAreaUnit);
    const propertyTypeLabel = getPropertyTypeLabel(type);
    const contractTypeLabel = getContractTypeLabel(contractType);
    const imageUrl = getFirstImageUrl({ images } as Property);

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
                        <ImageWithLoading
                            src={imageUrl}
                            alt={`${title} - ${location}`}
                            className="w-full h-48 group-hover:scale-110 transition-transform duration-300"
                            loading={index < 4 ? "eager" : "lazy"}
                        />

                        {/* Overlay badges avec animation */}
                        <motion.div
                            className="absolute top-4 left-4 flex gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                        >
                            <Badge variant="secondary" className="bg-card/90 text-foreground">
                                {propertyTypeLabel}
                            </Badge>
                            <Badge variant="outline" className="bg-card/90 text-foreground">
                                {contractTypeLabel}
                            </Badge>
                        </motion.div>

                        {/* Price overlay avec animation */}
                        <motion.div className="absolute bottom-4 left-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
                            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-lg font-semibold shadow-lg">{formattedPrice}</div>
                        </motion.div>
                    </div>

                    <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <motion.div className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + index * 0.1 }}>
                            <h3 className="font-semibold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>

                            <div className="flex items-center text-muted-foreground text-sm">
                                <MapPin className="h-4 w-4 mr-1" />
                                {location}
                            </div>

                            <motion.div
                                className="flex items-center gap-4 text-sm text-muted-foreground"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                            >
                                <div className="flex items-center">
                                    <Square className="h-4 w-4 mr-1" />
                                    {formattedSurface}
                                </div>
                                {rooms && (
                                    <div className="flex items-center">
                                        <Bed className="h-4 w-4 mr-1" />
                                        {rooms}
                                    </div>
                                )}
                                {bathrooms && (
                                    <div className="flex items-center">
                                        <Bath className="h-4 w-4 mr-1" />
                                        {bathrooms}
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>

                        <motion.div className="flex gap-2 pt-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }}>
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
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
};

export default PropertyCardAnimated;
