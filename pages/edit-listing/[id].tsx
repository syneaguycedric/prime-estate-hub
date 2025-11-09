import { useState, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserPropertyById, updateProperty, uploadFile, fetchGeoZones, GeoZone } from "@/lib/directus-api";
import { buildImageUrl } from "@/lib/property-helpers";
import { Property } from "@/data/properties";
import { toast } from "@/lib/toast-helpers";
import PageNavbar from "@/components/layout/PageNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Loader2, Upload, X, Plus, Search } from "lucide-react";

interface UploadedImage {
    fileId: string;
    file?: File;
    preview: string;
    uploading: boolean;
    uploaded: boolean;
    error?: string;
}

interface EditListingPageProps {
    geoZones: GeoZone[];
}

export default function EditListingPage({ geoZones }: EditListingPageProps) {
    const router = useRouter();
    const { id } = router.query;
    const { isAuthenticated, user, authData, isLoading: authLoading } = useAuth();

    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // États pour la sélection de zone et commune
    const [zone, setZone] = useState<"grand-abidjan" | "hors-abidjan" | "">("");
    const [areas, setAreas] = useState<string[]>([]);
    const [areasOpen, setAreasOpen] = useState(false);

    // Mapping entre les valeurs simplifiées (pour l'URL) et les IDs réels des zones
    const getZoneMapping = () => {
        const mapping: Record<string, { id: string; zone: GeoZone | null }> = {};
        
        // Trouver "Grand Abidjan" et "Hors Abidjan" dans les zones récupérées
        const grandAbidjan = geoZones.find(z => z.name === "Grand Abidjan");
        const horsAbidjan = geoZones.find(z => z.name === "Hors Abidjan");
        
        mapping["grand-abidjan"] = {
            id: grandAbidjan?.id || "",
            zone: grandAbidjan || null,
        };
        
        mapping["hors-abidjan"] = {
            id: horsAbidjan?.id || "",
            zone: horsAbidjan || null,
        };
        
        return mapping;
    };

    const zoneMapping = getZoneMapping();

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return zoneMapping[zoneValue]?.zone || null;
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

    // Form data
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        surfaceArea: "",
        surfaceAreaUnit: "m2",
        rooms: "",
        bathrooms: "",
        kitchens: "",
        floors: "",
        propertyType: "",
        contractType: "",
        status: "",
        location: "", // Géolocalisation
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

        if (!authLoading && user && user.role?.name !== "Advertiser") {
            toast.info("Accès restreint", {
                description: "Cette page est réservée aux annonceurs.",
                duration: 5000,
            });
            router.push("/advertiser");
            return;
        }

        if (id && typeof id === "string" && geoZones.length > 0) {
            loadProperty(id);
        }
    }, [id, isAuthenticated, user, authLoading, router, geoZones]);

    const loadProperty = async (propertyId: string) => {
        setLoading(true);
        try {
            const result = await fetchUserPropertyById(propertyId);

            if (result.success && result.property) {
                const prop = result.property;
                setProperty(prop);

                // Logging pour déboguer
                console.log("[EDIT LISTING] Property loaded:", JSON.stringify(prop, null, 2));
                console.log("[EDIT LISTING] Town field:", (prop as any).town);
                console.log("[EDIT LISTING] Location field:", (prop as any).location || prop.location);

                // Préremplir le formulaire
                // Formater les nombres sans virgules ni décimales
                const formatNumberForInput = (value: any): string => {
                    if (!value && value !== 0) return "";
                    const numValue = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value);
                    if (isNaN(numValue)) return "";
                    // Retourner le nombre entier sans décimales ni virgules
                    return Math.floor(numValue).toString();
                };

                setFormData({
                    title: prop.title || "",
                    description: prop.description || "",
                    price: formatNumberForInput(prop.price),
                    surfaceArea: formatNumberForInput(prop.surfaceArea),
                    surfaceAreaUnit: prop.surfaceAreaUnit || "m2",
                    rooms: formatNumberForInput(prop.rooms),
                    bathrooms: formatNumberForInput(prop.bathrooms),
                    kitchens: formatNumberForInput(prop.kitchens) || "1",
                    floors: formatNumberForInput(prop.floors) || "1",
                    propertyType: prop.type || "",
                    contractType: prop.contractType || "",
                    status: prop.status || "draft",
                    location: (prop as any).location || prop.location || "",
                });

                // Préremplir zone et commune/département si la propriété a un champ town avec zone
                const propertyTown = (prop as any).town;
                let townId: string | null = null;
                let zoneName: string | null = null;

                // Gérer le cas où town est un ID (string) ou un objet (relation)
                if (propertyTown) {
                    if (typeof propertyTown === 'string') {
                        townId = propertyTown;
                    } else if (typeof propertyTown === 'object') {
                        townId = propertyTown.id;
                        // Si town a une zone avec un nom, l'utiliser directement
                        if (propertyTown.zone && propertyTown.zone.name) {
                            zoneName = propertyTown.zone.name;
                        }
                    }
                }

                console.log("[EDIT LISTING] Town ID extracted:", townId);
                console.log("[EDIT LISTING] Zone name from town.zone:", zoneName);

                if (townId && zoneName) {
                    // Utiliser directement le nom de la zone depuis town.zone.name
                    const zoneValue = zoneName === "Grand Abidjan" ? "grand-abidjan" : zoneName === "Hors Abidjan" ? "hors-abidjan" : null;
                    if (zoneValue) {
                        console.log("[EDIT LISTING] Setting zone to:", zoneValue, "and area to:", townId);
                        setZone(zoneValue);
                        setAreas([townId]);
                    } else {
                        console.warn("[EDIT LISTING] Zone name not recognized:", zoneName);
                    }
                } else if (townId) {
                    // Fallback : chercher dans les geoZones si zone n'est pas disponible
                    console.log("[EDIT LISTING] Zone not available in town, searching in geoZones...");
                    let found = false;
                    for (const geoZone of geoZones) {
                        const town = geoZone.towns?.find((t) => t.id === townId);
                        if (town) {
                            console.log("[EDIT LISTING] Found town in zone:", geoZone.name, "Town:", town.name);
                            // Déterminer la valeur simplifiée de la zone
                            const zoneValue = geoZone.name === "Grand Abidjan" ? "grand-abidjan" : geoZone.name === "Hors Abidjan" ? "hors-abidjan" : null;
                            if (zoneValue) {
                                console.log("[EDIT LISTING] Setting zone to:", zoneValue, "and area to:", townId);
                                setZone(zoneValue);
                                setAreas([townId]);
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        console.warn("[EDIT LISTING] Town ID not found in any geoZone:", townId);
                    }
                } else {
                    console.log("[EDIT LISTING] No town ID found in property");
                }

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
        // Pour les champs numériques entiers, supprimer les virgules et points
        const integerFields = ['price', 'rooms', 'bathrooms', 'kitchens', 'floors'];
        if (integerFields.includes(field)) {
            // Supprimer toutes les virgules et points (on veut juste des entiers)
            const cleanedValue = value.replace(/[^\d]/g, '');
            setFormData((prev) => ({
                ...prev,
                [field]: cleanedValue,
            }));
        } else if (field === 'surfaceArea') {
            // Pour la surface, supprimer toutes les virgules et points (entiers uniquement)
            const cleanedValue = value.replace(/[^\d]/g, '');
            setFormData((prev) => ({
                ...prev,
                [field]: cleanedValue,
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
            processFiles(Array.from(files));
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
                price: formData.price || "",
                surfaceArea: formData.surfaceArea,
                surfaceAreaUnit: formData.surfaceAreaUnit || "m2",
                rooms: formData.rooms ? parseInt(formData.rooms) : undefined,
                bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
                kitchens: formData.kitchens ? parseInt(formData.kitchens) : undefined,
                floors: formData.floors ? parseInt(formData.floors) : undefined,
                type: formData.propertyType as "appartment" | "house" | "villa" | "land" | "commercial",
                contractType: formData.contractType as "leasing" | "sale" | "rent",
                status: formData.status,
                town: areas[0] || "", // ID de la commune/département sélectionné
                location: formData.location.trim(), // Géolocalisation
                characteristics: characteristics.filter((char) => char.name.trim() && char.value.trim()),
                images: allImages.map((img) => ({ directus_files_id: img.fileId })),
            };

            const result = await updateProperty(property.id, updateData as any);

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

    // Le skeleton est géré par PageSkeletonManager, pas besoin de skeleton local

    return (
        <>
            <Head>
                <title>Modifier l'annonce - Kylimmo</title>
                <meta name="description" content="Modifiez votre annonce immobilière" />
            </Head>

            <div className="min-h-screen bg-background">
                <PageNavbar breadcrumbs={[{ label: "Mes annonces", href: "/my-listings?tab=listings" }, { label: "Modifier l'annonce" }]} />

                <div className="container mx-auto px-4 py-8 pt-24">
                    <div className="max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-0 h-auto">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                </Button>
                                Modifier l'annonce
                            </h1>
                            <p className="text-muted-foreground mt-2">Modifiez les informations de votre bien immobilier</p>
                        </motion.div>

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
                                                            // Mapper le nom de zone vers la valeur simplifiée
                                                            const zoneValue = geoZone.name === "Grand Abidjan" 
                                                                ? "grand-abidjan" 
                                                                : geoZone.name === "Hors Abidjan" 
                                                                ? "hors-abidjan" 
                                                                : null;
                                                            
                                                            if (!zoneValue) return null;
                                                            
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
                                                            {areas.length === 1 ? getAreaName(areas[0]) : "Choisir..."}
                                                            <Search className="h-4 w-4 opacity-60" />
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
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                    required
                                                />
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
                                                    <Label htmlFor="propertyType">Type de bien *</Label>
                                                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange("propertyType", value)}>
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
                                                        required
                                                    />
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
                                                            className="flex-1"
                                                            required
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
                                                    required
                                                />
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

                {/* Loader avec overlay pendant le chargement */}
                {saving && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
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
                                        Mise à jour en cours...
                                    </motion.p>
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="text-sm text-muted-foreground"
                                    >
                                        Veuillez patienter pendant le chargement des photos et la mise à jour de l'annonce
                                    </motion.p>
                                </div>

                                {/* Points de progression animés */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex justify-center gap-2 pt-4"
                                >
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 rounded-full bg-primary"
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                delay: i * 0.2,
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                    </div>
                </div>
            </div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps<EditListingPageProps> = async (context) => {
    try {
        // Récupérer les zones géographiques depuis l'API
        const geoZones = await fetchGeoZones();
        return {
            props: {
                geoZones: geoZones || [],
            },
        };
    } catch (error) {
        console.error("Error in getServerSideProps for edit-listing:", error);
        return {
            props: {
                geoZones: [],
            },
        };
    }
};
