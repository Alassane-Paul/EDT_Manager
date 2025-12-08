import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  AlertCircle
} from "lucide-react";
import { useState } from "react";

interface Salle {
  id: number;
  nom: string;
  capacite: number;
  batiment: string;
  etage: number;
  type: "cours" | "tp" | "amphi" | "labo";
  equipements: string[];
  disponible: boolean;
  coursActuel?: {
    matiere: string;
    enseignant: string;
    heureFin: string;
  };
  prochainCours?: {
    matiere: string;
    heureDebut: string;
  };
}

// Données de démonstration
const mockSalles: Salle[] = [
  {
    id: 1,
    nom: "A101",
    capacite: 40,
    batiment: "Bâtiment A",
    etage: 1,
    type: "cours",
    equipements: ["Vidéoprojecteur", "Wifi", "Tableau blanc"],
    disponible: true,
  },
  {
    id: 2,
    nom: "A102",
    capacite: 35,
    batiment: "Bâtiment A",
    etage: 1,
    type: "cours",
    equipements: ["Vidéoprojecteur", "Wifi"],
    disponible: false,
    coursActuel: {
      matiere: "Anglais",
      enseignant: "Mme Wilson",
      heureFin: "10:00",
    },
    prochainCours: {
      matiere: "Communication",
      heureDebut: "10:15",
    },
  },
  {
    id: 3,
    nom: "B201",
    capacite: 30,
    batiment: "Bâtiment B",
    etage: 2,
    type: "cours",
    equipements: ["Vidéoprojecteur", "Wifi", "Climatisation"],
    disponible: true,
    prochainCours: {
      matiere: "Économie",
      heureDebut: "14:00",
    },
  },
  {
    id: 4,
    nom: "C301",
    capacite: 25,
    batiment: "Bâtiment C",
    etage: 3,
    type: "tp",
    equipements: ["Ordinateurs", "Vidéoprojecteur", "Wifi"],
    disponible: false,
    coursActuel: {
      matiere: "Informatique",
      enseignant: "M. Bernard",
      heureFin: "12:00",
    },
  },
  {
    id: 5,
    nom: "C302",
    capacite: 25,
    batiment: "Bâtiment C",
    etage: 3,
    type: "tp",
    equipements: ["Ordinateurs", "Vidéoprojecteur", "Wifi"],
    disponible: true,
  },
  {
    id: 6,
    nom: "Amphi 1",
    capacite: 200,
    batiment: "Bâtiment Principal",
    etage: 0,
    type: "amphi",
    equipements: ["Vidéoprojecteur", "Wifi", "Microphone", "Sonorisation"],
    disponible: true,
  },
  {
    id: 7,
    nom: "Labo IA",
    capacite: 20,
    batiment: "Bâtiment C",
    etage: 4,
    type: "labo",
    equipements: ["Serveurs GPU", "Stations de travail", "Wifi"],
    disponible: false,
    coursActuel: {
      matiere: "Deep Learning",
      enseignant: "M. Bernard",
      heureFin: "17:00",
    },
  },
  {
    id: 8,
    nom: "B102",
    capacite: 45,
    batiment: "Bâtiment B",
    etage: 1,
    type: "cours",
    equipements: ["Vidéoprojecteur", "Wifi", "Tableau interactif"],
    disponible: true,
  },
];

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    cours: "Salle de cours",
    tp: "Salle TP",
    amphi: "Amphithéâtre",
    labo: "Laboratoire",
  };
  return labels[type] || type;
};

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    cours: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    tp: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    amphi: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    labo: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  };
  return colors[type] || "bg-gray-100 text-gray-700";
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

  const filteredSalles = mockSalles.filter((salle) => {
    const matchSearch = salle.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       salle.batiment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "all" || salle.type === filterType;
    const matchDispo = filterDisponibilite === "all" || 
                      (filterDisponibilite === "disponible" && salle.disponible) ||
                      (filterDisponibilite === "occupee" && !salle.disponible);
    return matchSearch && matchType && matchDispo;
  });

  const stats = {
    total: mockSalles.length,
    disponibles: mockSalles.filter(s => s.disponible).length,
    occupees: mockSalles.filter(s => !s.disponible).length,
    capaciteTotale: mockSalles.reduce((acc, s) => acc + s.capacite, 0),
  };

  return (
    <PageLayout title="Disponibilité des Salles">
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
                  <SelectItem value="cours">Salle de cours</SelectItem>
                  <SelectItem value="tp">Salle TP</SelectItem>
                  <SelectItem value="amphi">Amphithéâtre</SelectItem>
                  <SelectItem value="labo">Laboratoire</SelectItem>
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

        {/* Grille des salles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSalles.map((salle) => (
            <Card 
              key={salle.id}
              className={`overflow-hidden transition-all hover:shadow-lg ${
                salle.disponible 
                  ? "border-green-500/30 hover:border-green-500/50" 
                  : "border-red-500/30 hover:border-red-500/50"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      salle.disponible 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}>
                      <DoorOpen className={`h-5 w-5 ${
                        salle.disponible ? "text-green-600" : "text-red-600"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{salle.nom}</CardTitle>
                      <CardDescription>{salle.batiment} - Étage {salle.etage}</CardDescription>
                    </div>
                  </div>
                  {salle.disponible ? (
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
                  <Badge variant="outline" className={getTypeColor(salle.type)}>
                    {getTypeLabel(salle.type)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {salle.capacite} places
                  </div>
                </div>

                {/* Équipements */}
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

                {/* Cours actuel ou prochain */}
                {salle.coursActuel && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                    <p className="font-medium text-red-700 dark:text-red-300">En cours:</p>
                    <p className="text-red-600 dark:text-red-400">{salle.coursActuel.matiere}</p>
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <Clock className="h-3 w-3" />
                      Jusqu'à {salle.coursActuel.heureFin}
                    </div>
                  </div>
                )}
                
                {salle.prochainCours && !salle.coursActuel && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                    <p className="font-medium text-yellow-700 dark:text-yellow-300">Prochain cours:</p>
                    <p className="text-yellow-600 dark:text-yellow-400">{salle.prochainCours.matiere}</p>
                    <div className="flex items-center gap-1 text-xs text-yellow-500">
                      <Clock className="h-3 w-3" />
                      À {salle.prochainCours.heureDebut}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSalles.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <DoorOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune salle trouvée avec ces critères</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
};

export default SallesPersonnel;
