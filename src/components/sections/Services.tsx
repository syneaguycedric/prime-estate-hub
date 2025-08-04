import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, Users, Shield, TrendingUp, HeartHandshake } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: Search,
      title: "Recherche personnalisée",
      description: "Trouvez le bien de vos rêves grâce à nos outils de recherche avancés et nos conseillers experts."
    },
    {
      icon: Home,
      title: "Estimation gratuite",
      description: "Obtenez une estimation précise de votre bien immobilier grâce à notre expertise du marché local."
    },
    {
      icon: Users,
      title: "Accompagnement complet",
      description: "De la recherche à la signature, nos experts vous accompagnent à chaque étape de votre projet."
    },
    {
      icon: Shield,
      title: "Transactions sécurisées",
      description: "Bénéficiez de notre garantie et de nos partenaires juridiques pour des transactions en toute sérénité."
    },
    {
      icon: TrendingUp,
      title: "Analyse de marché",
      description: "Accédez à nos analyses exclusives du marché immobilier pour prendre les meilleures décisions."
    },
    {
      icon: HeartHandshake,
      title: "Service client premium",
      description: "Une équipe dédiée disponible 7j/7 pour répondre à toutes vos questions et préoccupations."
    }
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Nos services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une gamme complète de services pour vous accompagner dans tous vos projets immobiliers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card border-border/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;