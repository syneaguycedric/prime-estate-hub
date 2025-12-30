import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";
import ImageWithLoading from "@/components/ui/image-with-loading";
import { Property } from "@/data/properties";
import { formatPriceOnly, formatSurface, getPropertyTypeLabel, getContractTypeLabel, getFirstImageUrl, formatLocation } from "@/lib/property-helpers";

interface PropertyListCardAnimatedProps extends Property {
    index: number;
}

const PropertyListCardAnimated = (props: PropertyListCardAnimatedProps) => {
    const {
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
        index,
    } = props;
    
    const { navigateWithTransition } = useNavigationTransition();

    const handleCardClick = () => {
        navigateWithTransition(`/biens/${id}`);
    };

    // Formater les données pour l'affichage
    const formattedPrice = formatPriceOnly(price);
    const formattedSurface = formatSurface(surfaceArea, surfaceAreaUnit);
    const propertyTypeLabel = getPropertyTypeLabel(type);
    const contractTypeLabel = getContractTypeLabel(contractType);
    const imageUrl = getFirstImageUrl({ images } as Property);
    const formattedLocation = formatLocation(props as Property);

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
                        <CardContent className="p-2">
                            <div className="flex gap-2">
                                {/* Image avec animation */}
                                <motion.div
                                    className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                                >
                                    <ImageWithLoading src={imageUrl} alt={`${title} - ${formattedLocation}`} loading={index < 6 ? "eager" : "lazy"} className="w-full h-full rounded-md" />
                                </motion.div>

                                {/* Contenu avec animations échelonnées */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <motion.div
                                            className="mb-1"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                                        >
                                            <h3 className="font-semibold text-sm sm:text-base text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                                                {title}
                                            </h3>
                                        </motion.div>

                                        <motion.div
                                            className="flex flex-wrap items-center gap-1.5 mb-1.5"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.22 + index * 0.05, duration: 0.3 }}
                                        >
                                            <Badge variant="secondary" className="text-[10px] h-5 px-2">
                                                {propertyTypeLabel}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] h-5 px-2">
                                                {contractTypeLabel}
                                            </Badge>
                                        </motion.div>

                                        <motion.p
                                            className="text-[11px] sm:text-xs text-muted-foreground flex items-center mb-2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 + index * 0.05, duration: 0.3 }}
                                        >
                                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span className="line-clamp-1">{formattedLocation}</span>
                                        </motion.p>

                                        <motion.div
                                            className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-muted-foreground mb-2"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.05, duration: 0.3 }}
                                        >
                                            <div className="flex items-center">
                                                <Square className="h-3 w-3 mr-1" />
                                                {formattedSurface}
                                            </div>
                                            {rooms !== undefined && (
                                                <div className="flex items-center">
                                                    <Bed className="h-3 w-3 mr-1" />
                                                    {rooms}
                                                </div>
                                            )}
                                            {bathrooms !== undefined && (
                                                <div className="flex items-center">
                                                    <Bath className="h-3 w-3 mr-1" />
                                                    {bathrooms}
                                                </div>
                                            )}
                                        </motion.div>
                                    </div>

                                    <motion.div
                                        className="flex items-end justify-between"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 + index * 0.05, duration: 0.3 }}
                                    >
                                        <p className="text-sm sm:text-base font-extrabold text-primary leading-none">{formattedPrice}</p>
                                    </motion.div>
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
