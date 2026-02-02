export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  titre: string;
  message: string;
  lue: boolean;
  date_envoi: string;
  utilisateur_id: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}