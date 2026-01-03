import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursApi } from "@/api/cours/api";
import { ressourcesApi, RessourceCours } from "@/api/ressources/api";
import { seancesVirtuellesApi, SeanceVirtuelle } from "@/api/seancesVirtuelles/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Plus, Loader2, FileText, Video, Link as LinkIcon, Calendar } from "lucide-react";

export default function CourseManager() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedCours, setSelectedCours] = useState<string>("");
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

    // Fetch teacher's courses
    const { data: coursData } = useQuery({
        queryKey: ["mes-cours"],
        queryFn: () => coursApi.getMesCours()
    });

    // Fetch resources for selected course
    const { data: ressourcesData, isLoading: ressourcesLoading } = useQuery({
        queryKey: ["ressources", selectedCours],
        queryFn: () => ressourcesApi.getByCours(selectedCours),
        enabled: !!selectedCours
    });

    // Fetch virtual sessions for selected course
    const { data: seancesData } = useQuery({
        queryKey: ["seances", selectedCours],
        queryFn: () => seancesVirtuellesApi.getByCours(selectedCours),
        enabled: !!selectedCours
    });

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: ressourcesApi.upload,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ressources"] });
            toast({ title: "Succès", description: "Ressource ajoutée" });
            setUploadDialogOpen(false);
        },
        onError: () => {
            toast({ title: "Erreur", description: "Échec de l'upload", variant: "destructive" });
        }
    });

    // Delete resource mutation
    const deleteMutation = useMutation({
        mutationFn: ressourcesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ressources"] });
            toast({ title: "Supprimé", description: "Ressource supprimée" });
        }
    });

    // Create session mutation
    const createSessionMutation = useMutation({
        mutationFn: seancesVirtuellesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["seances"] });
            toast({ title: "Programmé", description: "Séance virtuelle créée" });
            setSessionDialogOpen(false);
        }
    });

    const handleFileUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('cours_id', selectedCours);
        uploadMutation.mutate(formData);
    };

    const handleSessionCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createSessionMutation.mutate({
            cours_id: selectedCours,
            titre: formData.get('titre') as string,
            date_debut: formData.get('date_debut') as string,
            date_fin: formData.get('date_fin') as string,
            lien_visio: formData.get('lien_visio') as string
        });
    };

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Gestion de Contenu</h1>
                    <p className="text-muted-foreground">Ajoutez des ressources et programmez des cours en ligne.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sélectionner un cours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedCours} onValueChange={setSelectedCours}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Choisir un cours" />
                            </SelectTrigger>
                            <SelectContent>
                                {coursData?.map((cours: any) => (
                                    <SelectItem key={cours.id} value={cours.id}>
                                        {cours.matiere?.nom_matiere || 'Matière'} - {cours.classe?.nom_classe || 'Classe'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedCours && (
                    <Tabs defaultValue="ressources" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="ressources">Ressources</TabsTrigger>
                            <TabsTrigger value="sessions">Séances Virtuelles</TabsTrigger>
                        </TabsList>

                        <TabsContent value="ressources" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Documents et Fichiers</h2>
                                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Ajouter une ressource
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Uploader un fichier</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleFileUpload} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="titre">Titre</Label>
                                                <Input id="titre" name="titre" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea id="description" name="description" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fichier">Fichier</Label>
                                                <Input id="fichier" name="fichier" type="file" required />
                                            </div>
                                            <Button type="submit" disabled={uploadMutation.isPending} className="w-full">
                                                {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Uploader
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Card>
                                <CardContent className="pt-6">
                                    {ressourcesLoading ? (
                                        <div className="flex justify-center p-8">
                                            <Loader2 className="animate-spin h-6 w-6" />
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Titre</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {ressourcesData?.ressources.map((ressource: RessourceCours) => (
                                                    <TableRow key={ressource.id}>
                                                        <TableCell>
                                                            {ressource.type === 'PDF' && <FileText className="h-4 w-4" />}
                                                            {ressource.type === 'VIDEO' && <Video className="h-4 w-4" />}
                                                            {ressource.type === 'LIEN' && <LinkIcon className="h-4 w-4" />}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{ressource.titre}</TableCell>
                                                        <TableCell>{new Date(ressource.date_ajout).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-right">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteMutation.mutate(ressource.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {ressourcesData?.ressources.length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                            Aucune ressource ajoutée.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="sessions" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Cours en Ligne</h2>
                                <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Programmer une séance
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Nouvelle séance virtuelle</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSessionCreate} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="titre">Titre</Label>
                                                <Input id="titre" name="titre" defaultValue="Cours en ligne" required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="date_debut">Début</Label>
                                                    <Input id="date_debut" name="date_debut" type="datetime-local" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="date_fin">Fin</Label>
                                                    <Input id="date_fin" name="date_fin" type="datetime-local" required />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lien_visio">Lien Visio (Meet/Zoom)</Label>
                                                <Input id="lien_visio" name="lien_visio" type="url" placeholder="https://meet.google.com/..." required />
                                            </div>
                                            <Button type="submit" disabled={createSessionMutation.isPending} className="w-full">
                                                {createSessionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Créer
                                            </Button>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Card>
                                <CardContent className="pt-6">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Titre</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Lien</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {seancesData?.seances.map((seance: SeanceVirtuelle) => (
                                                <TableRow key={seance.id}>
                                                    <TableCell className="font-medium">{seance.titre}</TableCell>
                                                    <TableCell>{new Date(seance.date_debut).toLocaleString()}</TableCell>
                                                    <TableCell>
                                                        <a href={seance.lien_visio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                            Rejoindre
                                                        </a>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                                            {seance.statut}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => seancesVirtuellesApi.delete(seance.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {seancesData?.seances.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                        Aucune séance programmée.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
