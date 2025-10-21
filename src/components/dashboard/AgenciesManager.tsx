import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, Search, MapPin, Phone, Mail, Users, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Agency } from "@/lib/directus-api";
import { toast } from "@/lib/toast-helpers";
import CreateAgencyModal from "./CreateAgencyModal";

export default function AgenciesManager() {
    const { authData } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [agencies, setAgencies] = useState<Agency[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        loadAgencies();
    }, [authData]);

    const loadAgencies = async () => {
        if (!authData?.access_token) return;

        setLoading(true);
        try {
            const response = await fetch("/api/agencies", {
                headers: {
                    Authorization: `Bearer ${authData.access_token}`,
                },
            });

            const result = await response.json();

            if (result.success) {
                setAgencies(result.agencies || []);
            } else {
                toast.error("Erreur", {
                    description: result.error || "Impossible de charger les agences",
                });
            }
        } catch (error) {
            console.error("Error loading agencies:", error);
            toast.error("Erreur", {
                description: "Une erreur est survenue lors du chargement des agences",
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
        const contact = agency.address.contacts?.find((c) => c.type === type);
        return contact?.value || "-";
    };

    const handleAddAgency = () => {
        setShowCreateModal(true);
    };

    const handleAgencyCreated = () => {
        toast.success("Agence créée", {
            description: "L'agence a été créée avec succès",
        });
        loadAgencies();
    };

    const handleEditAgency = (agencyId: string) => {
        // TODO: Implémenter l'édition d'agence
        toast.info("Fonctionnalité à venir", {
            description: "L'édition d'agence sera bientôt disponible",
        });
    };

    const handleDeleteAgency = (agencyId: string) => {
        // TODO: Implémenter la suppression d'agence
        toast.info("Fonctionnalité à venir", {
            description: "La suppression d'agence sera bientôt disponible",
        });
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
                                                <div className="space-y-1">
                                                    <div className="font-medium">{agency.title}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{getAgencyLocation(agency)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{getAgencyContact(agency, "phone")}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        <span>{getAgencyContact(agency, "email")}</span>
                                                    </div>
                                                </div>
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
            <CreateAgencyModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={handleAgencyCreated} />
        </motion.div>
    );
}
