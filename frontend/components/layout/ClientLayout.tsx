"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { fetchMe } from "@/store/authSlice";
import Sidebar from "./Sidebar";
import { Search, Bell } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((s: RootState) => s.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("talentai_token");
    if (token && !user) {
      dispatch(fetchMe());
    } else if (!token && !PUBLIC_PATHS.includes(pathname)) {
      router.push("/login");
    }
  }, [dispatch, user, pathname, router]);

  const isPublic = PUBLIC_PATHS.includes(pathname);
  if (isPublic) return <>{children}</>;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--surface-raised)" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((prev) => !prev)}
      />

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
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-slate-200" />

            {/* User avatar */}
            <div className="flex items-center gap-2.5 pl-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #0284c7)" }}
                aria-hidden
              >
                {initials}
              </div>
              {user && (
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold leading-none" style={{ color: "var(--text-primary)" }}>
                    {user.name}
                  </p>
                  <p className="text-xs mt-0.5 leading-none" style={{ color: "var(--text-muted)" }}>
                    {user.role || "Recruiter"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ────────────────────────────────────────────────────── */}
        <main className="flex-1 p-8 overflow-auto animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
