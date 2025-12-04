import { useState, FormEvent, useEffect } from "react";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Upload, X, Plus, Loader2, ArrowRight, Save, ChevronDown, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import PageNavbar from "@/components/layout/PageNavbar";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, createListing, CreateListingData, fetchGeoZones, GeoZone, zoneNameToSlug, findZoneBySlug } from "@/lib/directus-api";
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

interface CreateListingPageProps {
    geoZones: GeoZone[];
}

const CreateListingPage = ({ geoZones }: CreateListingPageProps) => {
    const router = useRouter();
    const { isAuthenticated, authData, user } = useAuth();

    // Vérifier l'authentification et le type de compte
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            toast.warning("Connexion requise", {
                description: "Vous devez être connecté pour créer une annonce.",
                duration: 5000,
            });
            return;
        }

        if (user?.role?.name !== "Advertiser") {
            router.push("/advertiser");
            toast.info("Devenez annonceur", {
                description: "Vous devez être annonceur pour publier des annonces.",
                duration: 7000,
            });
            return;
        }
    }, [isAuthenticated, user, router]);

    // États pour la sélection de zone et commune
    const [zone, setZone] = useState<string>("");
    const [areas, setAreas] = useState<string[]>([]);
    const [areasOpen, setAreasOpen] = useState(false);

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée (slug)
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return findZoneBySlug(zoneValue, geoZones);
    };

    // Obtenir la zone actuellement sélectionnée
    const selectedZone = zone ? getZoneByValue(zone) : null;

    // Obtenir les towns de la zone sélectionnée
    const getTownsForSelectedZone = () => {
        if (!selectedZone) return [];
        return selectedZone.towns || [];
    };

    // Obtenir le nom d'une commune/département par son ID
    const getAreaName = (id: string) => {
        if (!selectedZone) return "";
        const town = selectedZone.towns.find((t) => t.id === id);
        return town?.name || "";
    };

    const toggleArea = (id: string) => {
        // Sélection unique: remplace toujours par l'ID cliqué
        setAreas([id]);
        // Fermer automatiquement le Popover après sélection
        setAreasOpen(false);
    };

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
        location: "", // Géolocalisation
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

        if (areas.length === 0 || !areas[0]) {
            errors.town = "Veuillez sélectionner une commune ou un département";
        }

        if (!formData.location.trim()) {
            errors.location = "La localisation est requise";
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
                town: areas[0] || "", // ID de la commune/département sélectionné
                location: formData.location.trim(), // Géolocalisation
                agency: "ca1ab408-69e9-41f6-86ec-18ba0e41147f", // Agence par défaut Kylimmo
                characteristics: characteristics.filter((char) => char.name.trim() && char.value.trim()),
                type: formData.type,
                images: uploadedImages.map((img) => ({ directus_files_id: img.fileId })),
            };

            const result = await createListing(authData.access_token, listingData);

            if (result.success && result.listing) {
                const isDraft = status === "draft";
                toast.success("Annonce créée", {
                    description: isDraft ? "Votre annonce a été sauvegardée en brouillon" : "Votre annonce a été publiée avec succès",
                    duration: 3000,
                });

                // Rediriger vers la liste des annonces
                router.push("/my-listings?tab=listings");
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
        // Pour les champs numériques entiers, supprimer les virgules et points
        const integerFields = ['price', 'rooms', 'bathrooms', 'kitchens', 'floors'];
        if (integerFields.includes(field)) {
            // Supprimer toutes les virgules et points (on veut juste des entiers)
            const cleanedValue = value.replace(/[^\d]/g, '');
            setFormData((prev) => ({ ...prev, [field]: cleanedValue }));
        } else if (field === 'surfaceArea') {
            // Pour la surface, supprimer toutes les virgules et points (entiers uniquement)
            const cleanedValue = value.replace(/[^\d]/g, '');
            setFormData((prev) => ({ ...prev, [field]: cleanedValue }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }

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
                <PageNavbar breadcrumbs={[{ label: "Mes annonces", href: "/my-listings?tab=listings" }, { label: "Créer une annonce" }]} />

                <main className="container mx-auto px-4 md:px-8 py-8 pt-20">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold">Créer une annonce</h1>
                            <p className="text-muted-foreground mt-2">Remplissez les informations de votre bien immobilier</p>
                        </div>

                        {/* Sélection de zone et commune/département */}
                        <Card className="border-border/60 bg-card/80 backdrop-blur mb-6">
                            <CardContent className="p-4 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                    {/* Zone */}
                                    <div className="md:col-span-4">
                                        <Label className="text-xs text-muted-foreground">Zone</Label>
                                        <Select
                                            value={zone}
                                            onValueChange={(v: any) => {
                                                setZone(v);
                                                setAreas([]);
                                            }}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Choisir une zone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {geoZones.map((geoZone) => {
                                                    // Générer dynamiquement le slug pour chaque zone
                                                    const zoneValue = zoneNameToSlug(geoZone.name);
                                                    
                                                    return (
                                                        <SelectItem key={geoZone.id} value={zoneValue}>
                                                            {geoZone.name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Communes / Départements */}
                                    <div className="md:col-span-8">
                                        <Label className="text-xs text-muted-foreground">Commune ou département</Label>
                                        <Popover open={areasOpen} onOpenChange={setAreasOpen}>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between mt-1" disabled={!zone}>
                                                    <span className="truncate min-w-0 flex-1 text-left">
                                                        {areas.length === 1 ? getAreaName(areas[0]) : "Choisir une commune ou un département"}
                                                    </span>
                                                    <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[320px] p-3">
                                                <div className="max-h-64 overflow-auto pr-1">
                                                    {getTownsForSelectedZone().map((town) => (
                                                        <button
                                                            type="button"
                                                            key={town.id}
                                                            onClick={() => toggleArea(town.id)}
                                                            className="w-full flex items-center justify-between py-2 text-sm hover:bg-muted rounded px-2"
                                                        >
                                                            <span>{town.name}</span>
                                                            <Checkbox checked={areas[0] === town.id} onCheckedChange={() => toggleArea(town.id)} />
                                                        </button>
                                                    ))}
                                                </div>
                                                {areas.length > 0 && (
                                                    <>
                                                        <Separator className="my-2" />
                                                        <div className="flex items-center justify-end">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setAreas([]);
                                                                    setAreasOpen(false);
                                                                }}
                                                            >
                                                                Effacer
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </PopoverContent>
                                        </Popover>
                                        {validationErrors.town && <p className="text-sm text-destructive mt-1">{validationErrors.town}</p>}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

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
                                            <Label htmlFor="price">{formData.contractType === "leasing" ? "Loyer (FCFA)" : "Prix (FCFA)"} *</Label>
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
                                            <Label htmlFor="rooms">Nombre de pièces *</Label>
                                            <Input id="rooms" type="number" min="0" value={formData.rooms} onChange={(e) => handleInputChange("rooms", e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bathrooms">Salles d'eau *</Label>
                                            <Input
                                                id="bathrooms"
                                                type="number"
                                                min="0"
                                                value={formData.bathrooms}
                                                onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="kitchens">Cuisines *</Label>
                                            <Input id="kitchens" type="number" min="0" value={formData.kitchens} onChange={(e) => handleInputChange("kitchens", e.target.value)} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="floors">Nombre de niveau *</Label>
                                            <Input id="floors" type="number" min="0" value={formData.floors} onChange={(e) => handleInputChange("floors", e.target.value)} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Localisation */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Localisation</CardTitle>
                                    <CardDescription>Précisez l'emplacement exact de votre bien</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="location">Localisation *</Label>
                                        <Input
                                            id="location"
                                            placeholder="Ex: Place de la République, Avenue 12, Cocody"
                                            value={formData.location}
                                            onChange={(e) => handleInputChange("location", e.target.value)}
                                            className={validationErrors.location ? "border-destructive" : ""}
                                        />
                                        {validationErrors.location && <p className="text-sm text-destructive">{validationErrors.location}</p>}
                                        <p className="text-xs text-muted-foreground">Indiquez l'adresse complète ou un point de repère précis</p>
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
                                <Button type="button" variant="outline" onClick={() => router.push("/my-listings?tab=listings")} disabled={isSubmitting}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Annuler
                                </Button>

                                <Button type="submit" disabled={isSubmitting} size="lg">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Publication...
                                        </>
                                    ) : (
                                        <>
                                            Faire une annonce
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </main>

                {/* Loader avec overlay pendant le chargement */}
                {isSubmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-card border border-border rounded-lg shadow-2xl p-8 max-w-sm w-full mx-4"
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-16 h-16 mx-auto"
                                >
                                    <Loader2 className="w-16 h-16 text-primary" />
                                </motion.div>

                                <div className="space-y-2">
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="text-lg font-semibold text-foreground"
                                    >
                                        Publication en cours...
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-muted-foreground"
                                    >
                                        Veuillez patienter pendant le chargement des photos et la création de l'annonce
                                    </motion.p>
                                </div>

                                {/* Points de progression animés */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex justify-center space-x-2 pt-2"
                                >
                                    {[0, 1, 2].map((index) => (
                                        <motion.div
                                            key={index}
                                            animate={{
                                                scale: [1, 1.3, 1],
                                                opacity: [0.4, 1, 0.4],
                                            }}
                                            transition={{
                                                duration: 1.2,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                                ease: "easeInOut",
                                            }}
                                            className="w-2 h-2 bg-primary rounded-full"
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </>
    );
};

export const getServerSideProps: GetServerSideProps<CreateListingPageProps> = async (context) => {
    try {
        // Récupérer les zones géographiques depuis l'API
        const geoZones = await fetchGeoZones();

        return {
            props: {
                geoZones: geoZones || [],
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps for create-listing:", error);

        return {
            props: {
                geoZones: [],
            },
        };
    }
};

export default CreateListingPage;
