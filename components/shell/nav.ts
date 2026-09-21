import {
  CalendarDays,
  Handshake,
  Home,
  KanbanSquare,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "matches" };

export const NAV_MAIN: NavItem[] = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/properties", label: "İlanlar", icon: Home },
  { href: "/clients", label: "Müşteriler", icon: Users },
  { href: "/matches", label: "Eşleşmeler", icon: Handshake, badge: "matches" },
];

export const NAV_WORK: NavItem[] = [
  { href: "/pipeline", label: "Satış Hunisi", icon: KanbanSquare },
  { href: "/appointments", label: "Randevular", icon: CalendarDays },
];

export const NAV_BOTTOM: NavItem[] = [{ href: "/settings", label: "Ayarlar", icon: Settings }];

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
