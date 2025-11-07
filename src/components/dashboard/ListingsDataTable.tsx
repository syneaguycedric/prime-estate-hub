import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Pencil, Trash2, MoreHorizontal, Plus, Calendar, MapPin } from "lucide-react";
import { Property } from "@/data/properties";
import { getFirstImageUrl, formatPriceOnly } from "@/lib/property-helpers";
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
import { deleteProperty } from "@/lib/directus-api";
import { useAuth } from "@/contexts/AuthContext";

interface ListingsDataTableProps {
    properties: Property[];
    loading: boolean;
    onRefresh: () => void;
}

export default function ListingsDataTable({ properties, loading, onRefresh }: ListingsDataTableProps) {
    const router = useRouter();
    const { authData, refreshUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Nettoyage global des pointer-events au montage
    useEffect(() => {
        const body = document.body;
        if (body.style.pointerEvents === "none") {
            body.style.pointerEvents = "";
            body.style.removeProperty("pointer-events");
            console.log("[LISTINGS] Global pointer-events cleanup on mount");
        }
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
                statusFilter === "all" || (statusFilter === "active" && property.status === "published") || (statusFilter === "inactive" && property.status === "draft");

            const matchesType = typeFilter === "all" || property.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [properties, searchQuery, statusFilter, typeFilter]);

    const handleView = (property: Property) => {
        router.push(`/biens/${property.id}`);
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                        Actif
                    </Badge>
                );
            case "draft":
                return <Badge variant="secondary">Brouillon</Badge>;
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Aujourd'hui";
        if (diffInDays === 1) return "Hier";
        if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
        return date.toLocaleDateString("fr-FR");
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
                    <CardContent className="p-0">
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
                                <Input placeholder="Rechercher par titre..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                <SelectItem value="active">Actif</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Type" />
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
            ) : (
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
                                        <TableRow key={property.id} className="hover:bg-muted/50">
                                            <TableCell>
                                                <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-muted">
                                                    {property.images && property.images.length > 0 ? (
                                                        <Image src={getFirstImageUrl(property)} alt={property.title} fill className="object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium line-clamp-1">{property.title}</div>
                                                    {getStatusBadge(property.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{getTypeLabel(property.type)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{formatPriceOnly(property.price)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{property.location || "Non spécifié"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span>{formatDate(property.date_created)}</span>
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
                                                        <DropdownMenuItem onClick={() => handleView(property)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Voir
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(property)}>
                                                            <Pencil className="h-4 w-4 mr-2" />
                                                            Modifier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDelete(property)} className="text-destructive">
                                                            <Trash2 className="h-4 w-4 mr-2" />
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
        </div>
    );
}
