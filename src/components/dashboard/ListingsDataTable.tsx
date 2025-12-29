import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Pencil, Trash2, MoreHorizontal, Plus, Calendar, MapPin, RefreshCw, Zap, Sparkles } from "lucide-react";
import { Property } from "@/data/properties";
import { getFirstImageUrl, formatPriceOnly, getFirstImageUrlForCard, getPropertyTypeLabel, getContractTypeLabel } from "@/lib/property-helpers";
import { useIsMobile } from "@/hooks/use-mobile";
import ImageWithLoading from "@/components/ui/image-with-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-helpers";
import { deleteProperty, reloadProperty, resubmitProperty, fetchPromotionRanges, PromotionRange } from "@/lib/directus-api";
import { useAuth } from "@/contexts/AuthContext";
import BoostModal from "@/components/dashboard/BoostModal";

interface ListingsDataTableProps {
    properties: Property[];
    loading: boolean;
    onRefresh: () => void;
}

export default function ListingsDataTable({ properties, loading, onRefresh }: ListingsDataTableProps) {
    const router = useRouter();
    const { authData, refreshUser } = useAuth();
    const isMobile = useIsMobile();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [reloadingPropertyId, setReloadingPropertyId] = useState<string | null>(null);
    const [resubmitDialogOpen, setResubmitDialogOpen] = useState(false);
    const [propertyToResubmit, setPropertyToResubmit] = useState<Property | null>(null);
    const [isResubmitting, setIsResubmitting] = useState(false);
    const [resubmittingPropertyId, setResubmittingPropertyId] = useState<string | null>(null);
    const [boostModalOpen, setBoostModalOpen] = useState(false);
    const [propertyToBoost, setPropertyToBoost] = useState<Property | null>(null);
    const [promotions, setPromotions] = useState<PromotionRange[]>([]);

    // Nettoyage global des pointer-events au montage
    useEffect(() => {
        const body = document.body;
        if (body.style.pointerEvents === "none") {
            body.style.pointerEvents = "";
            body.style.removeProperty("pointer-events");
            console.log("[LISTINGS] Global pointer-events cleanup on mount");
        }
    }, []);

    // Charger les promotions une seule fois au montage
    useEffect(() => {
        const loadPromotions = async () => {
            try {
                const result = await fetchPromotionRanges();
                if (result.success && result.promotions) {
                    setPromotions(result.promotions);
                }
            } catch (error) {
                console.error("[LISTINGS] Error loading promotions:", error);
            }
        };
        loadPromotions();
    }, []);

    // Surveiller l'état du dialog et nettoyer pointer-events quand il est fermé
    useEffect(() => {
        if (!deleteDialogOpen) {
            // Nettoyage immédiat quand le dialog est fermé
            const body = document.body;
            body.style.pointerEvents = "";
            body.style.removeProperty("pointer-events");

            // Nettoyage supplémentaire avec délai pour être sûr
            const timeout = setTimeout(() => {
                body.style.pointerEvents = "";
                body.style.removeProperty("pointer-events");
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [deleteDialogOpen]);

    // Filtrage des propriétés
    const filteredProperties = useMemo(() => {
        return properties.filter((property) => {
            const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && property.status === "published") ||
                (statusFilter === "draft" && property.status === "draft") ||
                (statusFilter === "expired" && property.status === "expired") ||
                (statusFilter === "archived" && property.status === "archived") ||
                (statusFilter === "rejected" && property.status === "rejected");

            const matchesType = typeFilter === "all" || property.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [properties, searchQuery, statusFilter, typeFilter]);

    const handleView = (property: Property) => {
        router.push(`/biens/${property.id}`);
    };

    const handleBoost = (property: Property) => {
        setPropertyToBoost(property);
        setBoostModalOpen(true);
    };

    const handleEdit = (property: Property) => {
        router.push(`/edit-listing/${property.id}`);
    };

    const handleDelete = (property: Property) => {
        setPropertyToDelete(property);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!propertyToDelete) return;

        setIsDeleting(true);
        try {
            const result = await deleteProperty(propertyToDelete.id);

            if (result.success) {
                // Rafraîchir AVANT de fermer le dialog
                if (refreshUser) {
                    await refreshUser();
                }

                // Fermer le dialog (onOpenChange va gérer setPropertyToDelete)
                setDeleteDialogOpen(false);

                // Nettoyage immédiat de pointer-events
                const body = document.body;
                body.style.pointerEvents = "";
                body.style.removeProperty("pointer-events");

                // Toast et rechargement
                toast.success("Annonce supprimée", {
                    description: "L'annonce a été supprimée avec succès",
                });
                onRefresh();
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de supprimer l'annonce",
                });
            }
        } catch (error) {
            console.error("Error deleting property:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la suppression",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateListing = () => {
        router.push("/create-listing");
    };

    const handleReload = async (property: Property) => {
        if (reloadingPropertyId) return; // Empêcher les clics multiples

        setReloadingPropertyId(property.id);
        try {
            const result = await reloadProperty(property.id);

            if (result.success) {
                toast.success("Annonce relancée", {
                    description: "L'annonce a été relancée avec succès",
                });

                // Rafraîchir les données
                if (refreshUser) {
                    await refreshUser();
                }
                onRefresh();
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de relancer l'annonce",
                });
            }
        } catch (error) {
            console.error("Error reloading property:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la relance",
            });
        } finally {
            setReloadingPropertyId(null);
        }
    };

    const handleResubmit = (property: Property) => {
        setPropertyToResubmit(property);
        setResubmitDialogOpen(true);
    };

    const confirmResubmit = async () => {
        if (!propertyToResubmit) return;

        setIsResubmitting(true);
        setResubmittingPropertyId(propertyToResubmit.id);
        try {
            const result = await resubmitProperty(propertyToResubmit.id);

            if (result.success) {
                // Rafraîchir AVANT de fermer le dialog
                if (refreshUser) {
                    await refreshUser();
                }

                // Fermer le dialog
                setResubmitDialogOpen(false);

                // Toast et rechargement
                toast.success("Annonce soumise", {
                    description: "L'annonce a été soumise à nouveau avec succès",
                });
                onRefresh();
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de soumettre l'annonce",
                });
            }
        } catch (error) {
            console.error("Error resubmitting property:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors de la soumission",
            });
        } finally {
            setIsResubmitting(false);
            setResubmittingPropertyId(null);
        }
    };

    const isPropertyBoosted = (property: Property): boolean => {
        if (!property.promotions || property.promotions.length === 0) {
            return false;
        }
        return property.promotions.some(
            (promo) => promo.promotions_id?.status === "in_progress"
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Actif
                    </Badge>
                );
            case "draft":
                return <Badge variant="secondary">En attente de validation</Badge>;
            case "expired":
                return (
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                        Expiré
                    </Badge>
                );
            case "archived":
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                        Archivé
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        Rejeté
                    </Badge>
                );
            default:
                return <Badge variant="outline">Inconnu</Badge>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "appartment":
                return "Appartement";
            case "villa":
                return "Villa";
            case "land":
                return "Terrain";
            default:
                return type;
        }
    };

    // Fonctions pour obtenir le label à afficher dans les selects
    const getStatusDisplayLabel = (value: string) => {
        if (value === "all") return "Statut";
        switch (value) {
            case "active":
                return "Actif";
            case "draft":
                return "En attente de validation";
            case "expired":
                return "Expiré";
            case "archived":
                return "Archivé";
            case "rejected":
                return "Rejeté";
            default:
                return "Statut";
        }
    };

    const getTypeDisplayLabel = (value: string) => {
        if (value === "all") return "Type de bien";
        return getTypeLabel(value);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
        return date.toLocaleDateString("fr-FR");
    };

    /**
     * Retourne les classes CSS pour le background selon le statut de l'annonce
     */
    const getStatusRowClasses = (status: string, isMobile: boolean = false): string => {
        const baseClasses = isMobile ? "flex items-center gap-2.5 p-2 rounded-lg border transition-colors" : "hover:bg-muted/50";

        switch (status) {
            case "expired":
                return isMobile ? `${baseClasses} bg-orange-50/50 border-orange-200 hover:bg-orange-100/50` : `${baseClasses} bg-orange-50/50 hover:bg-orange-100/50`;
            case "rejected":
                return isMobile ? `${baseClasses} bg-red-50/50 border-red-200 hover:bg-red-100/50` : `${baseClasses} bg-red-50/50 hover:bg-red-100/50`;
            default:
                return isMobile ? `${baseClasses} border-border hover:bg-muted/50` : baseClasses;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Card>
                    <CardContent className={isMobile ? "p-3 md:p-4" : "p-0"}>
                        {isMobile ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2.5 p-2 rounded-lg border border-border">
                                        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <Skeleton className="h-3 w-32" />
                                            <div className="flex items-center gap-1.5">
                                                <Skeleton className="h-2.5 w-16" />
                                                <Skeleton className="h-2.5 w-16" />
                                                <Skeleton className="h-2.5 w-12" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-2.5 w-20" />
                                                <Skeleton className="h-2.5 w-24" />
                                                <Skeleton className="h-2.5 w-16" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-8 w-8 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4 p-6">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-16 w-20" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">Mes annonces</h2>
                    <p className="text-muted-foreground">
                        {filteredProperties.length} annonce{filteredProperties.length > 1 ? "s" : ""}
                        {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? " trouvée(s)" : ""}
                    </p>
                </div>
                <Button onClick={handleCreateListing} variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle annonce
                </Button>
            </div>

            {/* Filtres et recherche */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Rechercher par titre..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)} 
                                    className="pl-10" 
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue>{getStatusDisplayLabel(statusFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="active">Actif</SelectItem>
                                <SelectItem value="draft">En attente de validation</SelectItem>
                                <SelectItem value="expired">Expiré</SelectItem>
                                <SelectItem value="archived">Archivé</SelectItem>
                                <SelectItem value="rejected">Rejeté</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue>{getTypeDisplayLabel(typeFilter)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="appartment">Appartement</SelectItem>
                                <SelectItem value="villa">Villa</SelectItem>
                                <SelectItem value="land">Terrain</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Tableau des annonces */}
            {filteredProperties.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? "Aucune annonce trouvée" : "Aucune annonce"}
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                                    ? "Essayez de modifier vos critères de recherche."
                                    : "Commencez par créer votre première annonce."}
                            </p>
                            <Button onClick={handleCreateListing} variant="hero">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer une annonce
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : isMobile ? (
                // Vue mobile avec cartes verticales
                <Card>
                    <CardContent className="p-3 md:p-4">
                        <div className="space-y-2">
                            {filteredProperties.map((property) => (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={getStatusRowClasses(property.status, true)}
                                >
                                    {/* Image */}
                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                        <ImageWithLoading src={getFirstImageUrlForCard(property)} alt={property.title} className="object-cover w-full h-full" />
                                        {isPropertyBoosted(property) && (
                                            <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-bl-lg rounded-tr-lg p-0.5">
                                                <Sparkles className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Informations */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-xs truncate group-hover:text-primary transition-colors">{property.title}</h4>
                                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                    {isPropertyBoosted(property) && (
                                                        <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                                                            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                                                            Boostée
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        {getPropertyTypeLabel(property.type)}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                        {getContractTypeLabel(property.contractType)}
                                                    </Badge>
                                                    <div className="[&>span]:text-[10px] [&>span]:px-1 [&>span]:py-0">{getStatusBadge(property.status)}</div>
                                                </div>
                                            </div>
                                            {/* Dropdown d'actions */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleView(property)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Voir
                                                    </DropdownMenuItem>
                                                    {property.status === "published" && (
                                                        <DropdownMenuItem onClick={() => handleBoost(property)}>
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Booster
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleEdit(property)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Modifier
                                                    </DropdownMenuItem>
                                                    {property.status === "expired" && (
                                                        <DropdownMenuItem onClick={() => handleReload(property)} disabled={reloadingPropertyId === property.id}>
                                                            <RefreshCw className={`h-4 w-4 mr-2 ${reloadingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                            {reloadingPropertyId === property.id ? "Relance..." : "Relancer"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {property.status === "rejected" && (
                                                        <DropdownMenuItem onClick={() => handleResubmit(property)} disabled={resubmittingPropertyId === property.id}>
                                                            <RefreshCw className={`h-4 w-4 mr-2 ${resubmittingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                            {resubmittingPropertyId === property.id ? "Soumission..." : "Soumettre à nouveau"}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleDelete(property)} className="text-destructive">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground flex-wrap">
                                            <span className="font-semibold text-foreground">{formatPriceOnly(property.price)}</span>
                                            {property.location && (
                                                <span className="flex items-center gap-0.5 truncate">
                                                    <MapPin className="h-2.5 w-2.5" />
                                                    <span className="truncate">{property.location}</span>
                                                </span>
                                            )}
                                            <span className="flex items-center gap-0.5">
                                                <Calendar className="h-2.5 w-2.5" />
                                                <span>{formatDate(property.date_created)}</span>
                                            </span>
                                        </div>
                                        {property.status === "expired" && (
                                            <div className="flex items-center justify-between gap-2 mt-2">
                                                <p className="text-[10px] text-orange-700 font-medium flex-1">
                                                    Veuillez relancer l'annonce dans les plus brefs délais sinon elle sera supprimée
                                                </p>
                                                <Button
                                                    onClick={() => handleReload(property)}
                                                    disabled={reloadingPropertyId === property.id}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800 flex-shrink-0"
                                                >
                                                    <RefreshCw className={`h-3 w-3 mr-1 ${reloadingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                    {reloadingPropertyId === property.id ? "Relance..." : "Relancer"}
                                                </Button>
                                            </div>
                                        )}
                                        {property.status === "rejected" && (
                                            <div className="flex items-center justify-between gap-2 mt-2">
                                                <div className="text-[10px] text-red-700 font-medium flex-1 whitespace-pre-line">
                                                    {property.notes && property.notes.length > 0 && property.notes[0].message ? (
                                                        <>
                                                            Votre annonce a été rejeté pour les raisons suivante : <strong>{property.notes[0].message}</strong>
                                                            {"\n"}
                                                            Veuillez effectuer les modification nécessaire et soumettre à nouveau l'annonce
                                                        </>
                                                    ) : (
                                                        "Votre annonce a été rejetée"
                                                    )}
                                                </div>
                                                <Button
                                                    onClick={() => handleResubmit(property)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 flex-shrink-0"
                                                >
                                                    <RefreshCw className="h-3 w-3 mr-1" />
                                                    Soumettre à nouveau
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                // Vue desktop avec tableau
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-20">Image</TableHead>
                                        <TableHead>Titre</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Prix</TableHead>
                                        <TableHead>Localisation</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="w-12">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProperties.map((property) => (
                                        <>
                                            <>
                                                <TableRow
                                                    key={property.id}
                                                    className={`${getStatusRowClasses(property.status, false)} ${
                                                        property.status === "expired" || property.status === "rejected" ? "border-b-0 [&>td]:border-b-0" : ""
                                                    }`}
                                                >
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted">
                                                            {property.images && property.images.length > 0 ? (
                                                                <Image src={getFirstImageUrl(property)} alt={property.title} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            {isPropertyBoosted(property) && (
                                                                <div className="absolute top-1 right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1 shadow-md">
                                                                    <Sparkles className="h-3 w-3 text-white" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className="font-medium line-clamp-1 flex-1">{property.title}</div>
                                                                {isPropertyBoosted(property) && (
                                                                    <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-2 py-0.5">
                                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                                        Boostée
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {getStatusBadge(property.status)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <span className="font-medium">{formatPriceOnly(property.price)}</span>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            <span>{property.location || "Non spécifié"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>{formatDate(property.date_created)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className={property.status === "expired" || property.status === "rejected" ? "border-b-0" : ""}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleView(property)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Voir
                                                                </DropdownMenuItem>
                                                                {property.status === "published" && (
                                                                    <DropdownMenuItem onClick={() => handleBoost(property)}>
                                                                        <Zap className="h-4 w-4 mr-2" />
                                                                        Booster
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleEdit(property)}>
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Modifier
                                                                </DropdownMenuItem>
                                                                {property.status === "expired" && (
                                                                    <DropdownMenuItem onClick={() => handleReload(property)} disabled={reloadingPropertyId === property.id}>
                                                                        <RefreshCw className={`h-4 w-4 mr-2 ${reloadingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                                        {reloadingPropertyId === property.id ? "Relance..." : "Relancer"}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                {property.status === "rejected" && (
                                                                    <DropdownMenuItem onClick={() => handleResubmit(property)} disabled={resubmittingPropertyId === property.id}>
                                                                        <RefreshCw className={`h-4 w-4 mr-2 ${resubmittingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                                        {resubmittingPropertyId === property.id ? "Soumission..." : "Soumettre à nouveau"}
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuItem onClick={() => handleDelete(property)} className="text-destructive">
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Supprimer
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                                {property.status === "expired" && (
                                                    <TableRow
                                                        key={`${property.id}-warning`}
                                                        className={`${getStatusRowClasses(property.status, false)} border-t-0 [&>td]:border-t-0`}
                                                    >
                                                        <TableCell className="p-0 border-t-0 border-b-0"></TableCell>
                                                        <TableCell colSpan={6} className="px-4 pt-0 pb-2 border-t-0 border-b-0">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <p className="text-xs text-orange-700 font-medium">
                                                                    Veuillez relancer l'annonce dans les plus brefs délais sinon elle sera supprimée
                                                                </p>
                                                                <Button
                                                                    onClick={() => handleReload(property)}
                                                                    disabled={reloadingPropertyId === property.id}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 hover:text-orange-800 flex-shrink-0"
                                                                >
                                                                    <RefreshCw className={`h-3 w-3 mr-1.5 ${reloadingPropertyId === property.id ? "animate-spin" : ""}`} />
                                                                    {reloadingPropertyId === property.id ? "Relance..." : "Relancer"}
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {property.status === "rejected" && (
                                                    <TableRow
                                                        key={`${property.id}-rejected`}
                                                        className={`${getStatusRowClasses(property.status, false)} border-t-0 [&>td]:border-t-0`}
                                                    >
                                                        <TableCell className="p-0 border-t-0 border-b-0"></TableCell>
                                                        <TableCell colSpan={6} className="px-4 pt-0 pb-2 border-t-0 border-b-0">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="text-xs text-red-700 font-medium whitespace-pre-line">
                                                                    {property.notes && property.notes.length > 0 && property.notes[0].message ? (
                                                                        <>
                                                                            Votre annonce a été rejeté pour les raisons suivante : <strong>{property.notes[0].message}</strong>
                                                                            {"\n"}
                                                                            Veuillez effectuer les modifications nécessaires et soumettre à nouveau l'annonce
                                                                        </>
                                                                    ) : (
                                                                        "Votre annonce a été rejetée"
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    onClick={() => handleResubmit(property)}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800 flex-shrink-0"
                                                                >
                                                                    <RefreshCw className="h-3 w-3 mr-1.5" />
                                                                    Soumettre à nouveau
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </>
                                        </>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Dialog de confirmation de suppression */}
            <AlertDialog
                open={deleteDialogOpen}
                onOpenChange={(open) => {
                    setDeleteDialogOpen(open);
                    if (!open) {
                        setPropertyToDelete(null);
                        // Nettoyage immédiat et agressif de pointer-events
                        const body = document.body;
                        body.style.pointerEvents = "";
                        body.style.removeProperty("pointer-events");

                        // Nettoyage supplémentaire avec délais multiples pour être sûr
                        setTimeout(() => {
                            body.style.pointerEvents = "";
                            body.style.removeProperty("pointer-events");
                        }, 50);

                        setTimeout(() => {
                            body.style.pointerEvents = "";
                            body.style.removeProperty("pointer-events");
                            console.log("[LISTINGS] Pointer-events cleaned after dialog close");
                        }, 200);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'annonce</AlertDialogTitle>
                        <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer l'annonce "{propertyToDelete?.title}" ? Cette action est irréversible.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                // Nettoyage immédiat quand on clique sur Annuler
                                const body = document.body;
                                body.style.pointerEvents = "";
                                body.style.removeProperty("pointer-events");
                                setDeleteDialogOpen(false);
                                setPropertyToDelete(null);
                            }}
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {isDeleting ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de confirmation de soumission à nouveau */}
            <AlertDialog
                open={resubmitDialogOpen}
                onOpenChange={(open) => {
                    setResubmitDialogOpen(open);
                    if (!open) {
                        setPropertyToResubmit(null);
                        setResubmittingPropertyId(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Soumettre à nouveau l'annonce</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir soumettre à nouveau l'annonce "{propertyToResubmit?.title}" ? L'annonce sera réexaminée par les modérateurs.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                setResubmitDialogOpen(false);
                                setPropertyToResubmit(null);
                            }}
                        >
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmResubmit} disabled={isResubmitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {isResubmitting ? "Soumission..." : "Soumettre à nouveau"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Modal de boost */}
            <BoostModal
                open={boostModalOpen}
                onOpenChange={(open) => {
                    setBoostModalOpen(open);
                    if (!open) {
                        setPropertyToBoost(null);
                    }
                }}
                propertyId={propertyToBoost?.id}
            />
        </div>
    );
}
