import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  DoorOpen, 
  Search, 
  Users, 
  Monitor, 
  Wifi, 
  Projector,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useSalles } from "@/hooks/useSalles";
import { Salle } from "@/api/salles/api";

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    standard: "Salle Standard",
    laboratoire: "Laboratoire",
    gymnase: "Gymnase",
    amphitheatre: "Amphithéâtre",
    atelier: "Atelier",
    informatique: "Informatique",
    musique: "Musique",
    arts: "Arts",
  };
  return labels[type] || type;
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    standard: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    laboratoire: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    gymnase: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
    amphitheatre: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    atelier: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    informatique: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
    musique: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    arts: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  };
  return colors[type] || "bg-muted text-muted-foreground";
};

const getEquipmentIcon = (equipement: string) => {
  if (equipement.includes("Ordinateur") || equipement.includes("Stations")) return <Monitor className="h-3 w-3" />;
  if (equipement.includes("Wifi")) return <Wifi className="h-3 w-3" />;
  if (equipement.includes("Vidéo") || equipement.includes("Projecteur")) return <Projector className="h-3 w-3" />;
  return null;
};

const SallesPersonnel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDisponibilite, setFilterDisponibilite] = useState<string>("all");

  const { salles: apiSalles, isLoading, error } = useSalles(
    filterType !== "all" ? { type_salle: filterType as any } : undefined
  );

  const salles = apiSalles;

  const filteredSalles = salles.filter((salle) => {
    const matchSearch = salle.nom_salle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (salle.batiment?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchType = filterType === "all" || salle.type_salle === filterType;
    const matchDispo = filterDisponibilite === "all" || 
                      (filterDisponibilite === "disponible" && salle.statut === "disponible") ||
                      (filterDisponibilite === "occupee" && salle.statut === "occupe");
    return matchSearch && matchType && matchDispo;
  });

  const stats = {
    total: salles.length,
    disponibles: salles.filter(s => s.statut === "disponible").length,
    occupees: salles.filter(s => s.statut === "occupe").length,
    capaciteTotale: salles.reduce((acc, s) => acc + s.capacite, 0),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Disponibilité des Salles</h2>
            <p className="text-muted-foreground">
              Consultez la disponibilité des salles en temps réel
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total salles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-green-600">Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-red-600">Occupées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{stats.occupees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Capacité totale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.capaciteTotale}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une salle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type de salle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="laboratoire">Laboratoire</SelectItem>
                  <SelectItem value="gymnase">Gymnase</SelectItem>
                  <SelectItem value="amphitheatre">Amphithéâtre</SelectItem>
                  <SelectItem value="atelier">Atelier</SelectItem>
                  <SelectItem value="informatique">Informatique</SelectItem>
                  <SelectItem value="musique">Musique</SelectItem>
                  <SelectItem value="arts">Arts</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDisponibilite} onValueChange={setFilterDisponibilite}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Disponibilité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="disponible">Disponibles</SelectItem>
                  <SelectItem value="occupee">Occupées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Grille des salles */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSalles.map((salle) => (
              <Card 
                key={salle.id}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  salle.statut === "disponible" 
                    ? "border-green-500/30 hover:border-green-500/50" 
                    : "border-red-500/30 hover:border-red-500/50"
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        salle.statut === "disponible" 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        <DoorOpen className={`h-5 w-5 ${
                          salle.statut === "disponible" ? "text-green-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{salle.nom_salle}</CardTitle>
                        <CardDescription>
                          {salle.batiment} {salle.etage !== undefined && `- Étage ${salle.etage}`}
                        </CardDescription>
                      </div>
                    </div>
                    {salle.statut === "disponible" ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Libre
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Occupée
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={getTypeColor(salle.type_salle)}>
                      {getTypeLabel(salle.type_salle)}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {salle.capacite} places
                    </div>
                  </div>

                  {/* Équipements */}
                  {salle.equipements && salle.equipements.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {salle.equipements.slice(0, 3).map((eq, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {getEquipmentIcon(eq)}
                          <span className="ml-1">{eq}</span>
                        </Badge>
                      ))}
                      {salle.equipements.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{salle.equipements.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredSalles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune salle trouvée avec ces critères</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SallesPersonnel;
