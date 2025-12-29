import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PromotionRange, fetchPromotionRanges, PaymentMethod, fetchPaymentMethods, createPromotion } from "@/lib/directus-api";
import PricingCard from "@/components/ui/pricing-card";
import PaymentMethodCard from "@/components/ui/payment-method-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/lib/toast-helpers";

interface BoostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    propertyId?: string;
}

export default function BoostModal({ open, onOpenChange, propertyId }: BoostModalProps) {
    const [promotions, setPromotions] = useState<PromotionRange[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPromotion, setSelectedPromotion] = useState<PromotionRange | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

    useEffect(() => {
        if (open && promotions.length === 0 && !loading) {
            loadPromotions();
        }
        if (open && paymentMethods.length === 0 && !loadingPaymentMethods) {
            loadPaymentMethods();
        }
    }, [open]);

    // Nettoyer pointer-events quand le modal se ferme
    useEffect(() => {
        if (!open) {
            // Nettoyage immédiat quand le modal est fermé
            const body = document.body;
            body.style.pointerEvents = "";
            body.style.removeProperty("pointer-events");
            
            // Nettoyage supplémentaire avec délais pour être sûr
            const timeouts = [
                setTimeout(() => {
                    body.style.pointerEvents = "";
                    body.style.removeProperty("pointer-events");
                }, 50),
                setTimeout(() => {
                    body.style.pointerEvents = "";
                    body.style.removeProperty("pointer-events");
                    console.log("[BOOST MODAL] Pointer-events cleaned after modal close");
                }, 200),
            ];

            return () => {
                timeouts.forEach(timeout => clearTimeout(timeout));
            };
        }
    }, [open]);

    const loadPromotions = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchPromotionRanges();
            if (result.success && result.promotions) {
                setPromotions(result.promotions);
            } else {
                setError(result.error || "Impossible de charger les promotions");
            }
        } catch (err) {
            console.error("[BOOST MODAL] Error loading promotions:", err);
            setError("Une erreur est survenue lors du chargement des promotions");
        } finally {
            setLoading(false);
        }
    };

    const loadPaymentMethods = async () => {
        setLoadingPaymentMethods(true);
        try {
            const result = await fetchPaymentMethods();
            if (result.success && result.paymentMethods) {
                setPaymentMethods(result.paymentMethods);
            }
        } catch (err) {
            console.error("[BOOST MODAL] Error loading payment methods:", err);
        } finally {
            setLoadingPaymentMethods(false);
        }
    };

    const handleSelectPromotion = (promotion: PromotionRange) => {
        setSelectedPromotion(promotion);
        setSelectedPaymentMethod(null); // Réinitialiser le moyen de paiement sélectionné
        // TODO: Implémenter l'action de sélection (appel API pour booster l'annonce)
        console.log("[BOOST MODAL] Selected promotion:", promotion, "for property:", propertyId);
    };

    const handleSelectPaymentMethod = (paymentMethod: PaymentMethod) => {
        setSelectedPaymentMethod(paymentMethod);
        // TODO: Implémenter l'action de paiement
        console.log("[BOOST MODAL] Selected payment method:", paymentMethod);
    };

    const handleValidate = async () => {
        if (!selectedPromotion || !selectedPaymentMethod || !propertyId) {
            toast.error("Erreur", {
                description: "Veuillez sélectionner une promotion et un moyen de paiement",
            });
            return;
        }

        setIsValidating(true);
        try {
            const result = await createPromotion({
                range: selectedPromotion.id,
                payment_method: selectedPaymentMethod.id,
                estate_promotions: [
                    {
                        real_estates_id: propertyId,
                    },
                ],
            });

            if (result.success) {
                toast.success("Promotion créée", {
                    description: "Votre annonce a été boostée avec succès",
                });
                
                // Fermer le modal après un court délai
                setTimeout(() => {
                    handleOpenChange(false);
                    // Réinitialiser les sélections
                    setSelectedPromotion(null);
                    setSelectedPaymentMethod(null);
                }, 1000);
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de créer la promotion",
                });
            }
        } catch (error) {
            console.error("[BOOST MODAL] Error validating:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la création de la promotion",
            });
        } finally {
            setIsValidating(false);
        }
    };

    // Calculer les classes flex selon le nombre d'éléments
    const getFlexClasses = (count: number) => {
        if (count === 1) return "justify-center";
        if (count === 2) return "justify-around";
        return "justify-between";
    };

    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
        
        // Nettoyage immédiat quand on ferme le modal
        if (!isOpen) {
            const body = document.body;
            body.style.pointerEvents = "";
            body.style.removeProperty("pointer-events");
            
            // Nettoyage supplémentaire avec délais
            setTimeout(() => {
                body.style.pointerEvents = "";
                body.style.removeProperty("pointer-events");
            }, 50);
            
            setTimeout(() => {
                body.style.pointerEvents = "";
                body.style.removeProperty("pointer-events");
            }, 200);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Booster votre annonce</DialogTitle>
                    <DialogDescription>
                        Choisissez une promotion pour mettre en avant votre annonce et augmenter sa visibilité.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-4 p-6 border rounded-lg">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-8 w-1/2" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <Alert className="border-destructive/50 text-destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    ) : promotions.length === 0 ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>Aucune promotion disponible pour le moment.</AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {/* Promotions */}
                            <div className={`flex flex-wrap gap-4 ${getFlexClasses(promotions.length)}`}>
                                {promotions.map((promotion) => (
                                    <PricingCard
                                        key={promotion.id}
                                        promotion={promotion}
                                        onSelect={handleSelectPromotion}
                                        isSelected={selectedPromotion?.id === promotion.id}
                                    />
                                ))}
                            </div>

                            {/* Moyens de paiement - affichés seulement si une promotion est sélectionnée */}
                            <AnimatePresence>
                                {selectedPromotion && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="mt-8 pt-8 border-t overflow-hidden"
                                    >
                                        <motion.h3
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                            className="text-lg font-semibold mb-4"
                                        >
                                            Choisissez un moyen de paiement
                                        </motion.h3>
                                        {loadingPaymentMethods ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className={`flex flex-wrap gap-4 ${getFlexClasses(3)}`}
                                            >
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.3 + i * 0.1 }}
                                                        className="w-32 h-32 border rounded-lg p-4"
                                                    >
                                                        <Skeleton className="w-full h-20 mb-2" />
                                                        <Skeleton className="h-4 w-full" />
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        ) : paymentMethods.length === 0 ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>Aucun moyen de paiement disponible pour le moment.</AlertDescription>
                                                </Alert>
                                            </motion.div>
                                        ) : (
                                            <>
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.3 }}
                                                    className={`flex flex-wrap gap-4 ${getFlexClasses(paymentMethods.length)}`}
                                                >
                                                    {paymentMethods.map((paymentMethod, index) => (
                                                        <motion.div
                                                            key={paymentMethod.id}
                                                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            transition={{
                                                                delay: 0.4 + index * 0.1,
                                                                duration: 0.3,
                                                                ease: "easeOut",
                                                            }}
                                                        >
                                                            <PaymentMethodCard
                                                                paymentMethod={paymentMethod}
                                                                onSelect={handleSelectPaymentMethod}
                                                                isSelected={selectedPaymentMethod?.id === paymentMethod.id}
                                                            />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                        delay: 0.4 + paymentMethods.length * 0.1 + 0.1,
                                                        duration: 0.3,
                                                        ease: "easeOut",
                                                    }}
                                                    className="mt-6 flex justify-center"
                                                >
                                                    <Button
                                                        onClick={handleValidate}
                                                        disabled={!selectedPaymentMethod || isValidating}
                                                        size="lg"
                                                        className="min-w-[200px]"
                                                    >
                                                        {isValidating ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Validation...
                                                            </>
                                                        ) : (
                                                            "Valider"
                                                        )}
                                                    </Button>
                                                </motion.div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

