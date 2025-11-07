import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, LayoutList, Building2, ChevronLeft, ChevronRight, Menu, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { User } from "@/lib/directus-api";

interface DashboardSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
    isCollapsed: boolean;
    onCollapseChange: (collapsed: boolean) => void;
    user?: User | null;
}

const menuItems = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/my-listings?tab=dashboard",
    },
    {
        id: "listings",
        label: "Mes annonces",
        icon: LayoutList,
        href: "/my-listings?tab=listings",
    },
    {
        id: "agencies",
        label: "Agences",
        icon: Building2,
        href: "/my-listings?tab=agencies",
    },
];

export default function DashboardSidebar({ isOpen, onToggle, activeTab, onTabChange, isCollapsed, onCollapseChange, user }: DashboardSidebarProps) {
    const router = useRouter();

    // Sauvegarder l'état du collapse
    const handleToggleCollapse = () => {
        const newCollapsed = !isCollapsed;
        onCollapseChange(newCollapsed);
        localStorage.setItem("dashboard-sidebar-collapsed", JSON.stringify(newCollapsed));
    };

    const handleItemClick = (item: (typeof menuItems)[0]) => {
        onTabChange(item.id);
        router.push(item.href);
    };

    // Vérifier si l'utilisateur est annonceur
    const isAdvertiser = user?.role?.name === "Advertiser";

    return (
        <>
            {/* Overlay pour mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    width: isCollapsed ? 80 : 280,
                    x: isOpen ? 0 : -280,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn("fixed left-0 top-0 z-50 h-full bg-card border-r border-border flex flex-col", "lg:translate-x-0 lg:static lg:z-auto")}
                style={{
                    height: "calc(100vh - 60px)", // Ajuster pour le header
                    top: "60px", // Positionner sous le header
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <AnimatePresence mode="wait">
                        {!isCollapsed && (
                            <motion.div
                                key="logo"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center space-x-2"
                            >
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-sm">K</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg">Mon espace</span>
                                    {isAdvertiser && (
                                        <Badge variant="default" className="w-fit text-xs px-2 py-0.5 mt-1">
                                            <Crown className="h-3 w-3 mr-1" />
                                            Annonceur
                                        </Badge>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center space-x-2">
                        {/* Bouton collapse (desktop seulement) */}
                        <Button variant="ghost" size="sm" onClick={handleToggleCollapse} className="hidden lg:flex">
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>

                        {/* Bouton fermer (mobile seulement) */}
                        <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Menu items */}
                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={cn(
                                    "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />

                                <AnimatePresence>
                                    {!isCollapsed && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -10 }}
                                            transition={{ duration: 0.2 }}
                                            className="font-medium"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border">
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.2 }}
                                className="text-xs text-muted-foreground text-center"
                            >
                                Dashboard Kylimmo
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.aside>
        </>
    );
}
