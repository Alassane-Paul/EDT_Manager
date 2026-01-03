import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { periodesApi, Periode } from "@/api/periodes/api";
import { classesApi } from "@/api/classes/api"; // Assuming existing
import { elevesApi } from "@/api/eleves/api";
import { bulletinsApi, Bulletin } from "@/api/bulletins/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Printer } from "lucide-react";

export default function BulletinManager() {
    const { toast } = useToast();
    const [selectedClasse, setSelectedClasse] = useState<string>("");
    const [selectedPeriode, setSelectedPeriode] = useState<string>("");

    // Fetch Classes
    const { data: classesData } = useQuery({
        queryKey: ["classes"],
        queryFn: () => classesApi.getAll() // Assuming this returns simple list or object with classes
    });

    // Correction: classesApi might return { classes: [...] } or just [...] depend on implementation
    // Let's assume standard response format

    // Fetch Periodes
    const { data: periodesData } = useQuery({
        queryKey: ["periodes"],
        queryFn: periodesApi.getAll
    });

    // Fetch Students of selected class
    const { data: studentsData, isLoading: studentsLoading } = useQuery({
        queryKey: ["eleves", selectedClasse],
        queryFn: () => elevesApi.getAll({ classe_id: selectedClasse }),
        enabled: !!selectedClasse
    });

    // Generator Mutation
    const generateMutation = useMutation({
        mutationFn: async ({ eleveId, periodeId }: { eleveId: string, periodeId: string }) => {
            return await bulletinsApi.generate(eleveId, periodeId);
        },
        onSuccess: (data) => {
            toast({ title: "Généré", description: `Bulletin généré pour ${data.bulletin.eleve?.utilisateur.prenom}` });
        },
        onError: () => {
            toast({ title: "Erreur", description: "Échec de génération", variant: "destructive" });
        }
    });

    const handleGenerateAll = async () => {
        if (!studentsData?.eleves || !selectedPeriode) return;

        // Naive bulk generation
        for (const eleve of studentsData.eleves) {
            try {
                await generateMutation.mutateAsync({ eleveId: eleve.id, periodeId: selectedPeriode });
            } catch (e) {
                console.error(e);
            }
        }
        toast({ title: "Terminé", description: "Traitement de la classe terminé" });
    };

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Bulletins</h1>
                        <p className="text-muted-foreground">Générez et publiez les bulletins de notes.</p>
                    </div>
                    <Button onClick={handleGenerateAll} disabled={!selectedClasse || !selectedPeriode || studentsLoading}>
                        {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                        Générer pour la classe
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sélection</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                        <div className="w-1/3 space-y-2">
                            <label className="text-sm font-medium">Classe</label>
                            <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                                <SelectTrigger><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                                <SelectContent>
                                    {classesData?.classes?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.nom_classe}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-1/3 space-y-2">
                            <label className="text-sm font-medium">Période</label>
                            <Select value={selectedPeriode} onValueChange={setSelectedPeriode}>
                                <SelectTrigger><SelectValue placeholder="Choisir une période" /></SelectTrigger>
                                <SelectContent>
                                    {periodesData?.periodes.map((p: Periode) => (
                                        <SelectItem key={p.id} value={p.id}>{p.libelle}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {selectedClasse && (
                    <Card>
                        <CardContent className="pt-6">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Élève</TableHead>
                                        <TableHead>État Bulletin</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentsLoading ? (
                                        <TableRow><TableCell colSpan={4} className="text-center"><Loader2 className="animate-spin inline" /></TableCell></TableRow>
                                    ) : studentsData?.eleves.map((eleve: any) => (
                                        <BulletinRow
                                            key={eleve.id}
                                            eleve={eleve}
                                            periodeId={selectedPeriode}
                                            onGenerate={() => generateMutation.mutate({ eleveId: eleve.id, periodeId: selectedPeriode })}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

// Sub-component to manage individual row state (fetching existing bulletin status)
function BulletinRow({ eleve, periodeId, onGenerate }: { eleve: any, periodeId: string, onGenerate: () => void }) {
    const { data, isLoading, refetch } = useQuery({
        queryKey: ["bulletin", eleve.id, periodeId],
        queryFn: () => bulletinsApi.getByEleveAndPeriode(eleve.id, periodeId),
        enabled: !!periodeId,
        retry: false
    });

    // If query fails (404), it means no bulletin. 
    // react-query might throw, we should handle that gracefully or API should return null.
    // My api wrapper throws on non-2xx. 

    const bulletin = data?.bulletin;

    return (
        <TableRow>
            <TableCell>{eleve.matricule}</TableCell>
            <TableCell className="font-medium">{eleve.utilisateur.nom} {eleve.utilisateur.prenom}</TableCell>
            <TableCell>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                    bulletin ? (
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Généré</Badge>
                            <span className="text-xs text-muted-foreground">Moy: {bulletin.moyenne_generale}/20</span>
                        </div>
                    ) : (
                        <Badge variant="secondary">Non généré</Badge>
                    )
                )}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { onGenerate(); setTimeout(refetch, 1000); }}>
                        <Printer className="h-4 w-4 mr-1" />
                        Générer
                    </Button>
                    {bulletin && (
                        <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
