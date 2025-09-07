import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";

interface PageNavbarProps {
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

const PageNavbar = ({ breadcrumbs = [] }: PageNavbarProps) => {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const { navigateWithTransition } = useNavigationTransition();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleBack = () => {
        navigateWithTransition("/");
    };

    const isHomePage = location.pathname === "/";

    if (isHomePage) {
        return null;
    }

    return (
        <motion.nav
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${
                isScrolled
                    ? "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm"
                    : "bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="container flex h-14 items-center justify-between">
                {/* Breadcrumbs à gauche */}
                <div className="flex items-center flex-1">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <button onClick={() => navigateWithTransition("/")} className="flex items-center hover:text-primary transition-colors">
                                    <Home className="h-4 w-4" />
                                </button>
                            </BreadcrumbItem>
                            {breadcrumbs.map((crumb, index) => (
                                <div key={index} className="flex items-center">
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {crumb.href && index < breadcrumbs.length - 1 ? (
                                            <button onClick={() => navigateWithTransition(crumb.href || "/")} className="hover:text-primary transition-colors">
                                                {crumb.label}
                                            </button>
                                        ) : (
                                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                </div>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {/* Bouton retour à droite */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Retour</span>
                    </Button>
                </motion.div>
            </div>
        </motion.nav>
    );
};

export default PageNavbar;
