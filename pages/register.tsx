import { useState, FormEvent, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Lock, User, MapPin, Phone, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const RegisterPage = () => {
    const router = useRouter();
    const { register, isAuthenticated, isLoading } = useAuth();

    // États du formulaire
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirmPassword: "",
        title: "",
        location: "",
        phoneNumber: "",
        email_notifications: true,
    });

    const [validationErrors, setValidationErrors] = useState<{
        first_name?: string;
        last_name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Validation du formulaire
    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        // Validation prénom
        if (!formData.first_name.trim()) {
            errors.first_name = "Le prénom est requis";
        } else if (formData.first_name.trim().length < 2) {
            errors.first_name = "Le prénom doit contenir au moins 2 caractères";
        }

        // Validation nom
        if (!formData.last_name.trim()) {
            errors.last_name = "Le nom est requis";
        } else if (formData.last_name.trim().length < 2) {
            errors.last_name = "Le nom doit contenir au moins 2 caractères";
        }

        // Validation email
        if (!formData.email) {
            errors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Format d'email invalide";
        }

        // Validation mot de passe
        if (!formData.password) {
            errors.password = "Le mot de passe est requis";
        } else if (formData.password.length < 3) {
            errors.password = "Le mot de passe doit contenir au moins 3 caractères";
        }

        // Validation confirmation mot de passe
        if (!formData.confirmPassword) {
            errors.confirmPassword = "La confirmation du mot de passe est requise";
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Les mots de passe ne correspondent pas";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Valider le formulaire
        if (!validateForm()) {
            return;
        }

        try {
            // Préparer les données pour l'API
            const registerData = {
                first_name: formData.first_name.trim(),
                last_name: formData.last_name.trim(),
                email: formData.email.trim(),
                password: formData.password,
                title: formData.title.trim() || undefined,
                location: formData.location.trim() || undefined,
                phoneNumber: formData.phoneNumber.trim() || undefined,
                email_notifications: formData.email_notifications,
            };

            // Utiliser la fonction register du contexte
            const result = await register(registerData);

            if (result.success) {
                // Redirection vers la page d'accueil
                router.push("/");
            }
            // Les erreurs sont maintenant gérées par le contexte avec des toasts
        } catch (err) {
            console.error("Registration error:", err);
            // Les erreurs sont maintenant gérées par le contexte avec des toasts
        }
    };

    // Gestion des changements de champs
    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Effacer l'erreur de validation pour ce champ
        if (validationErrors[field as keyof typeof validationErrors]) {
            setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <>
            <Head>
                <title>Inscription - Kylimmo</title>
                <meta name="description" content="Créez votre compte Kylimmo" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                {/* Background pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
                </div>

                {/* Register Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl relative z-10">
                    <Card className="shadow-xl">
                        <CardHeader className="space-y-4 text-center pb-6">
                            {/* Logo */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                                className="flex justify-center mb-2"
                            >
                                <Image src="/assets/killimologo.png" alt="Kylimmo Logo" width={80} height={80} className="object-contain" />
                            </motion.div>

                            <div>
                                <CardTitle className="text-2xl font-bold">Créer un compte Kylimmo</CardTitle>
                                <CardDescription className="text-muted-foreground mt-2">Rejoignez notre communauté immobilière</CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Informations personnelles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Prénom */}
                                    <div className="space-y-2">
                                        <Label htmlFor="first_name">Prénom *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="first_name"
                                                type="text"
                                                placeholder="Votre prénom"
                                                value={formData.first_name}
                                                onChange={(e) => handleInputChange("first_name", e.target.value)}
                                                className={`pl-10 ${validationErrors.first_name ? "border-destructive" : ""}`}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.first_name && <p className="text-sm text-destructive">{validationErrors.first_name}</p>}
                                    </div>

                                    {/* Nom */}
                                    <div className="space-y-2">
                                        <Label htmlFor="last_name">Nom *</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="last_name"
                                                type="text"
                                                placeholder="Votre nom"
                                                value={formData.last_name}
                                                onChange={(e) => handleInputChange("last_name", e.target.value)}
                                                className={`pl-10 ${validationErrors.last_name ? "border-destructive" : ""}`}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.last_name && <p className="text-sm text-destructive">{validationErrors.last_name}</p>}
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className={`pl-10 ${validationErrors.email ? "border-destructive" : ""}`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                                </div>

                                {/* Mot de passe */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Mot de passe *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange("password", e.target.value)}
                                                className={`pl-10 ${validationErrors.password ? "border-destructive" : ""}`}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                className={`pl-10 ${validationErrors.confirmPassword ? "border-destructive" : ""}`}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        {validationErrors.confirmPassword && <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>}
                                    </div>
                                </div>

                                {/* Informations optionnelles */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Titre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Titre</Label>
                                        <Select value={formData.title} onValueChange={(value) => handleInputChange("title", value)} disabled={isLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionnez un titre" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Monsieur">Monsieur</SelectItem>
                                                <SelectItem value="Madame">Madame</SelectItem>
                                                <SelectItem value="Mademoiselle">Mademoiselle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Localisation */}
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Localisation</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                type="text"
                                                placeholder="Cocody, Abidjan"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange("location", e.target.value)}
                                                className="pl-10"
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Téléphone */}
                                <div className="space-y-2">
                                    <Label htmlFor="phoneNumber">Téléphone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="+225 07 77 77 07 11"
                                            value={formData.phoneNumber}
                                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                                            className="pl-10"
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Notifications email */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="email_notifications"
                                        checked={formData.email_notifications}
                                        onCheckedChange={(checked) => handleInputChange("email_notifications", checked as boolean)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor="email_notifications" className="text-sm">
                                        Recevoir les notifications par email
                                    </Label>
                                </div>

                                {/* Bouton d'inscription */}
                                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Création du compte...
                                        </>
                                    ) : (
                                        <>
                                            Créer mon compte
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Lien vers la connexion */}
                            <div className="mt-6 text-center border-t pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Vous avez déjà un compte ?{" "}
                                    <Button variant="link" onClick={() => router.push("/login")} className="text-primary font-semibold p-0 h-auto" disabled={isLoading}>
                                        Connectez-vous
                                    </Button>
                                </p>
                            </div>

                            {/* Retour à l'accueil */}
                            <div className="mt-4 text-center">
                                <Button variant="ghost" onClick={() => router.push("/")} className="text-sm" disabled={isLoading}>
                                    Retour à l'accueil
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Footer text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="text-center text-sm text-muted-foreground mt-6"
                    >
                        En créant un compte, vous acceptez nos conditions d'utilisation
                    </motion.p>
                </motion.div>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {},
    };
};

export default RegisterPage;
