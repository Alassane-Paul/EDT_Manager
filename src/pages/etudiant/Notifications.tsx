import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
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
  Check,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning":
    case "error":
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    default:
      return <Info className="h-5 w-5 text-primary" />;
  }
};

const getNotificationBadge = (type: string) => {
  switch (type) {
    case "warning":
    case "error":
      return <Badge variant="destructive">Urgent</Badge>;
    case "success":
      return <Badge className="bg-green-500 hover:bg-green-600">Confirmé</Badge>;
    default:
      return <Badge variant="outline">Info</Badge>;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "À l'instant";
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR');
};

const NotificationsEtudiant = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { 
    notifications: apiNotifications, 
    unreadCount: apiUnreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const notifications = apiNotifications;
  const unreadCount = apiUnreadCount;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.lu;
    if (activeTab === "changes") return n.type === "warning" || n.type === "error";
    return true;
  });

  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDelete = (id: string) => {
    deleteNotification(id);
  };

  return (
    <AppLayout>
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
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Tout marquer comme lu
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Tabs */}
        {!isLoading && (
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
                        !notification.lu 
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
                                {notification.titre}
                              </h4>
                              {getNotificationBadge(notification.type)}
                              {!notification.lu && (
                                <span className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatDate(notification.date_creation)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!notification.lu && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleMarkAsRead(notification.id)}
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(notification.id)}
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
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsEtudiant;
