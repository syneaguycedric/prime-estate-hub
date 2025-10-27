import * as React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
    images: string[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
    altPrefix: string;
}

const ImageLightbox = ({ images, initialIndex, isOpen, onClose, altPrefix }: ImageLightboxProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);

    // Synchroniser l'index avec la prop initialIndex
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    // Navigation clavier
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case "ArrowLeft":
                    event.preventDefault();
                    goToPrevious();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    goToNext();
                    break;
                case "Escape":
                    event.preventDefault();
                    onClose();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    const handleDragEnd = (event: any, info: any) => {
        const threshold = 30;
        const velocity = info.velocity.x;
        const offset = info.offset.x;

        if (Math.abs(offset) > threshold || Math.abs(velocity) > 300) {
            if (offset > 0 || velocity > 0) {
                goToPrevious();
            } else {
                goToNext();
            }
        }
        setDragDirection(null);
    };

    const handleDrag = (event: any, info: any) => {
        if (info.offset.x > 20) {
            setDragDirection("right");
        } else if (info.offset.x < -20) {
            setDragDirection("left");
        } else {
            setDragDirection(null);
        }
    };

    if (!images.length) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-screen max-h-screen w-screen h-screen p-0 border-0 bg-black/10 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                aria-label="Galerie d'images"
                onPointerDownOutside={onClose}
                onEscapeKeyDown={onClose}
            >
                <div
                    className="relative w-full h-full flex items-center justify-center"
                    onClick={(e) => {
                        // Fermer seulement si on clique sur le conteneur, pas sur l'image ou les boutons
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                >
                    {/* Bouton fermer */}
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white" onClick={onClose}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fermer</span>
                    </Button>

                    {/* Bouton précédent */}
                    {images.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-3"
                            onClick={goToPrevious}
                        >
                            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="sr-only">Image précédente</span>
                        </Button>
                    )}

                    {/* Bouton suivant */}
                    {images.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white opacity-70 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-3"
                            onClick={goToNext}
                        >
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="sr-only">Image suivante</span>
                        </Button>
                    )}

                    {/* Conteneur d'image avec drag */}
                    <motion.div
                        className="relative w-full h-full flex items-center justify-center p-2 md:p-6 group z-20"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDrag={handleDrag}
                        onDragEnd={handleDragEnd}
                        whileDrag={{ cursor: "grabbing" }}
                        onPointerDown={(e) => {
                            // Empêcher la propagation du clic si on clique sur l'image
                            e.stopPropagation();
                        }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentIndex}
                                src={images[currentIndex]}
                                alt={`${altPrefix} - Image ${currentIndex + 1}`}
                                className="max-w-[calc(100vw-2rem)] max-h-[calc(100vh-10rem)] md:max-w-[calc(100vw-4rem)] md:max-h-[calc(100vh-12rem)] object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                                initial={{
                                    opacity: 0,
                                    scale: 0.95,
                                    x: dragDirection === "left" ? -100 : dragDirection === "right" ? 100 : 0,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.95,
                                    x: dragDirection === "left" ? 100 : dragDirection === "right" ? -100 : 0,
                                }}
                                transition={{
                                    duration: 0.3,
                                    ease: [0.25, 0.46, 0.45, 0.94],
                                }}
                                loading="eager"
                                style={{ willChange: "transform" }}
                            />
                        </AnimatePresence>
                    </motion.div>

                    {/* Indicateur de position */}
                    {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-50">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}

                    {/* Indicateurs de navigation (mobile) */}
                    {images.length > 1 && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 pb-safe z-50">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    className={cn("w-3 h-3 md:w-2 md:h-2 rounded-full transition-all", index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/75")}
                                    onClick={() => setCurrentIndex(index)}
                                    aria-label={`Aller à l'image ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImageLightbox;
