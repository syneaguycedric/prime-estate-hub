import Header from "@/components/layout/Header";
import FeaturedProperties from "@/components/sections/FeaturedProperties";
import Services from "@/components/sections/Services";
import Footer from "@/components/layout/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FeaturedProperties />
      <Services />
      <Footer />
    </div>
  );
};

export default Index;
