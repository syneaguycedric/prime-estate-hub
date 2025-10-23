import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserPropertyById, updateProperty, uploadFile } from "@/lib/directus-api";
import { buildImageUrl } from "@/lib/property-helpers";
import { Property } from "@/data/properties";
import { toast } from "@/lib/toast-helpers";
import Footer from "@/components/layout/Footer";
import PageNavbar from "@/components/layout/PageNavbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, Upload, X, Plus } from "lucide-react";

interface UploadedImage {
    fileId: string;
    file?: File;
    preview: string;
    uploading: boolean;
    uploaded: boolean;
    error?: string;
}

export default function EditListingPage() {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, user, authData, isLoading: authLoading } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        surface: "",
        rooms: "",
        bathrooms: "",
        propertyType: "",
        contractType: "",
        status: "",
        address: {
            street: "",
            city: "",
            state: "",
            country: "Côte d'Ivoire",
        },
    });

    // Images et caractéristiques
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [characteristics, setCharacteristics] = useState<Array<{ name: string; value: string }>>([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        if (!authLoading && user && user.account?.account_type !== "advertiser") {
            toast.info("Accès restreint", {
                description: "Cette page est réservée aux annonceurs.",
                duration: 5000,
            });
            router.push("/advertiser");
            return;
        }

        if (id && typeof id === "string") {
            loadProperty(id);
        }
    }, [id, isAuthenticated, user, authLoading, router]);

    const loadProperty = async (propertyId: string) => {
        setLoading(true);
        try {
            const result = await fetchUserPropertyById(propertyId);

            if (result.success && result.property) {
                const prop = result.property;
                setProperty(prop);

                // Logging pour déboguer
                console.log("[EDIT LISTING] Property loaded:", JSON.stringify(prop, null, 2));
                console.log("[EDIT LISTING] Address:", prop.address);
                console.log("[EDIT LISTING] Type:", prop.type);
                console.log("[EDIT LISTING] SurfaceArea:", prop.surfaceArea);

                // Préremplir le formulaire
                setFormData({
                    title: prop.title || "",
                    description: prop.description || "",
                    price: prop.price?.toString() || "",
                    surface: prop.surfaceArea?.toString() || "",
                    rooms: prop.rooms?.toString() || "",
                    bathrooms: prop.bathrooms?.toString() || "",
                    propertyType: prop.type || "",
                    contractType: prop.contractType || "",
                    status: prop.status || "draft",
                    address: {
                        street: prop.address?.street || "",
                        city: prop.address?.city || "",
                        state: prop.address?.state || "",
                        country: prop.address?.country || "Côte d'Ivoire",
                    },
                });

                // Préremplir les images existantes
                if (prop.images && prop.images.length > 0) {
                    const existingImages = prop.images.map((img: any) => ({
                        fileId: img.directus_files_id?.id || img.id,
                        preview: img.directus_files_id?.id ? buildImageUrl(img.directus_files_id.id) : "/assets/placeholder.svg",
                        uploading: false,
                        uploaded: true, // Déjà sur le serveur
                    }));
                    setImages(existingImages);
                }

                // Préremplir les caractéristiques
                if (prop.characteristics && prop.characteristics.length > 0) {
                    setCharacteristics(prop.characteristics);
                }
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de charger l'annonce",
                });
                router.push("/my-listings?tab=listings");
            }
        } catch (error) {
            console.error("Error loading property:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors du chargement",
            });
            router.push("/my-listings?tab=listings");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field.includes(".")) {
            const [parent, child] = field.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
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
            if (image && image.preview) {
                URL.revokeObjectURL(image.preview);
            }
            return prev.filter((img) => img.fileId !== fileId);
        });
    };

    // Handlers pour les caractéristiques
    const handleCharacteristicChange = (index: number, field: "name" | "value", value: string) => {
        setCharacteristics((prev) => prev.map((char, i) => (i === index ? { ...char, [field]: value } : char)));
    };

    const handleAddCharacteristic = () => {
        setCharacteristics((prev) => [...prev, { name: "", value: "" }]);
    };

    const handleRemoveCharacteristic = (index: number) => {
        setCharacteristics((prev) => prev.filter((_, i) => i !== index));
    };

    // Handlers drag & drop
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

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload(files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!property?.id) return;

        setSaving(true);
        try {
            // Vérification du token d'authentification
            if (!authData?.access_token) {
                toast.error("Erreur d'authentification", {
                    description: "Veuillez vous reconnecter",
                });
                return;
            }

            // 1. Upload des nouvelles images uniquement
            const newImagesToUpload = images.filter((img) => !img.uploaded && img.file);

            if (newImagesToUpload.length > 0) {
                toast.info("Upload des images...", {
                    description: "Veuillez patienter",
                    duration: 2000,
                });
            }

            const uploadPromises = newImagesToUpload.map(async (img) => {
                try {
                    const result = await uploadFile(authData.access_token, img.file!);
                    if (result.success && result.fileId) {
                        return { ...img, fileId: result.fileId, uploaded: true };
                    }
                    throw new Error(`Échec upload ${img.file!.name}`);
                } catch (error) {
                    console.error("Upload error:", error);
                    throw error;
                }
            });

            const uploadedNewImages = uploadPromises.length > 0 ? await Promise.all(uploadPromises) : [];

            // 2. Combiner avec images existantes
            const allImages = [...images.filter((img) => img.uploaded && !img.file), ...uploadedNewImages];

            const updateData = {
                title: formData.title,
                description: formData.description,
                price: formData.price ? parseFloat(formData.price) : undefined,
                surfaceArea: formData.surface,
                surfaceAreaUnit: "m2",
                rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
                bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
                kitchens: 1,
                floors: 1,
                type: formData.propertyType,
                contractType: formData.contractType,
                status: formData.status,
                address: formData.address,
                characteristics: characteristics.filter((char) => char.name.trim() && char.value.trim()),
                images: allImages.map((img) => ({ directus_files_id: img.fileId })),
            };

            const result = await updateProperty(property.id, updateData);

            if (result.success) {
                toast.success("Annonce mise à jour", {
                    description: "Vos modifications ont été enregistrées avec succès",
                    duration: 3000,
                });
                router.push("/my-listings?tab=listings");
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de mettre à jour l'annonce",
                });
            }
        } catch (error) {
            console.error("Error updating property:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la sauvegarde",
            });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <Head>
                    <title>Modifier l'annonce - Kylimmo</title>
                    <meta name="description" content="Modifiez votre annonce immobilière" />
                </Head>
                <div className="min-h-screen bg-background">
                    <PageNavbar breadcrumbs={[{ label: "Mes annonces", href: "/my-listings?tab=listings" }, { label: "Modifier l'annonce" }]} />
                    <div className="container mx-auto px-4 py-8">
                        <div className="max-w-4xl mx-auto">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-8 w-64" />
                                    <Skeleton className="h-4 w-96" />
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head>
                <title>Modifier l'annonce - Kylimmo</title>
                <meta name="description" content="Modifiez votre annonce immobilière" />
            </Head>

            <div className="min-h-screen bg-background">
                <PageNavbar breadcrumbs={[{ label: "Mes annonces", href: "/my-listings?tab=listings" }, { label: "Modifier l'annonce" }]} />

                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0 h-auto">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                    </Button>
                                    Modifier l'annonce
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Informations de base */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Informations de base</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="title">Titre de l'annonce *</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => handleInputChange("title", e.target.value)}
                                                placeholder="Ex: Appartement 3 pièces à Cocody"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description *</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => handleInputChange("description", e.target.value)}
                                                placeholder="Décrivez votre bien en détail..."
                                                rows={4}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="price">Prix (FCFA) *</Label>
                                                <Input
                                                    id="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) => handleInputChange("price", e.target.value)}
                                                    placeholder="Ex: 150000"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="surface">Surface (m²) *</Label>
                                                <Input
                                                    id="surface"
                                                    type="number"
                                                    value={formData.surface}
                                                    onChange={(e) => handleInputChange("surface", e.target.value)}
                                                    placeholder="Ex: 120"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Caractéristiques */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Caractéristiques</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="rooms">Nombre de pièces</Label>
                                                <Input
                                                    id="rooms"
                                                    type="number"
                                                    value={formData.rooms}
                                                    onChange={(e) => handleInputChange("rooms", e.target.value)}
                                                    placeholder="Ex: 3"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bathrooms">Salles de bain</Label>
                                                <Input
                                                    id="bathrooms"
                                                    type="number"
                                                    value={formData.bathrooms}
                                                    onChange={(e) => handleInputChange("bathrooms", e.target.value)}
                                                    placeholder="Ex: 2"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="status">Statut</Label>
                                                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner le statut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Brouillon</SelectItem>
                                                        <SelectItem value="published">Publié</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Type de bien et contrat */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Type et contrat</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="propertyType">Type de bien *</Label>
                                                <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner le type" />
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
                                                        <SelectValue placeholder="Sélectionner le contrat" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="selling">Vente</SelectItem>
                                                        <SelectItem value="leasing">Location</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Adresse */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Adresse</h3>

                                        <div className="space-y-2">
                                            <Label htmlFor="street">Rue/Quartier *</Label>
                                            <Input
                                                id="street"
                                                value={formData.address.street}
                                                onChange={(e) => handleInputChange("address.street", e.target.value)}
                                                placeholder="Ex: Rue des Jardins, Cocody"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Ville *</Label>
                                                <Input
                                                    id="city"
                                                    value={formData.address.city}
                                                    onChange={(e) => handleInputChange("address.city", e.target.value)}
                                                    placeholder="Ex: Abidjan"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">Région *</Label>
                                                <Input
                                                    id="state"
                                                    value={formData.address.state}
                                                    onChange={(e) => handleInputChange("address.state", e.target.value)}
                                                    placeholder="Ex: Abidjan"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section Images */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Photos du bien</h3>

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
                                    </div>

                                    {/* Section Caractéristiques */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Caractéristiques supplémentaires</h3>
                                        <p className="text-sm text-gray-600">Ajoutez des caractéristiques spécifiques à votre bien (optionnel)</p>

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
                                                <Button type="button" variant="outline" size="sm" onClick={() => handleRemoveCharacteristic(index)} className="px-3">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}

                                        <Button type="button" variant="outline" onClick={handleAddCharacteristic} className="w-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Ajouter une caractéristique
                                        </Button>
                                    </div>

                                    {/* Boutons d'action */}
                                    <div className="flex justify-end gap-4 pt-6">
                                        <Button type="button" variant="outline" onClick={() => router.back()}>
                                            Annuler
                                        </Button>
                                        <Button type="submit" disabled={saving} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                            {saving ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Enregistrer les modifications
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
