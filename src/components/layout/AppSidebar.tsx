import { useState } from "react";
import {
  Calendar,
  BookOpen,
  Bell,
  Building2,
  LayoutDashboard,
  Users,
  Settings,
  GraduationCap,
  UserCog,
  DoorOpen,
  LogOut,
  ChevronDown,
  FileText
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
  roles?: UserRole[];
}

const navigationGroups: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
      { title: "Notifications", url: "/etudiant/notifications", icon: Bell },
    ],
  },
  {
    label: "Mon Espace Étudiant",
    roles: ["admin", "etudiant"],
    items: [
      { title: "Emploi du temps", url: "/etudiant/emploi-temps", icon: Calendar, roles: ["admin", "etudiant"] },
      { title: "Mes cours", url: "/etudiant/cours", icon: BookOpen, roles: ["admin", "etudiant"] },
      { title: "Mes absences", url: "/etudiant/absences", icon: FileText, roles: ["admin", "etudiant"] },
    ],
  },
  {
    label: "Mon Espace Enseignant",
    roles: ["admin", "enseignant"],
    items: [
      { title: "Mon emploi du temps", url: "/enseignant/emploi-temps", icon: Calendar, roles: ["admin", "enseignant"] },
      { title: "Mes cours", url: "/enseignant/cours", icon: BookOpen, roles: ["admin", "enseignant"] },
      { title: "Gestion absences", url: "/enseignant/absences", icon: UserCog, roles: ["admin", "enseignant"] },
      { title: "Mes rattrapages", url: "/enseignant/rattrapages", icon: Calendar, roles: ["admin", "enseignant"] },
    ],
  },
  {
    label: "Pédagogie",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    items: [
      { title: "Classes", url: "/gestion/classes", icon: GraduationCap, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Enseignants", url: "/gestion/teachers", icon: UserCog, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Matières", url: "/gestion/matieres", icon: BookOpen, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Emplois du temps", url: "/gestion/emplois-temps", icon: Calendar, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Rattrapages", url: "/gestion/rattrapages", icon: Calendar, roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"] },
    ],
  },
  {
    label: "Ressources",
    roles: ["admin", "directeur", "responsable_pedagogique", "personnel"],
    items: [
      { title: "Salles", url: "/gestion/salles", icon: DoorOpen, roles: ["admin", "directeur", "responsable_pedagogique", "personnel"] },
    ],
  },
  {
    label: "Administration",
    roles: ["admin", "directeur"],
    items: [
      { title: "Établissements", url: "/gestion/etablissements", icon: Building2, roles: ["admin", "directeur"] },
      { title: "Utilisateurs", url: "/admin/utilisateurs", icon: Users, roles: ["admin", "directeur"] },
      { title: "Paramètres", url: "/gestion/settings", icon: Settings, roles: ["admin", "directeur"] },
    ],
  },
];

const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    admin: "Administrateur",
    directeur: "Directeur",
    responsable_pedagogique: "Resp. Pédagogique",
    enseignant: "Enseignant",
    etudiant: "Étudiant",
    personnel: "Personnel",
  };
  return labels[role] || role;
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  const hasAccess = (roles?: UserRole[]) => {
    if (!roles || !user) return true;
    return roles.includes(user.role);
  };

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const getInitials = () => {
    if (!user) return "?";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">EDT Manager</span>
              <span className="text-xs text-sidebar-foreground/60">Gestion emploi du temps</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {navigationGroups.map((group) => {
          if (!hasAccess(group.roles)) return null;

          const visibleItems = group.items.filter(item => hasAccess(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.url)}
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <NavLink
                          to={item.url}
                          end
                          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          <div className="relative">
                            <item.icon className="h-4 w-4 shrink-0" />
                            {collapsed && item.url.includes("notifications") && unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
                              </span>
                            )}
                          </div>
                          {!collapsed && <span>{item.title}</span>}
                          {!collapsed && item.url.includes("notifications") && unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto px-1.5 py-0 h-5 min-w-5 flex items-center justify-center text-[10px] font-bold">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </Badge>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

    </Sidebar>
  );
}
