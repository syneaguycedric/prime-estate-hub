import { PromotionRange } from "@/lib/directus-api";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package } from "lucide-react";

interface PricingCardProps {
    promotion: PromotionRange;
    onSelect?: (promotion: PromotionRange) => void;
    isSelected?: boolean;
}

export default function PricingCard({ promotion, onSelect, isSelected }: PricingCardProps) {
    // Formater le prix en FCFA
    const formattedPrice = new Intl.NumberFormat('fr-FR').format(promotion.price);
    
    return (
        <Card className={`relative h-full flex flex-col transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">{promotion.title}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
                {/* Prix */}
                <div className="space-y-1">
                    <div className="text-3xl font-bold text-primary">
                        {formattedPrice} <span className="text-lg font-normal text-muted-foreground">FCFA</span>
                    </div>
                </div>

                {/* Caractéristiques */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Durée : <span className="font-semibold text-foreground">{promotion.duration} jour{promotion.duration > 1 ? 's' : ''}</span>
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Annonce{promotion.items_count > 1 ? 's' : ''} : <span className="font-semibold text-foreground">{promotion.items_count}</span>
                        </span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <Button
                    onClick={() => onSelect?.(promotion)}
                    variant={isSelected ? "default" : "outline"}
                    className="w-full"
                    disabled={!onSelect}
                >
                    {isSelected ? "Sélectionné" : "Sélectionner"}
                </Button>
            </CardFooter>
        </Card>
    );
}

