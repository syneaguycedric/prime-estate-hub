import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Search, MapPin, Phone, Mail, Users, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Agency } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";
import { useApiWithRefresh } from "@/hooks/use-api-with-refresh";
import { deleteAgency } from "@/lib/directus-api";
import AgencyFormModal from "./AgencyFormModal";

export default function AgenciesManager() {
    const { authData, user, refreshUser } = useAuth();
    const { fetchWithRefresh } = useApiWithRefresh();
    const [searchQuery, setSearchQuery] = useState("");
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
    const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
    const [isAttaching, setIsAttaching] = useState(false);
    const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadAgencies();
    }, [user]);

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
    }, [isEditModalOpen, showCreateModal, selectedAgency, deletingAgency]);

    const loadAgencies = async () => {
        if (!user?.account?.agencies) {
            setAgencies([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Extraire les agences depuis user.account.agencies
            const userAgencies = user.account.agencies.map((item) => {
                const agency = item.estate_agencies_id;
                // S'assurer que address existe et est un objet
                if (typeof agency.address === "number") {
                    // Adresse non chargée, juste l'ID
                    agency.address = {
                        id: agency.address,
                        country: "",
                        state: "",
                        city: "",
                        street: "",
                        contacts: [],
                    } as any;
                }
                return agency;
            });
            setAgencies(userAgencies);
        } catch (error) {
            console.error("Error loading agencies:", error);
            toast.error("Erreur", {
                description: "Impossible de charger vos agences",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAgencies = agencies.filter(
        (agency) =>
            agency.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.address.state.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
        return `${agency.address.city}, ${agency.address.state}`;
    };

    const getAgencyContact = (agency: Agency, type: "email" | "phone") => {
        const contact = agency.address?.contacts?.find((c) => c.type === type);
        return contact?.value || "-";
    };

    const handleAddAgency = () => {
        setShowCreateModal(true);
    };

    const handleAgencyCreated = () => {
        const wasSetAsCurrent = !user?.account?.agency;
        toast.success("Agence créée", {
            description: wasSetAsCurrent ? "Votre agence a été créée et définie comme agence actuelle" : "Votre agence a été créée avec succès",
        });
        loadAgencies();
    };

    const handleEditAgency = (agencyId: string) => {
        const agency = agencies.find((a) => a.id === agencyId);
        if (agency) {
            setEditingAgency(agency);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteAgency = (agencyId: string) => {
        const agency = agencies.find((a) => a.id === agencyId);
        if (agency) {
            setDeletingAgency(agency);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deletingAgency) return;

        setIsDeleting(true);
        try {
            const result = await deleteAgency(authData?.access_token || "", deletingAgency.id);

            if (result.success) {
                // Fermer immédiatement le dialog
                setDeletingAgency(null);

                // Rafraîchir après fermeture
                setTimeout(async () => {
                    toast.success("Agence supprimée", {
                        description: "L'agence a été supprimée avec succès",
                    });

                    if (refreshUser) {
                        await refreshUser();
                    }
                    loadAgencies();
                }, 50);
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

    const handleSelectAgency = (agency: Agency) => {
        setSelectedAgency(agency);
    };

    const handleConfirmAttachment = async () => {
        if (!selectedAgency || !authData?.access_token || !user?.id) return;

        const hasExistingAgency = user?.account?.agency;

        setIsAttaching(true);
        try {
            const response = await fetchWithRefresh("/api/users/attach-agency", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user.id,
                    agencyId: selectedAgency.id,
                }),
            });

            if (!response.ok) {
                const result = await response.json();
                toast.error("Erreur", {
                    description: result.error || "Impossible de rattacher l'agence",
                });
            } else {
                const result = await response.json();

                if (result.success) {
                    toast.success("Agence rattachée", {
                        description: hasExistingAgency ? "Votre agence a été changée avec succès" : "Votre compte est maintenant rattaché à cette agence",
                    });

                    // Mettre à jour le contexte utilisateur pour que le badge s'affiche
                    if (refreshUser) {
                        await refreshUser();
                    }

                    // Mettre à jour l'interface immédiatement
                    setAgencies((prevAgencies) =>
                        prevAgencies.map((agency) => ({
                            ...agency,
                            isCurrentAgency: agency.id === selectedAgency.id,
                        }))
                    );
                }
            }
        } catch (error) {
            console.error("[ATTACH AGENCY] Error:", error);
            toast.error("Erreur", {
                description: "Une erreur réseau est survenue",
            });
        } finally {
            setIsAttaching(false);
            // Fermer le Dialog immédiatement pour éviter l'overlay persistant
            setSelectedAgency(null);

            // Forcer le nettoyage de l'overlay après un délai
            setTimeout(() => {
                // Vérifier et corriger le pointer-events si nécessaire
                const body = document.body;
                if (body.style.pointerEvents === "none") {
                    body.style.pointerEvents = "";
                }
            }, 100);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Gestion des agences</h2>
                    <p className="text-muted-foreground">Gérez vos agences partenaires et leurs informations</p>
                </div>
                <Button onClick={handleAddAgency} variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une agence
                </Button>
            </div>

            {/* Recherche */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Rechercher par nom ou localisation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Liste des agences */}
            {loading ? (
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : filteredAgencies.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{searchQuery ? "Aucune agence trouvée" : "Aucune agence"}</h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery ? "Essayez de modifier vos critères de recherche." : "Commencez par ajouter votre première agence."}
                            </p>
                            <Button onClick={handleAddAgency} variant="hero">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter une agence
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Agence</TableHead>
                                        <TableHead>Localisation</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Annonces</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAgencies.map((agency) => (
                                        <TableRow key={agency.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{agency.title}</div>
                                                    </div>
                                                    {(user?.account?.agency === agency.id || (agency as any).isCurrentAgency) && (
                                                        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 shrink-0">
                                                            Agence actuelle
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{getAgencyLocation(agency)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {agency.address?.contacts && agency.address.contacts.length > 0 ? (
                                                    <div className="space-y-1 text-sm">
                                                        {agency.address.contacts.map((contact, idx) => (
                                                            <div key={idx} className="text-muted-foreground">
                                                                {contact.type === "email" ? "📧" : "📞"} {contact.value}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">Aucun contact</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">-</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(agency.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(agency.date_created)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleSelectAgency(agency)}>Choisir cette agence</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditAgency(agency.id)}>Modifier</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteAgency(agency.id)} className="text-destructive">
                                                            Supprimer
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
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
                onSuccess={() => {
                    toast.success("Agence mise à jour", {
                        description: "Les modifications ont été enregistrées",
                    });
                    loadAgencies();
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

            {/* Dialog de confirmation de rattachement */}
            <Dialog
                open={!!selectedAgency}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedAgency(null);
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
                        <DialogTitle>Confirmer le rattachement</DialogTitle>
                        <DialogDescription>
                            {user?.account?.agency
                                ? `Vous êtes déjà rattaché à une agence. Voulez-vous changer pour "${selectedAgency?.title}" ? Cette action remplacera votre agence actuelle.`
                                : `Voulez-vous rattacher votre compte à l'agence "${selectedAgency?.title}" ?`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedAgency(null)} disabled={isAttaching}>
                            Annuler
                        </Button>
                        <Button onClick={handleConfirmAttachment} disabled={isAttaching} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isAttaching ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Rattachement...
                                </>
                            ) : (
                                "Confirmer"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
