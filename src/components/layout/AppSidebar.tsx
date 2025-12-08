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
  ChevronDown
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";

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
    ],
  },
  {
    label: "Étudiant",
    roles: ["admin", "etudiant"],
    items: [
      { title: "Emploi du temps", url: "/etudiant/emploi-temps", icon: Calendar, roles: ["admin", "etudiant"] },
      { title: "Mes cours", url: "/etudiant/cours", icon: BookOpen, roles: ["admin", "etudiant"] },
      { title: "Notifications", url: "/etudiant/notifications", icon: Bell, roles: ["admin", "etudiant"] },
    ],
  },
  {
    label: "Personnel",
    roles: ["admin", "personnel"],
    items: [
      { title: "Emplois du temps", url: "/personnel/emplois-temps", icon: Calendar, roles: ["admin", "personnel"] },
      { title: "Disponibilité salles", url: "/personnel/salles", icon: DoorOpen, roles: ["admin", "personnel"] },
    ],
  },
  {
    label: "Enseignant",
    roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"],
    items: [
      { title: "Mon emploi du temps", url: "/enseignant/emploi-temps", icon: Calendar, roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"] },
      { title: "Mes cours", url: "/enseignant/cours", icon: BookOpen, roles: ["admin", "directeur", "responsable_pedagogique", "enseignant"] },
    ],
  },
  {
    label: "Gestion",
    roles: ["admin", "directeur", "responsable_pedagogique"],
    items: [
      { title: "Établissements", url: "/gestion/etablissements", icon: Building2, roles: ["admin", "directeur"] },
      { title: "Classes", url: "/gestion/classes", icon: GraduationCap, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Enseignants", url: "/gestion/enseignants", icon: UserCog, roles: ["admin", "directeur", "responsable_pedagogique"] },
      { title: "Salles", url: "/gestion/salles", icon: DoorOpen, roles: ["admin", "directeur", "responsable_pedagogique"] },
    ],
  },
  {
    label: "Administration",
    roles: ["admin"],
    items: [
      { title: "Utilisateurs", url: "/admin/utilisateurs", icon: Users, roles: ["admin"] },
      { title: "Paramètres", url: "/admin/parametres", icon: Settings, roles: ["admin"] },
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
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary-foreground" />
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
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.title}</span>}
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  {getRoleLabel(user.role)}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="shrink-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
