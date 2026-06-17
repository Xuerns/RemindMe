"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  ChevronRight,
  X,
  Menu,
  History,
} from "lucide-react";

/* ══════════════════════════════════════════
   Navigation Config
   ══════════════════════════════════════════ */
const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Profile", href: "/profile", icon: User },
  { label: "History", href:  "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

const MOBILE_BP = 768;
const TABLET_BP = 1024;

export default function Sidebar() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const[unreadCount,setUnreadCount] = useState(0);

  const sidebarRef = useRef<HTMLElement>(null);

  /* ── Responsive ── */
  useEffect(() => {
    setMounted(true);
    const check = () => {
      const w = window.innerWidth;
      const mobile = w < MOBILE_BP;
      setIsMobile(mobile);
      if (w >= MOBILE_BP && w < TABLET_BP) setIsOpen(false);
      if (!mobile) setIsMobileOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Close mobile on navigate ── */
  useEffect(() => {
    if (isMobile) setIsMobileOpen(false);
  }, [pathname, isMobile]);

  /* ── Outside click ── */
  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node))
        setIsMobileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobileOpen]);

  /* ── Escape key ── */
  useEffect(() => {
    if (!isMobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isMobileOpen]);

  /* ── Body scroll lock ── */
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileOpen]);

  useEffect(() => {
  const fetchUnread = async () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("id");
    if (!token || !userId) return;
    try {
      const res = await fetch(`/api/notifications/unread/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.length);
      }
    } catch {}
  };
  fetchUnread();
  const interval = setInterval(fetchUnread, 10000); 
  return () => clearInterval(interval); 
}, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsMobileOpen((o) => !o);
    } else {
      setIsOpen((o) => !o);
    }
  }, [isMobile]);

  const toggleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  if (!mounted) return null;

  const expanded = isMobile ? true : isOpen;
  const sidebarW = expanded ? "w-[260px]" : "w-[72px]";

  return (
    <>
      {/* ══════ Mobile hamburger ══════ */}
      {isMobile && !isMobileOpen && (
        <button
          id="sidebar-mobile-toggle"
          onClick={toggle}
          className="fixed top-4 left-4 z-[60]
                     w-10 h-10 rounded-xl
                     bg-white border border-gray-200
                     flex items-center justify-center
                     text-on-surface-variant shadow-sm
                     transition-all duration-200
                     hover:scale-105 active:scale-95"
          aria-label="Open navigation"
        >
          <Menu size={18} strokeWidth={2} />
        </button>
      )}

      {/* ══════ Mobile backdrop ══════ */}
      {isMobile && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className={`fixed inset-0 z-[70] bg-black/40
                      transition-opacity duration-300
                      ${isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        />
      )}

      {/* ══════════════════════════════════════════
          SIDEBAR
         ══════════════════════════════════════════ */}
      <aside
        ref={sidebarRef}
        id="sidebar-nav"
        className={`
          ${isMobile
            ? `fixed top-0 left-0 z-[80] h-full w-[280px]
               transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
               ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
            : `sticky top-0 h-screen ${sidebarW}
               transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`
          }
          flex flex-col shrink-0 overflow-hidden
          bg-white border-r border-gray-100
        `}
      >
        {/* ══════ Header / Logo ══════ */}
        <div className={`
          flex items-center justify-between shrink-0
          border-b border-gray-100
          ${expanded ? "px-4 py-4" : "px-0 justify-center py-4"}
          transition-all duration-300
        `}>
          {/* Logo + brand — HIDDEN when collapsed */}
          {expanded && (
            <div className="flex items-center gap-2.5 sb-fade-text">
              {/* Logo icon */}
              <div className="sb-logo-icon relative w-9 h-9 rounded-xl
                              flex items-center justify-center shrink-0
                              shadow-md">
                <Bell className="w-[18px] h-[18px] text-white relative z-10" strokeWidth={2.5} />
              </div>

              {/* Brand text */}
              <div className="overflow-hidden">
                <p className="text-[15px] font-bold text-on-surface leading-tight tracking-tight whitespace-nowrap m-0">
                  RemindMe
                </p>
                <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase whitespace-nowrap mt-0.5 m-0">
                  Subscription Tracker
                </p>
              </div>
            </div>
          )}

          {/* Toggle / Close button */}
          {isMobile && isMobileOpen ? (
            <button
              onClick={toggle}
              className="shrink-0 w-8 h-8 rounded-lg
                         flex items-center justify-center
                         text-gray-400 hover:text-on-surface hover:bg-gray-50
                         transition-all duration-200 active:scale-90"
              aria-label="Close menu"
            >
              <X size={16} strokeWidth={2} />
            </button>
          ) : !isMobile ? (
            <button
              id="sidebar-collapse-toggle"
              onClick={toggle}
              className={`shrink-0 w-8 h-8 rounded-lg
                         flex items-center justify-center
                         text-gray-400 hover:text-on-surface hover:bg-gray-50
                         border border-gray-200
                         transition-all duration-200
                         ${!expanded ? "mx-auto" : ""}`}
              title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <ChevronRight
                size={14}
                strokeWidth={2}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          ) : null}
        </div>

        {/* ══════ Navigation ══════ */}
        <nav className={`
          flex-1 overflow-y-auto overflow-x-hidden sb-scrollbar py-3
          ${expanded ? "px-2.5" : "px-2"}
        `}>
          {/* Section label */}
          {expanded && (
            <p className="sb-fade-text text-[9px] font-bold tracking-[2.5px] text-gray-300
                          uppercase px-2.5 pb-2.5 m-0">
              Menu Utama
            </p>
          )}

          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <div key={href} className="sb-tooltip-wrap">
                <Link
                  href={href}
                  id={`nav-${label.toLowerCase()}`}
                  onClick={async () => {
                     if (label === "Notifications") {
                     setUnreadCount(0);
                     const token = localStorage.getItem("token");
                     const userId = localStorage.getItem("id");
                     await fetch(`/api/notifications/read/all/${userId}`, {
                       method: "PUT",
                       headers: { Authorization: `Bearer ${token}` },
                     });
                    }
                  }}
                  className={`
                    sb-menu-item flex items-center gap-3 rounded-xl
                    text-[13px] font-medium relative mb-0.5
                    transition-all duration-200
                    ${expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
                    ${active
                      ? "sb-active-link text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }
                  `}
                >
                  {/* Active gradient bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2
                                     w-[3px] h-5 rounded-r-full bg-white/80 sb-active-bar" />
                  )}

                  <span className="shrink-0 w-[18px] flex items-center justify-center">
                    <Icon
                      className={`w-[18px] h-[18px] transition-all duration-200
                        ${active ? "text-white" : "text-gray-400"}`}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                     {label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                     )}
                  </span>

                  {expanded && (
                    <span className="sb-fade-text flex-1 whitespace-nowrap overflow-hidden">
                      {label}
                    </span>
                  )}

                  {active && expanded && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white sb-active-dot" />
                  )}
                </Link>

                {/* Tooltip (collapsed only) */}
                {!expanded && <span className="sb-tooltip">{label}</span>}
              </div>
            );
          })}
        </nav>

        {/* ══════ Footer ══════ */}
        <div className={`border-t border-gray-100 shrink-0
                         ${expanded ? "px-2.5 pt-2 pb-4" : "px-2 pt-2 pb-4"}`}>
          {expanded && (
            <p className="sb-fade-text text-[10px] text-gray-300 px-3 pb-2 whitespace-nowrap m-0">
              RemindMe · v1.0.0
            </p>
          )}

          <div className="sb-tooltip-wrap">
            <button
              id="sidebar-logout-btn"
              onClick={toggleLogout}
              className={`
                w-full flex items-center gap-3 rounded-xl
                text-[13px] font-medium
                text-gray-400 border border-transparent
                transition-all duration-200
                hover:bg-red-50 hover:text-red-500 hover:border-red-100
                ${expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
              `}
            >
              <span className="shrink-0 w-[18px] flex items-center justify-center">
                <LogOut size={16} strokeWidth={1.8} />
              </span>
              {expanded && (
                <span className="sb-fade-text whitespace-nowrap">Keluar</span>
              )}
            </button>
            {!expanded && <span className="sb-tooltip">Keluar</span>}
          </div>
        </div>
      </aside>
    </>
  );
}