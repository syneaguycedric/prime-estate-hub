import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Edit2, Save, X, Loader2, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageNavbar from "@/components/layout/PageNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, updateUserProfile, User } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";

const ProfilePage = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, authData, user: contextUser, refreshUser, isRefreshing } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [profile, setProfile] = useState<User | null>(null);

    // Formulaire
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [location, setLocation] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Redirection si non authentifié (seulement si pas de refresh en cours)
    useEffect(() => {
        // Ne rien faire pendant le chargement ou le refresh
        if (authLoading || isRefreshing) {
            return;
        }

        // Vérifier seulement si pas de refresh en cours
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router, isRefreshing]);

    // Utiliser les données du contexte au lieu de charger séparément
    useEffect(() => {
        if (contextUser) {
            setProfile(contextUser);
            setFirstName(contextUser.first_name || "");
            setLastName(contextUser.last_name || "");
            setLocation(contextUser.location || "");
            setTitle(contextUser.title || "");
            setDescription(contextUser.description || "");
            setPhoneNumber(contextUser.phoneNumber || contextUser.account?.phoneNumber || "");
            setIsLoadingProfile(false);
        }
    }, [contextUser]);

    // Validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (firstName.trim().length < 2) {
            newErrors.first_name = "Le prénom doit contenir au moins 2 caractères";
        }

        if (lastName.trim().length < 2) {
            newErrors.last_name = "Le nom doit contenir au moins 2 caractères";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Sauvegarder
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        if (!authData?.access_token) {
            toast.error("Erreur", {
                description: "Session expirée. Veuillez vous reconnecter",
            });
            return;
        }

        setIsSaving(true);

        const updates: any = {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            location: location.trim() || undefined,
            title: title.trim() || undefined,
            description: description.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            };

        const result = await updateUserProfile(authData.access_token, updates);

        if (result.success && result.user) {
            setProfile(result.user);
            setIsEditing(false);

            // Rafraîchir les données utilisateur dans le contexte global
            await refreshUser();

            toast.success("Profil mis à jour", {
                description: "Vos modifications ont été enregistrées",
            });
        } else {
            toast.error("Erreur de mise à jour", {
                description: result.error || "Impossible de mettre à jour votre profil",
            });
        }

        setIsSaving(false);
    };

    // Annuler
    const handleCancel = () => {
        if (profile) {
            setFirstName(profile.first_name || "");
            setLastName(profile.last_name || "");
            setLocation(profile.location || "");
            setTitle(profile.title || "");
            setDescription(profile.description || "");
            setPhoneNumber(profile.phoneNumber || profile.account?.phoneNumber || "");
        }
        setErrors({});
        setIsEditing(false);
    };

    // Obtenir les initiales
    const getInitials = () => {
        const first = firstName || profile?.first_name || "";
        const last = lastName || profile?.last_name || "";
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    };

    if (authLoading || !isAuthenticated) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Mon Profil - Kylimmo</title>
                <meta name="description" content="Gérez votre profil Kylimmo" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-background min-h-screen">
                <PageNavbar breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Mon Profil" }]} />

                <main className="container py-8 pt-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
                        {/* Header avec avatar */}
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                {isLoadingProfile ? (
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <Skeleton className="h-24 w-24 rounded-full" />
                                        <div className="flex-1 space-y-2 text-center sm:text-left">
                                            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                                            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={profile?.avatar || undefined} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                                                {getInitials() || <UserIcon className="h-12 w-12" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-center sm:text-left">
                                            <h1 className="text-2xl font-bold">
                                                {profile?.first_name} {profile?.last_name}
                                            </h1>
                                            {profile?.title && <p className="text-muted-foreground mt-1">{profile.title}</p>}
                                            {profile?.role?.name && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                        {profile.role.name}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-2 mt-2 justify-center sm:justify-start">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">{profile?.email}</span>
                                                </div>
                                                {(profile?.phoneNumber || profile?.account?.phoneNumber) && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm text-muted-foreground">{profile.phoneNumber || profile.account?.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {!isEditing && (
                                            <Button onClick={() => setIsEditing(true)}>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Modifier
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Informations personnelles */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informations personnelles</CardTitle>
                                <CardDescription>{isEditing ? "Modifiez vos informations personnelles" : "Vos informations personnelles"}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingProfile ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                        <Skeleton className="h-20 w-full" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Prénom */}
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Prénom *</Label>
                                            <Input
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => {
                                                    setFirstName(e.target.value);
                                                    setErrors((prev) => ({ ...prev, first_name: "" }));
                                                }}
                                                disabled={!isEditing}
                                                className={errors.first_name ? "border-destructive" : ""}
                                            />
                                            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name}</p>}
                                        </div>

                                        {/* Nom */}
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Nom *</Label>
                                            <Input
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => {
                                                    setLastName(e.target.value);
                                                    setErrors((prev) => ({ ...prev, last_name: "" }));
                                                }}
                                                disabled={!isEditing}
                                                className={errors.last_name ? "border-destructive" : ""}
                                            />
                                            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name}</p>}
                                        </div>

                                        {/* Email (lecture seule) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
                                            <p className="text-xs text-muted-foreground">L'email ne peut pas être modifié</p>
                                        </div>

                                        {/* Téléphone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">Téléphone</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phoneNumber"
                                                    type="tel"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    disabled={!isEditing}
                                                    className="pl-10"
                                                    placeholder="Ex: +225 XX XX XX XX XX"
                                                />
                                            </div>
                                        </div>

                                        {/* Titre */}
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Titre</Label>
                                            <Select value={title} onValueChange={(value) => setTitle(value)} disabled={!isEditing}>
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
                                            <Input
                                                id="location"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                disabled={!isEditing}
                                                placeholder="Ex: Abidjan, Côte d'Ivoire"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">À propos</Label>
                                            <textarea
                                                id="description"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Parlez-nous de vous..."
                                            />
                                        </div>

                                        {/* Boutons d'action */}
                                        {isEditing && (
                                            <div className="flex gap-3 pt-4">
                                                <Button onClick={handleSave} disabled={isSaving} className="flex-1">
                                                    {isSaving ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Enregistrement...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="mr-2 h-4 w-4" />
                                                            Sauvegarder
                                                        </>
                                                    )}
                                                </Button>
                                                <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
                                                    <X className="mr-2 h-4 w-4" />
                                                    Annuler
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async () => {
    return {
        props: {},
    };
};

export default ProfilePage;
