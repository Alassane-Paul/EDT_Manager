import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/api/notifications/api";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { playNotificationSound } from "@/utils/notificationSound";

export function useNotifications() {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.getAll,
    // refetchInterval: 30000, // No longer needed with sockets
  });

  const unreadCount = data?.unreadCount || 0;
  const notificationsList = data?.data || [];

  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", (notification: any) => {
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      // Play notification sound
      playNotificationSound();

      // Show toast
      toast({
        title: notification.titre,
        description: notification.message,
        action: notification.lien_action ? (
          <button onClick={() => window.location.href = notification.lien_action}>
            Voir
          </button>
        ) : undefined,
      });
    });

    return () => {
      socket.off("notification:new");
    };
  }, [socket, queryClient]);

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors du marquage de la notification", variant: "destructive" });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Succès", description: "Toutes les notifications ont été marquées comme lues" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors du marquage des notifications", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Succès", description: "Notification supprimée" });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  return {
    notifications: notificationsList,
    total: data?.pagination?.total || 0,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
  };
}


