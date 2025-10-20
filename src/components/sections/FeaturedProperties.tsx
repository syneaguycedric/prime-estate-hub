import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import PropertyCardAnimated from "@/components/ui/property-card-animated";
import PropertyListCardAnimated from "@/components/ui/property-list-card-animated";
import PropertySkeleton from "@/components/ui/property-skeleton";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { Property } from "@/data/properties";

interface FeaturedPropertiesProps {
    properties: Property[];
    pagination: { total: number; page: number; totalPages: number };
    onPageChange: (page: number) => void;
    view: "grid" | "list";
    isLoading?: boolean;
}

const FeaturedProperties = ({ properties, pagination, onPageChange, view, isLoading = false }: FeaturedPropertiesProps) => {
    const goToPage = (p: number) => {
        const clamped = Math.min(Math.max(1, p), pagination.totalPages);
        onPageChange(clamped);

        // Scroll fluide vers le haut
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-8 bg-background">
            <div className="container">
                {isLoading ? (
                    <PropertySkeleton view={view} count={12} />
                ) : properties.length === 0 ? (
                    <motion.p className="text-center text-muted-foreground py-16" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        Aucun bien ne correspond à votre recherche.
                    </motion.p>
                ) : (
                    <LayoutGroup>
                        <motion.div
                            className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12" : "space-y-4 mb-12"}
                            layout
                            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <AnimatePresence>
                                {properties.map((property, index) => (
                                    <motion.div
                                        key={`${view}-${property.id}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.02,
                                            ease: [0.25, 0.46, 0.45, 0.94],
                                        }}
                                    >
                                        {view === "grid" ? <PropertyCardAnimated {...property} index={index} /> : <PropertyListCardAnimated {...property} index={index} />}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </LayoutGroup>
                )}

                {pagination.totalPages > 1 && (
                    <nav aria-label="Pagination" className="flex justify-center">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            goToPage(pagination.page - 1);
                                        }}
                                    />
                                </PaginationItem>

                                {[...Array(pagination.totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (pagination.totalPages > 7 && pageNum !== 1 && pageNum !== pagination.totalPages && Math.abs(pageNum - pagination.page) > 2) {
                                        if ((pageNum === 2 && pagination.page > 4) || (pageNum === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3)) {
                                            return (
                                                <PaginationItem key={`ellipsis-${pageNum}`}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }
                                        return null;
                                    }
                                    return (
                                        <PaginationItem key={pageNum}>
                                            <PaginationLink
                                                href="#"
                                                isActive={pagination.page === pageNum}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    goToPage(pageNum);
                                                }}
                                            >
                                                {pageNum}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}

                                <PaginationItem>
                                    <PaginationNext
                                        href="#"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            goToPage(pagination.page + 1);
                                        }}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </nav>
                )}
            </div>
        </section>
    );
};

export default FeaturedProperties;
