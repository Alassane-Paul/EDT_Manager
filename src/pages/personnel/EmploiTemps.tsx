import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Users, Search, Filter, ChevronLeft, ChevronRight, Download, Printer } from "lucide-react";
import { useState } from "react";

const joursSemaine = ["lundi", "mardi", "mercredi", "jeudi", "vendredi"];
const joursAffichage = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

const getSubjectColor = (matiere: string) => {
  const colors: Record<string, string> = {
    "Mathématiques": "bg-blue-100 border-blue-300 dark:bg-blue-900/30 dark:border-blue-700",
    "Physique": "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700",
    "Informatique": "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700",
    "Anglais": "bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700",
    "Économie": "bg-orange-100 border-orange-300 dark:bg-orange-900/30 dark:border-orange-700",
    "Data Science": "bg-cyan-100 border-cyan-300 dark:bg-cyan-900/30 dark:border-cyan-700",
    "Machine Learning": "bg-pink-100 border-pink-300 dark:bg-pink-900/30 dark:border-pink-700",
    "Deep Learning": "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700",
    "Base de données": "bg-teal-100 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700",
    "Réseaux": "bg-indigo-100 border-indigo-300 dark:bg-indigo-900/30 dark:border-indigo-700",
    "Analyse": "bg-lime-100 border-lime-300 dark:bg-lime-900/30 dark:border-lime-700",
    "Probabilités": "bg-amber-100 border-amber-300 dark:bg-amber-900/30 dark:border-amber-700",
  };
  return colors[matiere] || "bg-gray-100 border-gray-300 dark:bg-gray-800/50 dark:border-gray-700";
};

const EmploiTempsPersonnel = () => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [viewType, setViewType] = useState<"classe" | "enseignant">("classe");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  const getWeekDates = (offset: number) => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1 + (offset * 7));
    
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    
    return {
      start: monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      end: friday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
    };
  };

  const weekDates = getWeekDates(selectedWeek);

  return (
    <PageLayout title="Emplois du Temps">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Consultation des Emplois du Temps</h2>
            <p className="text-muted-foreground">
              Visualisez les plannings par classe ou par enseignant
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Message info */}
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            Les données d'emploi du temps seront disponibles via l'API
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default EmploiTempsPersonnel;
