import { Button } from "@/components/ui/button";
import React from "react";
import { motion } from "framer-motion";
import { User, LogOut, PlusCircle, Building2 } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const HomeHeader = () => {
    const { navigateWithTransition } = useNavigationTransition();
    const { isAuthenticated, user, logout } = useAuth();

    const handleHomeClick = () => {
        navigateWithTransition("/");
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigateWithTransition("/");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handlePublishClick = () => {
        if (!isAuthenticated) {
            if (typeof window !== "undefined") {
                sessionStorage.setItem("redirect_after_login", "/advertiser");
            }
            import("@/lib/toast-helpers").then(({ toast }) => {
                toast.warning("Connexion requise", {
                    description: "Vous devez être connecté pour devenir annonceur. Connectez-vous ou créez un compte.",
                    duration: 5000,
                });
            });
            navigateWithTransition("/login");
        } else {
            if (user?.role?.name !== "Advertiser") {
                navigateWithTransition("/advertiser");
                return;
            }
            navigateWithTransition("/create-listing");
        }
    };

    const getPublishButtonLabel = () => {
        return "Publier";
    };

    return (
        <motion.header
            className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border shadow-sm"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <motion.div
                    className="flex items-center space-x-2 cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleHomeClick}
                >
                    <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
                        <Image src="/assets/killimologo.png" alt="Kylimmo Logo" width={40} height={40} className="object-contain" />
                    </motion.div>
                    <span className="text-xl font-bold text-foreground">Kylimmo</span>
                </motion.div>

                {/* Navigation */}
                <nav className="flex items-center space-x-3">
                    {/* Link to Properties */}
                    <Button variant="ghost" onClick={() => navigateWithTransition("/properties")} className="hidden sm:flex">
                        Annonces
                    </Button>

                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="hidden md:flex">
                                    <User className="h-4 w-4 mr-2" />
                                    {user?.first_name || user?.email || "Mon compte"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        {user?.first_name && user?.last_name && (
                                            <p className="font-medium">
                                                {user.first_name} {user.last_name}
                                            </p>
                                        )}
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigateWithTransition("/profile")}>
                                    <User className="mr-2 h-4 w-4" />
                                    Mon profil
                                </DropdownMenuItem>
                                {user?.role?.name === "Advertiser" && (
                                    <DropdownMenuItem onClick={() => navigateWithTransition("/my-listings")}>
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Mon espace
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Se déconnecter
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button variant="ghost" size="sm" onClick={() => navigateWithTransition("/login")}>
                            <User className="h-4 w-4 mr-2" />
                            Connexion
                        </Button>
                    )}

                    <Button variant="hero" size="sm" onClick={handlePublishClick}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        {getPublishButtonLabel()}
                    </Button>
                </nav>
            </div>
        </motion.header>
    );
};

export default HomeHeader;
