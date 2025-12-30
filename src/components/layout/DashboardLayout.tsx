import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Menu, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "./DashboardSidebar";
import Footer from "./Footer";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
    const router = useRouter();
    const { navigateWithTransition } = useNavigationTransition();
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sur desktop, le sidebar est toujours ouvert
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize(); // Appel initial
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Gérer les query params pour les tabs
    useEffect(() => {
        const { tab } = router.query;
        if (tab && typeof tab === "string") {
            setCurrentTab(tab);
        }
    }, [router.query]);

    // Charger l'état du collapse depuis localStorage
    useEffect(() => {
        const saved = localStorage.getItem("dashboard-sidebar-collapsed");
        if (saved) {
            setIsCollapsed(JSON.parse(saved));
        }
    }, []);

    const handleTabChange = (tab: string) => {
        setCurrentTab(tab);
    };

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBackToHome = () => {
        navigateWithTransition("/");
    };

    const sidebarWidth = isCollapsed ? 80 : 280;

    // Empêcher le scroll du body quand le dashboard est monté
    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
        };
    }, []);

    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header avec bouton retour */}
            <div className="flex-shrink-0 z-40 bg-background border-b border-border">
                <div className="flex h-14 items-center justify-between px-4">
                    {/* Titre à gauche */}
                    <div className="hidden lg:block">
                        <h1 className="text-lg font-semibold">Mon espace</h1>
                    </div>
                    <div className="lg:hidden">
                        <h1 className="text-base font-semibold">Mon espace</h1>
                    </div>

                    {/* Bouton retour à droite */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleBackToHome} className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground">
                            <Home className="h-4 w-4" />
                            <span className="hidden sm:inline">Revenir à l'accueil</span>
                        </Button>
                        {/* Mobile menu button */}
                        <Button variant="ghost" size="sm" onClick={handleSidebarToggle} className="lg:hidden">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <DashboardSidebar
                    isOpen={sidebarOpen}
                    onToggle={handleSidebarToggle}
                    activeTab={currentTab}
                    onTabChange={handleTabChange}
                    isCollapsed={isCollapsed}
                    onCollapseChange={setIsCollapsed}
                    user={user}
                />

                {/* Main content */}
                <div className="flex-1 transition-all duration-300 overflow-y-auto flex flex-col">
                    {/* Content */}
                    <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="container mx-auto px-3 md:px-4 py-3 md:py-4 flex-1">
                        {children}
                    </motion.main>
                    {/* Footer */}
                    <Footer />
                </div>
            </div>
        </div>
    );
}
