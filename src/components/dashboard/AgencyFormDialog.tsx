import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Loader2, MapPin, Phone, Mail, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Agency, CreateAgencyData } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";

interface AgencyFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (agency: Agency) => void;
    agency?: Agency;
}

interface Contact {
    type: "email" | "phone";
    value: string;
}

interface SocialLink {
    service: string;
    url: string;
}

export default function AgencyFormDialog({ open, onClose, onSuccess, agency }: AgencyFormDialogProps) {
    const [loading, setLoading] = useState(false);

    // Données du formulaire
    const [title, setTitle] = useState("");
    const [country, setCountry] = useState("civ");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [contacts, setContacts] = useState<Contact[]>([{ type: "email", value: "" }]);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    // Erreurs
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Charger les données si édition
    useEffect(() => {
        if (agency && open) {
            setTitle(agency.title);
            setCountry(agency.address.country);
            setState(agency.address.state);
            setCity(agency.address.city);
            setStreet(agency.address.street);
            setContacts(agency.address.contacts || [{ type: "email", value: "" }]);
            setSocialLinks(agency.address.social_links || []);
        } else if (open) {
            // Réinitialiser le formulaire
            setTitle("");
            setCountry("civ");
            setState("");
            setCity("");
            setStreet("");
            setContacts([{ type: "email", value: "" }]);
            setSocialLinks([]);
            setErrors({});
        }
    }, [agency, open]);

    const handleAddContact = () => {
        setContacts([...contacts, { type: "email", value: "" }]);
    };

    const handleRemoveContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const handleContactChange = (index: number, field: keyof Contact, value: string) => {
        const newContacts = [...contacts];
        newContacts[index] = { ...newContacts[index], [field]: value };
        setContacts(newContacts);
    };

    const handleAddSocialLink = () => {
        setSocialLinks([...socialLinks, { service: "facebook", url: "" }]);
    };

    const handleRemoveSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
        const newLinks = [...socialLinks];
        newLinks[index] = { ...newLinks[index], [field]: value };
        setSocialLinks(newLinks);
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title || title.trim().length < 3) {
            newErrors.title = "Le nom doit contenir au moins 3 caractères";
        }

        if (!state || state.trim().length < 2) {
            newErrors.state = "La région est requise";
        }

        if (!city || city.trim().length < 2) {
            newErrors.city = "La ville est requise";
        }

        if (!street || street.trim().length < 3) {
            newErrors.street = "L'adresse est requise";
        }

        // Valider qu'il y a au moins un contact
        const validContacts = contacts.filter((c) => c.value.trim().length > 0);
        if (validContacts.length === 0) {
            newErrors.contacts = "Au moins un contact est requis";
        }

        // Valider les emails
        contacts.forEach((contact, index) => {
            if (contact.type === "email" && contact.value.trim().length > 0) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(contact.value)) {
                    newErrors[`contact_${index}`] = "Format email invalide";
                }
            }
        });

        // Valider les URLs des réseaux sociaux
        socialLinks.forEach((link, index) => {
            if (link.url.trim().length > 0) {
                try {
                    new URL(link.url);
                } catch {
                    newErrors[`social_${index}`] = "URL invalide";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error("Erreur de validation", {
                description: "Veuillez corriger les erreurs dans le formulaire",
            });
            return;
        }

        setLoading(true);

        try {
            // Filtrer les contacts et liens sociaux valides
            const validContacts = contacts.filter((c) => c.value.trim().length > 0);
            const validSocialLinks = socialLinks.filter((l) => l.url.trim().length > 0);

            const data: CreateAgencyData = {
                title: title.trim(),
                address: {
                    country,
                    state: state.trim(),
                    city: city.trim(),
                    street: street.trim(),
                    contacts: validContacts,
                    social_links: validSocialLinks.length > 0 ? validSocialLinks : undefined,
                },
                docs: [],
            };

            // Appeler l'API via le parent
            console.log("[AGENCY FORM] Submitting agency data:", data);

            // Pour l'instant, on appelle juste onSuccess avec les données mockées
            // Le parent gérera l'appel API réel
            onSuccess(data as any);
        } catch (error: any) {
            console.error("[AGENCY FORM] Error:", error);
            toast.error("Erreur", {
                description: error.message || "Impossible de sauvegarder l'agence",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !loading && !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{agency ? "Modifier l'agence" : "Créer une agence"}</DialogTitle>
                    <DialogDescription>{agency ? "Modifiez les informations de votre agence" : "Remplissez les informations de votre agence immobilière"}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Informations générales */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Informations générales</h3>

                        {/* Nom */}
                        <div className="space-y-2">
                            <Label htmlFor="title">Nom de l'agence *</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors((prev) => ({ ...prev, title: "" }));
                                }}
                                placeholder="Ex: Immobilier Abidjan Premium"
                                className={errors.title ? "border-destructive" : ""}
                            />
                            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                        </div>
                    </div>

                    {/* Adresse */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Adresse
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Pays */}
                            <div className="space-y-2">
                                <Label htmlFor="country">Pays *</Label>
                                <Select value={country} onValueChange={setCountry}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="civ">Côte d'Ivoire</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Région */}
                            <div className="space-y-2">
                                <Label htmlFor="state">Région/État *</Label>
                                <Input
                                    id="state"
                                    value={state}
                                    onChange={(e) => {
                                        setState(e.target.value);
                                        setErrors((prev) => ({ ...prev, state: "" }));
                                    }}
                                    placeholder="Ex: Lagunes"
                                    className={errors.state ? "border-destructive" : ""}
                                />
                                {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Ville */}
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville *</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => {
                                        setCity(e.target.value);
                                        setErrors((prev) => ({ ...prev, city: "" }));
                                    }}
                                    placeholder="Ex: Abidjan"
                                    className={errors.city ? "border-destructive" : ""}
                                />
                                {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                            </div>

                            {/* Rue */}
                            <div className="space-y-2">
                                <Label htmlFor="street">Adresse/Rue *</Label>
                                <Input
                                    id="street"
                                    value={street}
                                    onChange={(e) => {
                                        setStreet(e.target.value);
                                        setErrors((prev) => ({ ...prev, street: "" }));
                                    }}
                                    placeholder="Ex: Cocody Riviera"
                                    className={errors.street ? "border-destructive" : ""}
                                />
                                {errors.street && <p className="text-sm text-destructive">{errors.street}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Contacts */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Contacts *
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddContact}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>

                        {errors.contacts && <p className="text-sm text-destructive">{errors.contacts}</p>}

                        <div className="space-y-3">
                            {contacts.map((contact, index) => (
                                <div key={index} className="flex items-start gap-2">
                                    <Select value={contact.type} onValueChange={(value) => handleContactChange(index, "type", value as "email" | "phone")}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4" />
                                                    Email
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="phone">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4" />
                                                    Téléphone
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        value={contact.value}
                                        onChange={(e) => {
                                            handleContactChange(index, "value", e.target.value);
                                            setErrors((prev) => ({ ...prev, [`contact_${index}`]: "", contacts: "" }));
                                        }}
                                        placeholder={contact.type === "email" ? "contact@agence.com" : "+225 07 00 00 00 00"}
                                        className={errors[`contact_${index}`] ? "border-destructive" : ""}
                                    />
                                    {contacts.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveContact(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {errors[`contact_${index}`] && <p className="text-sm text-destructive">{errors[`contact_${index}`]}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Réseaux sociaux (optionnel)
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddSocialLink}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>

                        {socialLinks.length > 0 && (
                            <div className="space-y-3">
                                {socialLinks.map((link, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <Select value={link.service} onValueChange={(value) => handleSocialLinkChange(index, "service", value)}>
                                            <SelectTrigger className="w-40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facebook">Facebook</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                                <SelectItem value="twitter">Twitter</SelectItem>
                                                <SelectItem value="website">Site Web</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            value={link.url}
                                            onChange={(e) => {
                                                handleSocialLinkChange(index, "url", e.target.value);
                                                setErrors((prev) => ({ ...prev, [`social_${index}`]: "" }));
                                            }}
                                            placeholder="https://..."
                                            className={errors[`social_${index}`] ? "border-destructive" : ""}
                                        />
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveSocialLink(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {errors[`social_${index}`] && <p className="text-sm text-destructive">{errors[`social_${index}`]}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {agency ? "Mise à jour..." : "Création..."}
                            </>
                        ) : agency ? (
                            "Mettre à jour"
                        ) : (
                            "Créer l'agence"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
