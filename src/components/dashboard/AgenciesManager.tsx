import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, MapPin, Phone, Mail, Calendar, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Agency, GeoZone, fetchGeoZones, fetchUserProperties } from "@/lib/directus-api";
import { Property } from "@/data/properties";
import { toast } from "@/lib/toast-helpers";
import { deleteAgency } from "@/lib/directus-api";
import AgencyFormModal from "./AgencyFormModal";

export default function AgenciesManager() {
    const { authData, user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
    const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [geoZones, setGeoZones] = useState<GeoZone[]>([]);
    const [agencyPropertiesCount, setAgencyPropertiesCount] = useState<number | null>(null);
    const [loadingProperties, setLoadingProperties] = useState(false);

    // Récupérer l'agence actuelle
    // Try root-level agency first, fallback to account.agency for backward compatibility
    const currentAgency = user?.agency && typeof user.agency === "object" && "id" in user.agency ? (user.agency as Agency) : user?.account?.agency;

    useEffect(() => {
        // Charger les zones géographiques
        const loadGeoZones = async () => {
            try {
                const zones = await fetchGeoZones();
                setGeoZones(zones);
            } catch (error) {
                console.error("[AGENCIES MANAGER] Error loading geo zones:", error);
            }
        };
        loadGeoZones();

        // L'agence est maintenant directement dans user.account.agency
        setLoading(false);
    }, [user]);

    // Charger les annonces liées à l'agence
    useEffect(() => {
        const loadAgencyProperties = async () => {
            if (!currentAgency || !authData?.access_token || !user?.id) {
                setAgencyPropertiesCount(0);
                return;
            }

            setLoadingProperties(true);
            try {
                // Charger toutes les propriétés pour compter celles de l'agence (limit élevé)
                const result = await fetchUserProperties(authData.access_token, user.id, 1, 1000);
                
                if (result.properties && result.properties.length > 0) {
                    const agencyId = typeof currentAgency === "object" ? currentAgency.id : currentAgency;
                    // Filtrer les annonces liées à cette agence
                    const agencyProperties = result.properties.filter((property: Property) => {
                        const propertyAgencyId = typeof property.agency === "string" ? property.agency : null;
                        return propertyAgencyId === agencyId;
                    });
                    setAgencyPropertiesCount(agencyProperties.length);
                } else {
                    setAgencyPropertiesCount(0);
                }
            } catch (error) {
                console.error("[AGENCIES MANAGER] Error loading agency properties:", error);
                setAgencyPropertiesCount(0);
            } finally {
                setLoadingProperties(false);
            }
        };

        loadAgencyProperties();
    }, [currentAgency, authData?.access_token, user?.id]);

    // Nettoyage global du pointer-events
    useEffect(() => {
        const cleanupPointerEvents = () => {
            if (document.body.style.pointerEvents === "none") {
                document.body.style.pointerEvents = "";
                console.log("[AGENCIES MANAGER] Cleaned pointer-events");
            }
        };

        // Nettoyer après chaque changement d'état
        cleanupPointerEvents();

        return cleanupPointerEvents;
    }, [isEditModalOpen, showCreateModal, deletingAgency]);

    const getStatusBadge = (status?: string) => {
        const normalizedStatus = status?.toLowerCase() || "published";
        switch (normalizedStatus) {
            case "published":
            case "active":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Actif
                    </Badge>
                );
            case "draft":
            case "inactive":
                return <Badge variant="secondary">Inactif</Badge>;
            default:
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Actif
                    </Badge>
                );
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR");
    };

    const getAgencyLocation = (agency: Agency) => {
        const parts: string[] = [];

        // Obtenir l'ID de la town
        const townId = typeof agency.town === "object" && agency.town?.id ? agency.town.id : typeof agency.town === "string" ? agency.town : null;

        if (!townId) {
            // Si pas de town, retourner juste la street si disponible
            return agency.street || "-";
        }

        // Chercher la zone et la commune à partir de l'ID de la town
        let zoneName: string | null = null;
        let townName: string | null = null;

        for (const geoZone of geoZones) {
            const foundTown = geoZone.towns?.find((t) => t.id === townId);
            if (foundTown) {
                zoneName = geoZone.name;
                townName = foundTown.name;
                break;
            }
        }

        // Si on n'a pas trouvé dans les GeoZones, essayer d'utiliser les données de l'objet town si disponible
        if (!townName && typeof agency.town === "object" && agency.town?.name) {
            townName = agency.town.name;
        }

        // Construire la chaîne au format "Zone, Commune, Street"
        if (zoneName) parts.push(zoneName);
        if (townName) parts.push(townName);
        if (agency.street) parts.push(agency.street);

        return parts.length > 0 ? parts.join(", ") : "-";
    };

    const getAgencyContact = (agency: Agency, type: "email" | "phone") => {
        if (!agency.contacts) return null;
        return agency.contacts.find((c) => c.type === type);
    };

    const getAllContacts = (agency: Agency) => {
        if (!agency.contacts) return [];
        return agency.contacts;
    };

    const handleAddAgency = () => {
        setShowCreateModal(true);
    };

    const handleAgencyCreated = (newAgency?: Agency) => {
        // Toast immédiat pour feedback utilisateur
        toast.success("Agence créée", {
            description: "Votre agence a été créée avec succès",
        });

        // Rafraîchir le contexte utilisateur
        if (refreshUser) {
            refreshUser();
        }
    };

    const handleEditAgency = () => {
        if (currentAgency) {
            setEditingAgency(currentAgency);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteAgency = () => {
        if (currentAgency) {
            setDeletingAgency(currentAgency);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingAgency) return;

        setIsDeleting(true);
        try {
            const result = await deleteAgency(authData?.access_token || "", deletingAgency.id);

            if (result.success) {
                // Rafraîchir AVANT de fermer le dialog
                if (refreshUser) {
                    await refreshUser();
                }

                // Fermer le dialog
                setDeletingAgency(null);

                // Toast et rafraîchissement
                toast.success("Agence supprimée", {
                    description: "L'agence a été supprimée avec succès",
                });

                // Rafraîchir le contexte utilisateur
                if (refreshUser) {
                    await refreshUser();
                }
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de supprimer l'agence",
                });
            }
        } catch (error) {
            console.error("Error deleting agency:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la suppression",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Mon agence</h2>
                    <p className="text-muted-foreground">Gérez les informations de votre agence</p>
                </div>
                {currentAgency && (
                    <div className="flex gap-2">
                        <Button onClick={handleEditAgency} variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                        </Button>
                        <Button onClick={handleDeleteAgency} variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                        </Button>
                    </div>
                )}
            </div>

            {/* Dashboard */}
            {loading ? (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </CardContent>
                </Card>
            ) : !currentAgency ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Aucune agence</h3>
                            <p className="text-muted-foreground mb-6">Commencez par créer votre agence pour gérer vos annonces.</p>
                            <Button onClick={handleAddAgency} variant="hero">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une agence
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Card principale - Informations générales */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl">{currentAgency.title}</CardTitle>
                                    <CardDescription className="mt-1">Informations générales</CardDescription>
                                </div>
                                {getStatusBadge(currentAgency.status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Description */}
                            {currentAgency.description && (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{currentAgency.description}</p>
                                    </div>
                                    <Separator />
                                </>
                            )}

                            {/* Localisation */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">Localisation</span>
                                </div>
                                <p className="text-sm">{getAgencyLocation(currentAgency)}</p>
                            </div>

                            <Separator />

                            {/* Contacts */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">Contacts</span>
                                </div>
                                <div className="space-y-2">
                                    {getAllContacts(currentAgency).length > 0 ? (
                                        getAllContacts(currentAgency).map((contact, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-sm">
                                                {contact.type === "email" ? (
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <span>{contact.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Aucun contact enregistré</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Date de création */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium text-muted-foreground">Date de création</span>
                                </div>
                                <p className="text-sm">{formatDate(currentAgency.date_created)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card secondaire - Statistiques */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistiques</CardTitle>
                            <CardDescription>Vue d'ensemble de votre agence</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Annonces</span>
                                </div>
                                {loadingProperties ? (
                                    <Skeleton className="h-5 w-8" />
                                ) : (
                                    <span className="text-lg font-bold">{agencyPropertiesCount ?? 0}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Statut</span>
                                </div>
                                {getStatusBadge(currentAgency.status)}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Modal de création d'agence */}
            {/* Modal création */}
            <AgencyFormModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleAgencyCreated} mode="create" />

            {/* Modal édition */}
            <AgencyFormModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingAgency(null);
                }}
                onSuccess={(updatedAgency?: Agency) => {
                    toast.success("Agence mise à jour", {
                        description: "Les modifications ont été enregistrées",
                    });
                    // Rafraîchir le contexte utilisateur
                    if (refreshUser) {
                        refreshUser();
                    }
                }}
                agency={editingAgency}
                mode="edit"
            />

            {/* Dialog de confirmation de suppression */}
            <Dialog
                open={!!deletingAgency}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingAgency(null);
                        // Forcer le nettoyage de l'overlay
                        setTimeout(() => {
                            const body = document.body;
                            if (body.style.pointerEvents === "none") {
                                body.style.pointerEvents = "";
                            }
                        }, 50);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>Êtes-vous sûr de vouloir supprimer l'agence "{deletingAgency?.title}" ? Cette action est irréversible.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingAgency(null)} disabled={isDeleting}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Suppression...
                                </>
                            ) : (
                                "Supprimer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
