import { useEmploiTempsAll } from "@/hooks/useEmploiTemps";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Eye, Trash2, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmploiTempsActions } from "@/hooks/useEmploiTemps";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { EmploiTempsListItem } from "@/types/emploi-temps";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    brouillon: "secondary",
    valide: "outline",
    publie: "default",
    archive: "destructive",
};

export default function EmploiTempsList() {
    const { emploisTemps, isLoading } = useEmploiTempsAll();
    const navigate = useNavigate();
    const { deleteEmploiTemps } = useEmploiTempsActions();
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const handleDelete = (id: string) => {
        deleteEmploiTemps(id);
        setIdToDelete(null);
    };

    const getStatusBadge = (status: string) => {
        return (
            <Badge variant={STATUS_COLORS[status] || "default"} className="capitalize">
                {status}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Emplois du temps</h2>
                        <p className="text-muted-foreground">
                            Gérez les emplois du temps de l'établissement
                        </p>
                    </div>
                    <Button onClick={() => navigate("/gestion/emplois-temps/new")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des emplois du temps</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">Chargement...</div>
                        ) : emploisTemps.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Aucun emploi du temps trouvé
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Classe</TableHead>
                                        <TableHead>Période</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Qualité</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emploisTemps.map((et: EmploiTempsListItem) => (
                                        <TableRow key={et.id}>
                                            <TableCell className="font-medium">{et.nom_version}</TableCell>
                                            <TableCell>{et.classe?.nom_classe}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(et.periode_debut).toLocaleDateString()} -{" "}
                                                    {new Date(et.periode_fin).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(et.statut)}</TableCell>
                                            <TableCell>
                                                {et.score_qualite ? `${et.score_qualite.toFixed(0)}%` : "-"}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/gestion/emplois-temps/${et.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon">
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setIdToDelete(et.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <ConfirmDialog
                    open={!!idToDelete}
                    onOpenChange={(open) => !open && setIdToDelete(null)}
                    onConfirm={() => idToDelete && handleDelete(idToDelete)}
                    title="Supprimer l'emploi du temps"
                    description="Êtes-vous sûr de vouloir supprimer définitivement cet emploi du temps ? Cette action est irréversible."
                    confirmText="Supprimer"
                    cancelText="Annuler"
                    variant="destructive"
                />
            </div>
        </AppLayout>
    );
}
