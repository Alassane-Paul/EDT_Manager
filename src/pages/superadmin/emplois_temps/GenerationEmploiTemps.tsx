import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClasses } from "@/hooks/useClasses";
import { AlertCircle, ArrowLeft, Wand2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GenerationParams } from "@/types/emploi-temps";
import { GenerationProgressDialog } from "@/components/emploi-temps/GenerationProgressDialog";
import { emploiTempsApi } from "@/api/emploi-temps/api";
import { toast } from "sonner";

export default function GenerationEmploiTemps() {
    const navigate = useNavigate();
    const { classes } = useClasses();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generatingEmploiTempsId, setGeneratingEmploiTempsId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<GenerationParams>>({
        mode_generation: "equilibre",
        parametres_generation: {
            pause_dejeuner_debut: "12:00",
            pause_dejeuner_fin: "14:00",
            jours_ouvrables: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
            duree_creneau_minutes: 60,
            max_cours_journalier: 8
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classe_id || !formData.periode_debut || !formData.periode_fin) {
            toast.error("Veuillez remplir tous les champs obligatoires");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await emploiTempsApi.genererEmploiTemps({
                classe_id: formData.classe_id,
                nom_version: formData.nom_version || `Génération du ${new Date().toLocaleDateString()}`,
                periode_debut: formData.periode_debut,
                periode_fin: formData.periode_fin,
                mode_generation: formData.mode_generation as any,
                parametres_generation: {
                    pause_dejeuner_debut: "12:00",
                    pause_dejeuner_fin: "14:00",
                    jours_ouvrables: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
                    duree_creneau_minutes: 90,
                    max_cours_journalier: 6
                },
                commentaires: formData.commentaires
            });

            // Ouvrir le dialog de progression
            setGeneratingEmploiTempsId(response.emploi_temps.id);
            toast.success("Génération démarrée !");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erreur lors du démarrage de la génération");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8 p-4 md:p-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Générer un emploi du temps</h1>
                        <p className="text-muted-foreground">
                            L'assistant IA va générer un emploi du temps optimisé pour votre établissement
                        </p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <Alert className="bg-primary/5 border-primary/20">
                        <AlertCircle className="h-4 w-4 text-primary" />
                        <AlertTitle>Assistant de Génération IA</AlertTitle>
                        <AlertDescription>
                            La génération peut prendre quelques secondes. Notre algorithme prendra en compte les disponibilités des enseignants,
                            les capacités des salles et les contraintes pédagogiques pour créer le meilleur planning possible.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration de la génération</CardTitle>
                            <CardDescription>Définissez les paramètres de base pour cet emploi du temps</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Classe cible *</Label>
                                        <Select
                                            onValueChange={(value) => setFormData({ ...formData, classe_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une classe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes?.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.nom_classe} ({c.niveau})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Nom de la version *</Label>
                                        <Input
                                            placeholder="Ex: Semestre 1 - V1"
                                            value={formData.nom_version || ""}
                                            onChange={(e) => setFormData({ ...formData, nom_version: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Date de début *</Label>
                                            <Input
                                                type="date"
                                                onChange={(e) => setFormData({ ...formData, periode_debut: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Date de fin *</Label>
                                            <Input
                                                type="date"
                                                onChange={(e) => setFormData({ ...formData, periode_fin: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Mode d'optimisation</Label>
                                        <Select
                                            defaultValue="equilibre"
                                            onValueChange={(value) => setFormData({ ...formData, mode_generation: value as any })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="rapide">Rapide (CSP)</SelectItem>
                                                <SelectItem value="equilibre">Équilibré (Génétique)</SelectItem>
                                                <SelectItem value="optimal">Optimal (Génétique +)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Commentaires / Contraintes particulières</Label>
                                        <Input
                                            placeholder="Notes optionnelles pour l'IA..."
                                            value={formData.commentaires || ""}
                                            onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" className="w-full py-6 text-lg font-semibold" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Démarrage de la génération...
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="mr-2 h-5 w-5" />
                                                Lancer l'assistant de génération
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <GenerationProgressDialog
                emploiTempsId={generatingEmploiTempsId}
                open={!!generatingEmploiTempsId}
                onClose={() => setGeneratingEmploiTempsId(null)}
            />
        </AppLayout>
    );
}
