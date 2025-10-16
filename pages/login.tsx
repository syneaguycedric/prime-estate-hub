import { useState, FormEvent, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
    const router = useRouter();
    const { login, isAuthenticated, isLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    // Rediriger si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    // Validation du formulaire
    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        // Validation email
        if (!email) {
            errors.email = "L'email est requis";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Format d'email invalide";
        }

        // Validation mot de passe
        if (!password) {
            errors.password = "Le mot de passe est requis";
        } else if (password.length < 3) {
            errors.password = "Le mot de passe doit contenir au moins 3 caractères";
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
            // Utiliser la fonction login du contexte
            const result = await login(email, password);

            if (result.success) {
                // Redirection vers la page d'accueil
                router.push("/");
            }
            // Les erreurs sont maintenant gérées par le contexte avec des toasts
        } catch (err) {
            console.error("Login error:", err);
            // Les erreurs sont maintenant gérées par le contexte avec des toasts
        }
    };

    return (
        <>
            <Head>
                <title>Connexion - Kylimmo</title>
                <meta name="description" content="Connectez-vous à votre compte Kylimmo" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                {/* Background pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
                    <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-primary/5 to-transparent rounded-full blur-3xl" />
                </div>

                {/* Login Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
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
                                <CardTitle className="text-2xl font-bold">Connexion à Kylimmo</CardTitle>
                                <CardDescription className="text-muted-foreground mt-2">Accédez à votre espace personnel</CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Les erreurs sont maintenant affichées via des toasts */}

                                {/* Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="votre@email.com"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setValidationErrors((prev) => ({ ...prev, email: undefined }));
                                            }}
                                            className={`pl-10 ${validationErrors.email ? "border-destructive" : ""}`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {validationErrors.email && <p className="text-sm text-destructive">{validationErrors.email}</p>}
                                </div>

                                {/* Mot de passe */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setValidationErrors((prev) => ({ ...prev, password: undefined }));
                                            }}
                                            className={`pl-10 ${validationErrors.password ? "border-destructive" : ""}`}
                                            disabled={isLoading}
                                        />
                                    </div>
                                    {validationErrors.password && <p className="text-sm text-destructive">{validationErrors.password}</p>}
                                </div>

                                {/* Bouton de connexion */}
                                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Connexion en cours...
                                        </>
                                    ) : (
                                        <>
                                            Se connecter
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Lien mot de passe oublié */}
                            <div className="mt-6 text-center">
                                <Button variant="link" className="text-sm text-muted-foreground hover:text-primary">
                                    Mot de passe oublié ?
                                </Button>
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
                        En vous connectant, vous acceptez nos conditions d'utilisation
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

export default LoginPage;
