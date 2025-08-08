import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Bed, Bath, Square, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPropertyById } from "../data/properties";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const property = getPropertyById(id || "");

  useEffect(() => {
    if (!property) return;
    const title = `${property.title} – ${property.price}`;
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    metaDesc.setAttribute('content', `${property.title} à ${property.location}. ${property.surface}, ${property.bedrooms ?? 0} chambres, ${property.bathrooms ?? 0} salles de bain.`);
    document.head.appendChild(metaDesc);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.href);
    document.head.appendChild(canonical);
  }, [property]);

  if (!property) {
    return (
      <main className="container py-16">
        <div className="mb-6">
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour aux annonces
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Bien introuvable</h1>
        <p className="text-muted-foreground mt-2">Le bien demandé n'existe pas ou a été déplacé.</p>
      </main>
    );
  }

  return (
    <main className="bg-background">
      <section className="container py-6">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="story-link">Accueil</Link> <span className="mx-1">/</span> <span>Détail du bien</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{property.title}</h1>
        <p className="text-lg text-muted-foreground mb-6 flex items-center"><MapPin className="h-4 w-4 mr-2" />{property.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <img
              src={property.image}
              alt={`Photo du bien: ${property.title} – ${property.location}`}
              loading="lazy"
              className="w-full h-80 md:h-[28rem] object-cover rounded-lg shadow-sm"
            />

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-2xl">Détails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-foreground"><Square className="h-4 w-4 mr-2" />{property.surface}</div>
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center text-foreground"><Bed className="h-4 w-4 mr-2" />{property.bedrooms} chambre(s)</div>
                  )}
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center text-foreground"><Bath className="h-4 w-4 mr-2" />{property.bathrooms} salle(s) de bain</div>
                  )}
                  <div className="text-foreground">Type: {property.type}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{property.price}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">Appeler</Button>
                <Button variant="outline" className="w-full" size="lg">Demander une visite</Button>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold mb-3">Description</h2>
          <p className="text-muted-foreground leading-relaxed">
            Découvrez ce bien idéalement situé, offrant un excellent compromis entre confort et praticité. Lumineux, bien agencé et proche des commodités, il conviendra parfaitement à votre projet.
          </p>
        </section>
      </section>

      {/* Minimal structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Residence',
            name: property.title,
            address: { '@type': 'PostalAddress', addressLocality: property.location },
            offers: { '@type': 'Offer', price: property.price },
          }),
        }}
      />
    </main>
  );
};

export default PropertyDetail;
