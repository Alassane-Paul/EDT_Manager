export interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "error";
  titre: string;
  message: string;
  lu: boolean;
  date_creation: string;
  utilisateur_id: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  non_lues: number;
}