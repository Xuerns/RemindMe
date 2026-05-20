"use client";
 
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Bell,
  BarChart3,
  User,
  Settings,
  LogOut,
} from "lucide-react";
 
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];
 
export default function Sidebar() {
  const pathname = usePathname();
 
  return (
    <aside className="w-[220px] min-h-screen bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Brand */}
      <div className="px-6 pt-7 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
            <Bell className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-800 leading-tight tracking-tight">
              RemindMe
            </p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              Manage Subscriptions
            </p>
          </div>
        </div>
      </div>
 
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors
                  ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {label}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </Link>
          );
        })}
      </nav>
 
      {/* Logout */}
      <div className="px-3 pb-6 border-t border-slate-100 pt-3">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 w-full group">
          <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" strokeWidth={2} />
          Logout
        </button>
      </div>
    </aside>
  );
}