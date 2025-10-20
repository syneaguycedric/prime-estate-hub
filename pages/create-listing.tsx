import { useState, FormEvent } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Upload, X, Plus, Loader2, ArrowRight, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageNavbar from "@/components/layout/PageNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, createListing, CreateListingData } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";
import Image from "next/image";

interface UploadedImage {
    fileId: string;
    file: File;
    preview: string;
    uploading: boolean;
    uploaded: boolean;
    error?: string;
}

const CreateListingPage = () => {
    const router = useRouter();
    const { isAuthenticated, authData, user } = useAuth();

    // États du formulaire
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "appartment" as "appartment" | "villa" | "land",
        contractType: "leasing" as "leasing" | "selling",
        price: "",
        surfaceArea: "",
        surfaceAreaUnit: "m2",
        rooms: "1",
        bathrooms: "1",
        kitchens: "1",
        floors: "1",
        // Adresse
        country: "civ",
        city: "",
        state: "",
        street: "",
    });

    const [images, setImages] = useState<UploadedImage[]>([]);
    const [characteristics, setCharacteristics] = useState<Array<{ name: string; value: string }>>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isDragging, setIsDragging] = useState(false);

    // Handlers drag and drop
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        processFiles(droppedFiles);
    };

    // Fonction pour traiter les fichiers (sélection ou drop)
    const processFiles = (files: File[]) => {
        for (const file of files) {
            // Validation du fichier
            if (!file.type.startsWith("image/")) {
                toast.error("Fichier invalide", {
                    description: `${file.name} n'est pas une image`,
                });
                continue;
            }

            if (file.size > 10 * 1024 * 1024) {
                toast.error("Fichier trop volumineux", {
                    description: `${file.name} dépasse 10 MB`,
                });
                continue;
            }

            // Créer la prévisualisation
            const preview = URL.createObjectURL(file);
            const tempId = `temp-${Date.now()}-${Math.random()}`;

            // Ajouter à la liste sans uploader immédiatement
            const newImage: UploadedImage = {
                fileId: tempId,
                file,
                preview,
                uploading: false,
                uploaded: false,
            };

            setImages((prev) => [...prev, newImage]);
        }
    };

    // Gestion des images
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        processFiles(files);
    };

    const handleRemoveImage = (fileId: string) => {
        setImages((prev) => {
            const image = prev.find((img) => img.fileId === fileId);
            if (image) {
                URL.revokeObjectURL(image.preview);
            }
            return prev.filter((img) => img.fileId !== fileId);
        });
    };

    // Gestion des caractéristiques
    const handleAddCharacteristic = () => {
        setCharacteristics((prev) => [...prev, { name: "", value: "" }]);
    };

    const handleRemoveCharacteristic = (index: number) => {
        setCharacteristics((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCharacteristicChange = (index: number, field: "name" | "value", value: string) => {
        setCharacteristics((prev) => prev.map((char, i) => (i === index ? { ...char, [field]: value } : char)));
    };

    // Validation du formulaire
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) {
            errors.title = "Le titre est requis";
        }

        if (!formData.price || parseFloat(formData.price) <= 0) {
            errors.price = "Le prix doit être supérieur à 0";
        }

        if (!formData.surfaceArea || parseFloat(formData.surfaceArea) <= 0) {
            errors.surfaceArea = "La surface doit être supérieure à 0";
        }

        if (!formData.city.trim()) {
            errors.city = "La ville est requise";
        }

        if (!formData.state.trim()) {
            errors.state = "La région est requise";
        }

        if (!formData.street.trim()) {
            errors.street = "La rue/quartier est requis";
        }

        if (images.length === 0) {
            errors.images = "Au moins une image est requise";
            toast.error("Images requises", {
                description: "Veuillez sélectionner au moins une image",
            });
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Soumission du formulaire
    const handleSubmit = async (status: "draft" | "published") => {
        if (!validateForm() || !authData?.access_token) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Uploader toutes les images qui n'ont pas encore été uploadées
            toast.info("Upload des images...", {
                description: "Veuillez patienter",
                duration: 2000,
            });

            const uploadPromises = images
                .filter((img) => !img.uploaded)
                .map(async (img) => {
                    const result = await uploadFile(authData.access_token, img.file);
                    if (result.success && result.fileId) {
                        return { ...img, fileId: result.fileId, uploaded: true };
                    }
                    throw new Error(`Échec upload ${img.file.name}`);
                });

            const uploadedImages = await Promise.all(uploadPromises);

            // 2. Créer l'annonce
            const listingData: CreateListingData = {
                status,
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                price: parseFloat(formData.price),
                contractType: formData.contractType,
                surfaceArea: formData.surfaceArea,
                surfaceAreaUnit: formData.surfaceAreaUnit,
                rooms: parseInt(formData.rooms),
                bathrooms: parseInt(formData.bathrooms),
                kitchens: parseInt(formData.kitchens),
                floors: parseInt(formData.floors),
                address: {
                    country: formData.country,
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    street: formData.street.trim(),
                },
                agency: "ca1ab408-69e9-41f6-86ec-18ba0e41147f", // Agence par défaut Kylimmo
                characteristics: characteristics.filter((char) => char.name.trim() && char.value.trim()),
                type: formData.type,
                images: uploadedImages.map((img) => ({ directus_files_id: img.fileId })),
            };

            const result = await createListing(authData.access_token, listingData);

            if (result.success && result.listing) {
                toast.success("Annonce créée", {
                    description: status === "published" ? "Votre annonce a été publiée avec succès" : "Votre brouillon a été sauvegardé",
                    duration: 3000,
                });

                // Rediriger vers la page de détail
                router.push(`/biens/${result.listing.id}`);
            } else {
                toast.error("Erreur de création", {
                    description: result.error || "Impossible de créer l'annonce",
                    duration: 5000,
                });
            }
        } catch (error) {
            console.error("Create listing error:", error);
            toast.error("Erreur d'upload", {
                description: "Impossible d'uploader les images",
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Gestion des changements de champs
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Effacer l'erreur de validation
        if (validationErrors[field]) {
            setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Créer une annonce - Kylimmo</title>
                <meta name="description" content="Publiez votre annonce immobilière sur Kylimmo" />
                <meta name="robots" content="noindex, nofollow" />
            </Head>

            <div className="bg-background min-h-screen">
                <PageNavbar breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Créer une annonce" }]} />

                <main className="container py-8 pt-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold">Créer une annonce</h1>
                            <p className="text-muted-foreground mt-2">Remplissez les informations de votre bien immobilier</p>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit("published");
                            }}
                            className="space-y-6"
                        >
                            {/* Informations de base */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informations de base</CardTitle>
                                    <CardDescription>Les informations essentielles de votre bien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Titre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Titre de l'annonce *</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ex: Appartement 3 pièces à Cocody"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange("title", e.target.value)}
                                            className={validationErrors.title ? "border-destructive" : ""}
                                        />
                                        {validationErrors.title && <p className="text-sm text-destructive">{validationErrors.title}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Décrivez votre bien en détail..."
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => handleInputChange("description", e.target.value)}
                                        />
                                    </div>

                                    {/* Type de bien et contrat */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type de bien *</Label>
                                            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="appartment">Appartement</SelectItem>
                                                    <SelectItem value="villa">Villa</SelectItem>
                                                    <SelectItem value="land">Terrain</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="contractType">Type de contrat *</Label>
                                            <Select value={formData.contractType} onValueChange={(value) => handleInputChange("contractType", value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="selling">Vente</SelectItem>
                                                    <SelectItem value="leasing">Location</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Prix et surface */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Prix et surface</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="price">Prix (FCFA) *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                placeholder="10000000"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange("price", e.target.value)}
                                                className={validationErrors.price ? "border-destructive" : ""}
                                            />
                                            {validationErrors.price && <p className="text-sm text-destructive">{validationErrors.price}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="surfaceArea">Surface *</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="surfaceArea"
                                                    type="number"
                                                    placeholder="400"
                                                    value={formData.surfaceArea}
                                                    onChange={(e) => handleInputChange("surfaceArea", e.target.value)}
                                                    className={`flex-1 ${validationErrors.surfaceArea ? "border-destructive" : ""}`}
                                                />
                                                <Select value={formData.surfaceAreaUnit} onValueChange={(value) => handleInputChange("surfaceAreaUnit", value)}>
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="m2">m²</SelectItem>
                                                        <SelectItem value="ha">ha</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {validationErrors.surfaceArea && <p className="text-sm text-destructive">{validationErrors.surfaceArea}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Détails du bien */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Détails du bien</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="rooms">Nombre de pièces</Label>
                                            <Input id="rooms" type="number" min="0" value={formData.rooms} onChange={(e) => handleInputChange("rooms", e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bathrooms">Salles de bain</Label>
                                            <Input
                                                id="bathrooms"
                                                type="number"
                                                min="0"
                                                value={formData.bathrooms}
                                                onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="kitchens">Cuisines</Label>
                                            <Input id="kitchens" type="number" min="0" value={formData.kitchens} onChange={(e) => handleInputChange("kitchens", e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="floors">Étages</Label>
                                            <Input id="floors" type="number" min="0" value={formData.floors} onChange={(e) => handleInputChange("floors", e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Adresse */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Localisation</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">Ville *</Label>
                                            <Input
                                                id="city"
                                                placeholder="Abidjan"
                                                value={formData.city}
                                                onChange={(e) => handleInputChange("city", e.target.value)}
                                                className={validationErrors.city ? "border-destructive" : ""}
                                            />
                                            {validationErrors.city && <p className="text-sm text-destructive">{validationErrors.city}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="state">Région/État *</Label>
                                            <Input
                                                id="state"
                                                placeholder="Lagunes"
                                                value={formData.state}
                                                onChange={(e) => handleInputChange("state", e.target.value)}
                                                className={validationErrors.state ? "border-destructive" : ""}
                                            />
                                            {validationErrors.state && <p className="text-sm text-destructive">{validationErrors.state}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="street">Rue/Quartier *</Label>
                                        <Input
                                            id="street"
                                            placeholder="Cocody"
                                            value={formData.street}
                                            onChange={(e) => handleInputChange("street", e.target.value)}
                                            className={validationErrors.street ? "border-destructive" : ""}
                                        />
                                        {validationErrors.street && <p className="text-sm text-destructive">{validationErrors.street}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Images */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Photos du bien *</CardTitle>
                                    <CardDescription>Ajoutez au moins une photo de votre bien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Zone de drop */}
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                                            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary"
                                        }`}
                                        onDragEnter={handleDragEnter}
                                        onDragLeave={handleDragLeave}
                                        onDragOver={handleDragOver}
                                        onDrop={handleDrop}
                                    >
                                        <input type="file" id="image-upload" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                                        <label htmlFor="image-upload" className="cursor-pointer">
                                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-sm font-medium">{isDragging ? "Déposez vos images ici" : "Cliquez ou glissez-déposez vos images"}</p>
                                            <p className="text-xs text-muted-foreground mt-2">PNG, JPG, JPEG (max. 10MB par image)</p>
                                        </label>
                                    </div>

                                    {/* Prévisualisation des images */}
                                    {images.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {images.map((image) => (
                                                <div key={image.fileId} className="relative group">
                                                    <div className="aspect-video relative rounded-lg overflow-hidden border border-border">
                                                        <Image src={image.preview} alt="Preview" fill className="object-cover" />
                                                        {image.uploaded && <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">✓</div>}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => handleRemoveImage(image.fileId)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {validationErrors.images && <p className="text-sm text-destructive">{validationErrors.images}</p>}
                                </CardContent>
                            </Card>

                            {/* Caractéristiques */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Caractéristiques supplémentaires</CardTitle>
                                    <CardDescription>Ajoutez des caractéristiques spécifiques à votre bien (optionnel)</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {characteristics.map((char, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="Nom (ex: Piscine)"
                                                value={char.name}
                                                onChange={(e) => handleCharacteristicChange(index, "name", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Input
                                                placeholder="Valeur (ex: Oui)"
                                                value={char.value}
                                                onChange={(e) => handleCharacteristicChange(index, "value", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveCharacteristic(index)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button type="button" variant="outline" onClick={handleAddCharacteristic} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajouter une caractéristique
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Boutons de soumission */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end">
                                <Button type="button" variant="outline" onClick={() => handleSubmit("draft")} disabled={isSubmitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Sauvegarder en brouillon
                                </Button>

                                <Button type="submit" disabled={isSubmitting} size="lg">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Publication...
                                        </>
                                    ) : (
                                        <>
                                            Publier l'annonce
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </main>
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    // Protection de la route : vérifier l'authentification
    // Pour simplifier, on laisse la vérification côté client
    // En production, vérifier le token dans les cookies

    return {
        props: {},
    };
};

export default CreateListingPage;
