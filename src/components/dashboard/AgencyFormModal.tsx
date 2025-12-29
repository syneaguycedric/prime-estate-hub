import { useState, useEffect, useMemo } from "react";
import { X, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast-helpers";
import { useApiWithRefresh } from "@/hooks/use-api-with-refresh";
import { Agency, GeoZone, zoneNameToSlug, findZoneBySlug, fetchGeoZones } from "@/lib/directus-api";

interface AgencyFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newAgency?: Agency) => void;
    agency?: Agency | null;
    mode: "create" | "edit";
}

interface Contact {
    type: "phone" | "email";
    value: string;
}

interface SocialLink {
    service: string;
    url: string;
}

export default function AgencyFormModal({ open, onClose, onSuccess, agency, mode }: AgencyFormModalProps) {
    const { authData, user, refreshUser } = useAuth();
    const { fetchWithRefresh } = useApiWithRefresh();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Champs de base
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [street, setStreet] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Sélection zone et town
    const [geoZones, setGeoZones] = useState<GeoZone[]>([]);
    const [zone, setZone] = useState<string>("");
    const [town, setTown] = useState<string>("");

    // Contacts
    const [contacts, setContacts] = useState<Contact[]>([{ type: "phone", value: "" }]);

    // Réseaux sociaux
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    // Charger les geoZones
    useEffect(() => {
        if (open) {
            const loadGeoZones = async () => {
                try {
                    const zones = await fetchGeoZones();
                    setGeoZones(zones);
                } catch (error) {
                    console.error("[AGENCY FORM] Error loading geo zones:", error);
                    toast.error("Erreur", {
                        description: "Impossible de charger les zones géographiques",
                    });
                }
            };
            loadGeoZones();
        }
    }, [open]);

    // Helper pour obtenir la zone complète à partir de la valeur simplifiée (slug)
    const getZoneByValue = (zoneValue: string): GeoZone | null => {
        return findZoneBySlug(zoneValue, geoZones);
    };

    // Obtenir la zone actuellement sélectionnée
    const selectedZone = useMemo(() => {
        if (!zone || geoZones.length === 0) return null;
        return getZoneByValue(zone);
    }, [zone, geoZones]);

    // Obtenir les towns de la zone sélectionnée
    const getTownsForSelectedZone = () => {
        if (!selectedZone) return [];
        return selectedZone.towns || [];
    };

    // Obtenir le nom d'une commune/département par son ID
    const getAreaName = (id: string) => {
        if (!selectedZone) return "";
        const townObj = selectedZone.towns.find((t) => t.id === id);
        return townObj?.name || "";
    };

    // Obtenir le label du placeholder selon la zone sélectionnée
    const getTownPlaceholder = () => {
        if (!selectedZone) return "Choisir une commune ou un département";
        if (selectedZone.name === "Grand Abidjan") {
            return "Choisir une commune";
        }
        return "Choisir un département";
    };

    // Préremplir le formulaire en mode édition
    useEffect(() => {
        if (mode === "edit" && agency && open) {
            console.log("[EDIT AGENCY] Prefilling form with:", agency);
            setTitle(agency.title || "");
            setDescription(agency.description || "");
            setStreet(agency.street || "");

            // Préremplir geocoord
            if (agency.geocoord?.coordinates) {
                setLongitude(agency.geocoord.coordinates[0].toString());
                setLatitude(agency.geocoord.coordinates[1].toString());
            }

            // Préremplir contacts
            if (agency.contacts && agency.contacts.length > 0) {
                setContacts(agency.contacts as Contact[]);
            }

            // Préremplir social links
            if (agency.social_links && agency.social_links.length > 0) {
                setSocialLinks(agency.social_links);
            }
        } else if (mode === "create") {
            // Réinitialiser le formulaire en mode création
            setTitle("");
            setDescription("");
            setStreet("");
            setLatitude("");
            setLongitude("");
            setZone("");
            setTown("");
            setContacts([{ type: "phone", value: "" }]);
            setSocialLinks([]);
        }
    }, [mode, agency, open]);

    // Préremplir town et zone après avoir chargé les geoZones (mode édition uniquement)
    useEffect(() => {
        if (mode === "edit" && agency && open && geoZones.length > 0 && agency.town && !zone) {
            const townId = typeof agency.town === "string" ? agency.town : agency.town.id;
            // Essayer de trouver la zone correspondante
            for (const geoZone of geoZones) {
                const foundTown = geoZone.towns.find((t) => t.id === townId);
                if (foundTown) {
                    const zoneValue = zoneNameToSlug(geoZone.name);
                    setZone(zoneValue);
                    setTown(townId);
                    break;
                }
            }
        }
    }, [mode, agency, open, geoZones, zone]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "Le nom de l'agence est requis";
        }

        if (!street.trim()) {
            newErrors.street = "L'adresse est requise";
        }

        if (!town) {
            newErrors.town = "La commune ou le département est requis";
        }

        // Valider au moins un contact
        const validContacts = contacts.filter((c) => c.value.trim());
        if (validContacts.length === 0) {
            newErrors.contacts = "Au moins un contact est requis";
        }

        // Valider les emails
        const emailContacts = contacts.filter((c) => c.type === "email" && c.value.trim());
        emailContacts.forEach((contact, index) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contact.value)) {
                newErrors[`contact_email_${index}`] = "Email invalide";
            }
        });

        // Valider les coordonnées si fournies
        if (latitude && !isValidCoordinate(latitude, -90, 90)) {
            newErrors.latitude = "Latitude invalide (entre -90 et 90)";
        }

        if (longitude && !isValidCoordinate(longitude, -180, 180)) {
            newErrors.longitude = "Longitude invalide (entre -180 et 180)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidCoordinate = (value: string, min: number, max: number): boolean => {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        // Vérifier que l'utilisateur est authentifié
        if (!authData?.access_token || !user?.id) {
            setErrors({ submit: "Session expirée. Veuillez vous reconnecter." });
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparer les données selon la nouvelle structure (uniquement les champs autorisés)
            const agencyData: any = {
                title: title.trim(),
            };

            // Description (optionnel)
            if (description.trim()) {
                agencyData.description = description.trim();
            }

            // Street (optionnel)
            if (street.trim()) {
                agencyData.street = street.trim();
            }

            // Town (requis si zone sélectionnée)
            if (town) {
                agencyData.town = town;
            }

            // Geocoord (optionnel)
            if (latitude && longitude) {
                agencyData.geocoord = {
                    type: "Point" as const,
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                };
            }

            // Contacts (requis - au moins un)
            const validContacts = contacts.filter((c) => c.value.trim());
            if (validContacts.length > 0) {
                agencyData.contacts = validContacts.map((c) => ({ type: c.type, value: c.value.trim() }));
            }

            // Social links (optionnel)
            const validSocialLinks = socialLinks.filter((s) => s.url.trim());
            if (validSocialLinks.length > 0) {
                agencyData.social_links = validSocialLinks.map((s) => ({ service: s.service, url: s.url.trim() }));
            }

            // Docs (toujours présent, même si vide)
            agencyData.docs = [];

            console.log(`[${mode.toUpperCase()} AGENCY] Sending request with token:`, authData.access_token ? "Token present" : "No token");
            console.log(`[${mode.toUpperCase()} AGENCY] Agency data:`, agencyData);

            let response;
            let result;

            if (mode === "edit" && agency?.id) {
                // Mode édition
                response = await fetchWithRefresh(`/api/agencies/${agency.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(agencyData),
                });

                result = await response.json();

                if (result.data) {
                    // 1. Rafraîchir AVANT de fermer le modal
                    if (refreshUser) {
                        await refreshUser();
                    }

                    // 2. Fermer le modal
                    handleClose();

                    // 3. Appeler le callback avec les données
                    onSuccess(result.data);
                } else {
                    setErrors({ submit: result.error || "Erreur lors de la mise à jour de l'agence" });
                }
            } else {
                // Mode création
                response = await fetchWithRefresh("/api/agencies/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        agencyData,
                    }),
                });

                result = await response.json();

                if (result.success) {
                    // 1. Rafraîchir AVANT de fermer le modal
                    if (refreshUser) {
                        await refreshUser();
                    }

                    // 2. Fermer le modal
                    handleClose();

                    // 3. Appeler le callback avec les données
                    onSuccess(result.agency);
                } else {
                    setErrors({ submit: result.error || "Erreur lors de la création de l'agence" });
                }
            }
        } catch (error) {
            console.error("Error creating agency:", error);
            setErrors({ submit: "Une erreur est survenue" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        console.log("[AGENCY MODAL] handleClose called");
        // Reset form
        setTitle("");
        setDescription("");
        setStreet("");
        setLatitude("");
        setLongitude("");
        setZone("");
        setTown("");
        setContacts([{ type: "phone", value: "" }]);
        setSocialLinks([]);
        setErrors({});

        // Forcer le nettoyage immédiat du pointer-events
        document.body.style.pointerEvents = "";
        console.log("[AGENCY MODAL] Immediate pointer-events cleanup:", document.body.style.pointerEvents);

        onClose();
    };

    const addContact = () => {
        setContacts([...contacts, { type: "phone", value: "" }]);
    };

    const removeContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const updateContact = (index: number, field: "type" | "value", value: string) => {
        const newContacts = [...contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setContacts(newContacts);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { service: "facebook", url: "" }]);
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const updateSocialLink = (index: number, field: "service" | "url", value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSocialLinks(newLinks);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                console.log("[AGENCY MODAL] onOpenChange called with:", isOpen);
                if (!isOpen) {
                    handleClose();
                    // Forcer le nettoyage de l'overlay avec un délai plus long
                    setTimeout(() => {
                        console.log("[AGENCY MODAL] Cleaning pointer-events, current value:", document.body.style.pointerEvents);
                        document.body.style.pointerEvents = "";
                        console.log("[AGENCY MODAL] After cleaning:", document.body.style.pointerEvents);
                    }, 300);
                }
            }}
        >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{mode === "edit" ? "Modifier l'agence" : "Créer une nouvelle agence"}</DialogTitle>
                    <DialogDescription>
                        {mode === "edit" ? "Modifiez les informations de votre agence" : "Remplissez les informations de votre agence immobilière"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Nom de l'agence */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Nom de l'agence <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Agence Immobilière ABC"
                            className={errors.title ? "border-destructive" : ""}
                        />
                        {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description <span className="text-xs text-muted-foreground">(optionnel)</span>
                        </Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description de l'agence..."
                            rows={4}
                            className={errors.description ? "border-destructive" : ""}
                        />
                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>

                    {/* Adresse */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Adresse</h3>

                        {/* Zone géographique */}
                        <div className="space-y-2">
                            <Label>
                                Zone géographique <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={zone}
                                onValueChange={(value) => {
                                    setZone(value);
                                    setTown(""); // Réinitialiser town quand on change de zone
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choisir une zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {geoZones.map((geoZone) => {
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

                        {/* Commune / Département */}
                        <div className="space-y-2">
                            <Label>
                                {selectedZone?.name === "Grand Abidjan" ? "Commune" : "Département"} <span className="text-destructive">*</span>
                            </Label>
                            <Select value={town} onValueChange={(value) => setTown(value)} disabled={!zone || !selectedZone}>
                                <SelectTrigger>
                                    <SelectValue placeholder={getTownPlaceholder()} />
                                </SelectTrigger>
                                <SelectContent>
                                    {getTownsForSelectedZone().length > 0 ? (
                                        getTownsForSelectedZone().map((townObj) => (
                                            <SelectItem key={townObj.id} value={townObj.id}>
                                                {townObj.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="__no_option__" disabled>
                                            Aucune option disponible
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.town && <p className="text-sm text-destructive">{errors.town}</p>}
                        </div>

                        {/* Adresse / Quartier */}
                        <div className="space-y-2">
                            <Label htmlFor="street">
                                Adresse / Quartier <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="street"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="Ex: Palmeraie"
                                className={errors.street ? "border-destructive" : ""}
                            />
                            {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                        </div>

                        {/* Coordonnées GPS */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">
                                    Latitude <span className="text-xs text-muted-foreground">(optionnel)</span>
                                </Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="any"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="Ex: 5.353534841097627"
                                    className={errors.latitude ? "border-destructive" : ""}
                                />
                                {errors.latitude && <p className="text-sm text-destructive">{errors.latitude}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="longitude">
                                    Longitude <span className="text-xs text-muted-foreground">(optionnel)</span>
                                </Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="any"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="Ex: -3.976803018666061"
                                    className={errors.longitude ? "border-destructive" : ""}
                                />
                                {errors.longitude && <p className="text-sm text-destructive">{errors.longitude}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                Contacts <span className="text-destructive">*</span>
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addContact}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>

                        {contacts.map((contact, index) => (
                            <div key={index} className="flex gap-2">
                                <Select value={contact.type} onValueChange={(value) => updateContact(index, "type", value as "phone" | "email")}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="phone">Téléphone</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    value={contact.value}
                                    onChange={(e) => updateContact(index, "value", e.target.value)}
                                    placeholder={contact.type === "email" ? "contact@agence.com" : "+225 07 12 34 56 78"}
                                    className={`flex-1 ${errors[`contact_email_${index}`] ? "border-destructive" : ""}`}
                                />

                                {contacts.length > 1 && (
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeContact(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        {errors.contacts && <p className="text-sm text-destructive">{errors.contacts}</p>}
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                Réseaux sociaux <span className="text-xs text-muted-foreground">(optionnel)</span>
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addSocialLink}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>

                        {socialLinks.map((link, index) => (
                            <div key={index} className="flex gap-2">
                                <Select value={link.service} onValueChange={(value) => updateSocialLink(index, "service", value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="twitter">Twitter</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Input
                                    value={link.url}
                                    onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                                    placeholder="https://facebook.com/agence"
                                    className="flex-1"
                                />

                                <Button type="button" variant="ghost" size="icon" onClick={() => removeSocialLink(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Erreur de soumission */}
                    {errors.submit && (
                        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                            <p>{errors.submit}</p>
                        </div>
                    )}

                    {/* Boutons d'action */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
                            Annuler
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "edit" ? "Modification..." : "Création..."}
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {mode === "edit" ? "Modifier l'agence" : "Créer l'agence"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
