import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRattrapages, useRattrapageActions } from "@/hooks/useRattrapages";
import { useMesCours } from "@/hooks/useCours";
import { Clock, Calendar, CheckCircle, AlertTriangle, XCircle, Plus, Timer, FileText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { STATUT_COLORS, STATUT_LABELS } from "@/utils/rattrapageUtils";

export default function RattrapagesEnseignant() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCoursId, setSelectedCoursId] = useState("");
    const [duree, setDuree] = useState("90"); // minutes
    const [motif, setMotif] = useState("");
    const [type, setType] = useState("cours_annule");

    const { rattrapages, isLoading } = useRattrapages();
    const { createRattrapage, isCreating } = useRattrapageActions();
    const { cours: mesCours } = useMesCours();

    const handleCreate = () => {
        if (!selectedCoursId) return;

        createRattrapage({
            cours_id: selectedCoursId,
            type_rattrapage: type,
            duree: parseInt(duree),
            eleves_concernes: ["TOUTE_LA_CLASSE"], // Par défaut
            motif: motif,
            periode_souhaitee_debut: format(new Date(), "yyyy-MM-dd"),
            periode_souhaitee_fin: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
        }, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setMotif("");
                setSelectedCoursId("");
                setDuree("90");
            }
        });
    };

    const getStatusBadge = (statut: string) => {
        return (
            <Badge className={STATUT_COLORS[statut] || "bg-gray-500"}>
                {STATUT_LABELS[statut] || statut}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Gestion des Rattrapages</h1>
                        <p className="text-muted-foreground">Demandez et suivez vos séances de rattrapage</p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle Demande
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Demander un rattrapage</DialogTitle>
                                <DialogDescription>
                                    Remplissez le formulaire pour soumettre une demande de session supplémentaire.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Cours concerné</Label>
                                    <Select value={selectedCoursId} onValueChange={setSelectedCoursId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un cours" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mesCours?.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.matiere_nom} - {c.classe_nom}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={type} onValueChange={setType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="cours_annule">Cours annulé</SelectItem>
                                                <SelectItem value="soutien">Soutien</SelectItem>
                                                <SelectItem value="preparation_examen">Préparation examen</SelectItem>
                                                <SelectItem value="tutorat">Tutorat</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Durée (minutes)</Label>
                                        <Input
                                            type="number"
                                            value={duree}
                                            onChange={e => setDuree(e.target.value)}
                                            min="30"
                                            step="30"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Motif / Justification</Label>
                                    <Textarea
                                        placeholder="Pourquoi ce rattrapage est-il nécessaire ?"
                                        value={motif}
                                        onChange={e => setMotif(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleCreate} disabled={!selectedCoursId || isCreating}>
                                    {isCreating ? "Envoi..." : "Envoyer la demande"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Stats Rapides */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Demandes en attente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {rattrapages?.filter(r => r.statut === 'demande').length || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Séances planifiées</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {rattrapages?.filter(r => r.statut === 'planifie').length || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Heures rattrapées (Total)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {rattrapages?.filter(r => r.statut === 'realise')
                                    .reduce((acc, curr) => acc + (curr.duree / 60), 0).toFixed(1) || "0.0"} h
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Historique des demandes</CardTitle>
                        <CardDescription>Liste de toutes vos demandes de rattrapage et leur statut.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-4">Chargement...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date demande</TableHead>
                                        <TableHead>Cours</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Durée</TableHead>
                                        <TableHead>Statut</TableHead>
                                        <TableHead>Créneau Planifié</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rattrapages?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                Aucune demande de rattrapage trouvée.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rattrapages?.map((rattrapage) => (
                                            <TableRow key={rattrapage.id}>
                                                <TableCell>
                                                    {format(new Date(rattrapage.date_demande), "dd/MM/yyyy", { locale: fr })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{rattrapage.cours?.matiere.nom_matiere}</div>
                                                    <div className="text-xs text-muted-foreground">{rattrapage.cours?.classe.nom_classe}</div>
                                                </TableCell>
                                                <TableCell><Badge variant="outline">{rattrapage.type_rattrapage}</Badge></TableCell>
                                                <TableCell>{rattrapage.duree} min</TableCell>
                                                <TableCell>{getStatusBadge(rattrapage.statut)}</TableCell>
                                                <TableCell>
                                                    {rattrapage.creneau_planifie ? (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar className="h-4 w-4 text-blue-500" />
                                                            {format(new Date(rattrapage.creneau_planifie.date_debut), "dd/MM/yyyy HH:mm", { locale: fr })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Non planifié</span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
