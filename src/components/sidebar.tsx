import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, User, Bot, History, BarChart3, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Dashboard" },
  { to: "/dashboard/profile", icon: User, label: "Profile" },
  { to: "/dashboard/companions", icon: Bot, label: "Companions" },
  { to: "/dashboard/sessions", icon: History, label: "Sessions" },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/pricing", icon: CreditCard, label: "Subscription" },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();

  return (
    <aside className={cn("fixed left-0 top-0 z-40 h-screen border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed ? (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">A</div>
              <span className="text-lg font-semibold">AI LMS</span>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">A</div>
            </Link>
          )}
        </div>
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <button onClick={onToggle} className={cn("w-full flex items-center rounded-lg px-3 py-2 text-sm hover:bg-accent", collapsed && "justify-center")}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>}
          </button>
        </div>
      </div>
    </aside>
  );
}
