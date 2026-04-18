"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { fetchMe } from "@/store/authSlice";
import Sidebar from "./Sidebar";
import { ScreeningNotifications, ScreeningBadge } from "@/components/ScreeningNotifications";
import { Search, Bell } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((s: RootState) => s.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = localStorage.getItem("talentai_token");
    if (token && !user) {
      dispatch(fetchMe());
    } else if (!token && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/login");
    }
  }, [dispatch, user, pathname, router]);

  const isPublic = PUBLIC_PATHS.includes(pathname);
  
  // Only render conditionally after mounting to avoid hydration mismatch
  if (isMounted && isPublic) return <>{children}</>;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--surface-raised)", ["--sidebar-width" as any]: sidebarCollapsed ? "72px" : "240px" }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((p) => !p)} />

      {/* Right column: topbar + content */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin] duration-300"
        style={{ marginLeft: sidebarCollapsed ? "72px" : "240px" }}
      >
        {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
        <header
          className="h-14 flex items-center px-6 gap-4 sticky top-0 z-20"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search jobs, candidates…"
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg transition-all focus:outline-none"
              style={{
                background: "var(--surface-inset)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15,103,255,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Notifications button */}
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(247, 251, 255, 0.78))",
                backdropFilter: "blur(14px)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-sm)",
              }}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
              <ScreeningBadge />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200" />

            {/* User section */}
            <div className="flex items-center gap-2.5">
              {/* Avatar */}
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: "linear-gradient(140deg, #0f67ff, #0c8f8f 62%, #ff9b3f)" }}
                aria-hidden
              >
                {initials}
              </div>

              {/* User info (hidden on mobile) */}
              {user && (
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-xs leading-none" style={{ color: "var(--text-muted)" }}>
                    {user.role || "Recruiter"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {/* Full-width content with decorative background */}
          <div className="relative min-h-screen overflow-hidden bg-white">
            {/* Main content */}
            <div className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl p-3 sm:p-5 lg:p-6" style={{ background: "rgba(255, 255, 255, 0.95)" }}>
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Global screening notifications — renders at root, z-[9999] */}
      <ScreeningNotifications />
    </div>
  );
}
