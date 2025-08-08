import { useEffect, useMemo, useState } from "react";
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

const PAGE_SIZE = 9;

const PropertiesList = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // SEO: title, meta description, canonical
  useEffect(() => {
    document.title = "Tous les biens immobiliers | Agence Immo";

    const descText =
      "Catalogue complet des biens immobiliers à vendre et à louer. Filtrez et parcourez toutes nos annonces.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", descText.substring(0, 160));

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/biens`);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      [p.title, p.location, p.type].some((f) => f.toLowerCase().includes(q))
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  // Reset to page 1 when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  const goToPage = (p: number) => {
    const clamped = Math.min(Math.max(1, p), totalPages);
    setPage(clamped);
  };

  return (
    <main className="bg-background">
      <section className="py-12">
        <div className="container space-y-8">
          <header className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Tous les biens immobiliers
            </h1>
            <p className="text-muted-foreground">
              Parcourez l'ensemble de notre catalogue et trouvez le bien idéal.
            </p>
          </header>

          <div className="max-w-xl mx-auto">
            <label htmlFor="search" className="sr-only">
              Rechercher un bien
            </label>
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par titre, ville ou type (Appartement, Maison, …)"
            />
          </div>

          <section aria-label="Liste des biens">
            {paginated.length === 0 ? (
              <p className="text-center text-muted-foreground py-16">
                Aucun bien ne correspond à votre recherche.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginated.map((p) => (
                  <PropertyCard key={p.id} {...p} />
                ))}
              </div>
            )}
          </section>

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
    </main>
  );
};

export default PropertiesList;
