import { useState, useEffect } from "react";
import { X, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/lib/toast-helpers";
import { useApiWithRefresh } from "@/hooks/use-api-with-refresh";
import { Agency } from "@/lib/directus-api";

interface AgencyFormModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (newAgency?: Agency) => void;
    agency?: Agency | null;
    mode: "create" | "edit";
}

interface Contact {
    type: "email" | "phone";
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
    const [country, setCountry] = useState("civ");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");

    // Contacts
    const [contacts, setContacts] = useState<Contact[]>([{ type: "email", value: "" }]);

    // Réseaux sociaux
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    // Préremplir le formulaire en mode édition
    useEffect(() => {
        if (mode === "edit" && agency && open) {
            console.log("[EDIT AGENCY] Prefilling form with:", agency);
            setTitle(agency.title || "");
            setCountry(agency.address?.country || "civ");
            setState(agency.address?.state || "");
            setCity(agency.address?.city || "");
            setStreet(agency.address?.street || "");

            // Préremplir geocoord
            if (agency.address?.geocoord?.coordinates) {
                setLongitude(agency.address.geocoord.coordinates[0].toString());
                setLatitude(agency.address.geocoord.coordinates[1].toString());
            }

            // Préremplir contacts
            if (agency.address?.contacts && agency.address.contacts.length > 0) {
                setContacts(agency.address.contacts);
            }

            // Préremplir social links
            if (agency.address?.social_links && agency.address.social_links.length > 0) {
                setSocialLinks(agency.address.social_links);
            }
        } else if (mode === "create") {
            // Réinitialiser le formulaire en mode création
            setTitle("");
            setCountry("civ");
            setState("");
            setCity("");
            setStreet("");
            setLatitude("");
            setLongitude("");
            setContacts([{ type: "email", value: "" }]);
            setSocialLinks([]);
        }
    }, [mode, agency, open]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = "Le nom de l'agence est requis";
        }

        if (!state.trim()) {
            newErrors.state = "La région est requise";
        }

        if (!city.trim()) {
            newErrors.city = "La ville est requise";
        }

        if (!street.trim()) {
            newErrors.street = "L'adresse est requise";
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
            // Préparer les données
            const agencyData = {
                title: title.trim(),
                address: {
                    country,
                    state: state.trim(),
                    city: city.trim(),
                    street: street.trim(),
                    geocoord:
                        latitude && longitude
                            ? {
                                  type: "Point" as const,
                                  coordinates: [parseFloat(longitude), parseFloat(latitude)],
                              }
                            : undefined,
                    contacts: contacts.filter((c) => c.value.trim()).map((c) => ({ type: c.type, value: c.value.trim() })),
                    social_links: socialLinks.filter((s) => s.url.trim()).map((s) => ({ service: s.service, url: s.url.trim() })),
                },
                docs: [],
            };

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
                        userId: user.id,
                    }),
                });

                result = await response.json();

                if (result.success) {
                    const wasSetAsCurrent = !user?.account?.agency;

                    // 1. Rafraîchir AVANT de fermer le modal
                    if (refreshUser) {
                        await refreshUser();
                    }

                    // 2. Fermer le modal
                    handleClose();

                    // 3. Appeler le callback avec les données
                    onSuccess(result.data);
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
        setState("");
        setCity("");
        setStreet("");
        setLatitude("");
        setLongitude("");
        setContacts([{ type: "email", value: "" }]);
        setSocialLinks([]);
        setErrors({});

        // Forcer le nettoyage immédiat du pointer-events
        document.body.style.pointerEvents = "";
        console.log("[AGENCY MODAL] Immediate pointer-events cleanup:", document.body.style.pointerEvents);

        onClose();
    };

    const addContact = () => {
        setContacts([...contacts, { type: "email", value: "" }]);
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

                    {/* Adresse */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Adresse</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">
                                    Pays <span className="text-destructive">*</span>
                                </Label>
                                <Select value={country} onValueChange={setCountry}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="civ">Côte d'Ivoire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="state">
                                    Région <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="state"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Ex: Lagunes"
                                    className={errors.state ? "border-destructive" : ""}
                                />
                                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">
                                    Ville <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="Ex: Abidjan"
                                    className={errors.city ? "border-destructive" : ""}
                                />
                                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="street">
                                    Adresse / Quartier <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="street"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="Ex: Koumassi"
                                    className={errors.street ? "border-destructive" : ""}
                                />
                                {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                            </div>
                        </div>

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
                                    placeholder="Ex: 5.364750976280646"
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
                                    placeholder="Ex: -3.949819333761781"
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
                                <Select value={contact.type} onValueChange={(value) => updateContact(index, "type", value)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="phone">Téléphone</SelectItem>
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
