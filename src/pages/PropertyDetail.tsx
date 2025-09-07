import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Bed, Bath, Square, MapPin, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPropertyById } from "../data/properties";
import PageNavbar from "@/components/layout/PageNavbar";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const property = getPropertyById(id || "");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      <div className="bg-background">
        <PageNavbar breadcrumbs={[{ label: "Bien introuvable" }]} />
        <main className="container py-16 pt-20">
          <h1 className="text-2xl font-bold text-foreground">Bien introuvable</h1>
          <p className="text-muted-foreground mt-2">Le bien demandé n'existe pas ou a été déplacé.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <PageNavbar breadcrumbs={[
        { label: "Biens immobiliers", href: "/" },
        { label: property.title }
      ]} />
      <main>
        <section className="container py-6 pt-20">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{property.title}</h1>
        <p className="text-lg text-muted-foreground mb-6 flex items-center"><MapPin className="h-4 w-4 mr-2" />{property.location}</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Image principale */}
            <div className="mb-4">
              <img
                src={property.images[selectedImageIndex]}
                alt={`Photo ${selectedImageIndex + 1} du bien: ${property.title} – ${property.location}`}
                loading="lazy"
                className="w-full h-80 md:h-[28rem] object-cover rounded-lg shadow-sm"
              />
            </div>

            {/* Miniatures */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-primary shadow-md' 
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Miniature ${index + 1}`}
                    className="w-20 h-16 object-cover"
                  />
                </button>
              ))}
            </div>

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

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Informations de contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">Marie Dubois</p>
                    <p className="text-muted-foreground">Agent immobilier</p>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-3 text-primary" />
                  <span>01 23 45 67 89</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-3 text-primary" />
                  <span>marie.dubois@immobilier.fr</span>
                </div>
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
    </div>
  );
};

export default PropertyDetail;
