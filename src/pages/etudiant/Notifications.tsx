import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Clock,
  X,
  Check
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  type: "info" | "warning" | "success" | "change";
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Données de démonstration
const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "change",
    title: "Changement de salle",
    message: "Le cours de Mathématiques de demain a été déplacé en salle B102 au lieu de A101.",
    date: "Il y a 2 heures",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    title: "Cours annulé",
    message: "Le cours d'Économie du mardi 15 janvier est annulé. Un rattrapage sera programmé.",
    date: "Il y a 5 heures",
    read: false,
  },
  {
    id: 3,
    type: "info",
    title: "Nouvel emploi du temps",
    message: "Un nouvel emploi du temps est disponible pour le semestre 2. Consultez-le dans la section EDT.",
    date: "Hier",
    read: false,
  },
  {
    id: 4,
    type: "success",
    title: "Rattrapage programmé",
    message: "Le rattrapage du cours de Physique est programmé le samedi 20 janvier de 10h à 12h en salle A201.",
    date: "Il y a 2 jours",
    read: true,
  },
  {
    id: 5,
    type: "change",
    title: "Changement d'horaire",
    message: "Le cours d'Anglais du vendredi passe de 08h00-10h00 à 10h15-12h15.",
    date: "Il y a 3 jours",
    read: true,
  },
  {
    id: 6,
    type: "info",
    title: "Examens de fin de semestre",
    message: "Les dates des examens de fin de semestre sont disponibles. Consultez le calendrier académique.",
    date: "Il y a 1 semaine",
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "change":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    default:
      return <Info className="h-5 w-5 text-primary" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "warning":
      return <Badge variant="destructive">Urgent</Badge>;
    case "success":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmé</Badge>;
    case "change":
      return <Badge variant="secondary">Modification</Badge>;
    default:
      return <Badge variant="outline">Info</Badge>;
  }
};

const NotificationsEtudiant = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "changes") return n.type === "change" || n.type === "warning";
    return true;
  });

  return (
    <PageLayout title="Notifications">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                </Badge>
              )}
            </h2>
            <p className="text-muted-foreground">
              Restez informé des changements et mises à jour
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Non lues ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="changes">
              Modifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`transition-all ${
                      !notification.read 
                        ? "border-primary/50 bg-primary/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">
                              {notification.title}
                            </h4>
                            {getNotificationBadge(notification.type)}
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {notification.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => markAsRead(notification.id)}
                              title="Marquer comme lu"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteNotification(notification.id)}
                            title="Supprimer"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune notification</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default NotificationsEtudiant;
