import { useState, useMemo } from "react";
import PropertyCard from "@/components/ui/property-card";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { properties } from "@/data/properties";

interface FeaturedPropertiesProps {
  searchQuery?: string;
}

const PAGE_SIZE = 12;

const FeaturedProperties = ({ searchQuery = "" }: FeaturedPropertiesProps) => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const filteredProperties = useMemo(() => {
    const searchTerm = searchQuery || query;
    if (!searchTerm.trim()) return properties;
    
    return properties.filter(property => 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchQuery, query]);

  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginatedProperties = filteredProperties.slice(start, start + PAGE_SIZE);

  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
    
    // Scroll fluide vers le haut
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container">

        {paginatedProperties.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            Aucun bien ne correspond à votre recherche.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            {paginatedProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPage(page - 1);
                    }}
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    totalPages > 7 &&
                    pageNum !== 1 &&
                    pageNum !== totalPages &&
                    Math.abs(pageNum - page) > 2
                  ) {
                    if (
                      (pageNum === 2 && page > 4) ||
                      (pageNum === totalPages - 1 && page < totalPages - 3)
                    ) {
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
                        isActive={page === pageNum}
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
                      goToPage(page + 1);
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