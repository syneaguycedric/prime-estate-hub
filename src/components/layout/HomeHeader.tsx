import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, LogOut, PlusCircle, Building2, Menu } from "lucide-react";
import { useNavigationTransition } from "@/hooks/use-navigation-transition";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const HomeHeader = () => {
    const { navigateWithTransition } = useNavigationTransition();
    const { isAuthenticated, user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        return "Faire une annonce";
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
                <nav className="flex items-center space-x-2 md:space-x-3">
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
                        <Button variant="ghost" size="sm" className="hidden md:flex" onClick={() => navigateWithTransition("/login")}>
                            <User className="h-4 w-4 mr-2" />
                            Connexion
                        </Button>
                    )}

                    {/* Bouton Publier - visible sur mobile et desktop */}
                    <Button variant="hero" size="sm" onClick={handlePublishClick} className="flex items-center text-sm md:text-base lg:text-lg">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        <span>{getPublishButtonLabel()}</span>
                    </Button>

                    {/* Menu hamburger - visible uniquement sur mobile */}
                    <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="h-4 w-4" />
                    </Button>
                </nav>
            </div>

            {/* Menu Mobile */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetContent side="right" className="w-full sm:w-80">
                    <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                    </SheetHeader>

                    <div className="mt-6 space-y-6">
                        {/* Navigation */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Navigation</h3>
                            <div className="space-y-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-12"
                                    onClick={() => {
                                        navigateWithTransition("/");
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    Accueil
                                </Button>

                                <Button
                                    variant="ghost"
                                    className="w-full justify-start h-12"
                                    onClick={() => {
                                        navigateWithTransition("/properties");
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    Toutes les annonces
                                </Button>

                                {isAuthenticated ? (
                                    <>
                                        {user?.role?.name === "Advertiser" && (
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-start h-12"
                                                onClick={() => {
                                                    navigateWithTransition("/my-listings");
                                                    setIsMobileMenuOpen(false);
                                                }}
                                            >
                                                <Building2 className="h-4 w-4 mr-3" />
                                                Mon espace
                                            </Button>
                                        )}

                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-12"
                                            onClick={() => {
                                                navigateWithTransition("/profile");
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <User className="h-4 w-4 mr-3" />
                                            Mon profil
                                        </Button>

                                        <Button
                                            variant="hero"
                                            className="w-full justify-start h-12"
                                            onClick={() => {
                                                handlePublishClick();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <PlusCircle className="h-4 w-4 mr-3" />
                                            {getPublishButtonLabel()}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-12 text-destructive"
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Se déconnecter
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start h-12"
                                            onClick={() => {
                                                navigateWithTransition("/login");
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <User className="h-4 w-4 mr-3" />
                                            Connexion
                                        </Button>

                                        <Button
                                            variant="hero"
                                            className="w-full justify-start h-12"
                                            onClick={() => {
                                                handlePublishClick();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            <PlusCircle className="h-4 w-4 mr-3" />
                                            {getPublishButtonLabel()}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </motion.header>
    );
};

export default HomeHeader;
