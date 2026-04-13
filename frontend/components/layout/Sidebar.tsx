"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { logout } from "@/store/authSlice";
import {
  LayoutDashboard, Briefcase, Users, Zap, BarChart3, Upload, LogOut, Brain,
} from "lucide-react";

/*
 * Palette: deep navy base (#0e1e40) with a subtle gradient for depth.
 * Text uses blue-300 (#93c5fd) for inactive — harmonises with the bg
 * rather than clashing like pure white or disappearing like grey.
 */
const S = {
  bg:           "linear-gradient(180deg, #0a1628 0%, #0e2047 100%)",
  border:       "rgba(59,130,246,0.15)",
  /* active */
  activeBg:     "rgba(255,255,255,0.10)",
  activeBar:    "#3b82f6",          /* blue-500 — pops cleanly on dark navy  */
  activeText:   "#ffffff",
  /* inactive */
  inactiveText: "#93c5fd",          /* blue-300 — tinted, not harsh white    */
  hoverBg:      "rgba(255,255,255,0.06)",
  hoverText:    "#bfdbfe",          /* blue-200                              */
  /* structure */
  sectionLabel: "#3b82f6",          /* blue-500 — vivid section headers      */
  sub:          "#60a5fa",          /* blue-400 — tagline under logo         */
  logoBg:       "rgba(59,130,246,0.25)",
  badge:        { bg: "rgba(59,130,246,0.20)", text: "#93c5fd" },
  footer:       "#60a5fa",          /* blue-400                              */
  footerHover:  "#bfdbfe",
};

const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Recruitment",
    items: [
      { href: "/jobs",              label: "Jobs",             icon: Briefcase },
      { href: "/candidates",        label: "Candidates",       icon: Users     },
      { href: "/candidates/upload", label: "Import Candidates", icon: Upload   },
    ],
  },
  {
    label: "AI Engine",
    items: [
      { href: "/screening", label: "Run Screening", icon: Zap,      badge: "AI" },
      { href: "/results",   label: "Results",       icon: BarChart3             },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  return (
    <aside
      className="fixed inset-y-0 left-0 w-60 flex flex-col z-30 select-none"
      style={{ background: S.bg, borderRight: `1px solid ${S.border}` }}
    >
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${S.border}` }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: S.logoBg, border: "1px solid rgba(59,130,246,0.3)" }}
        >
          <Brain className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }} />
        </div>
        <div>
          <p
            className="font-bold text-sm leading-tight text-white tracking-tight"
            style={{ fontFamily: "var(--font-display, system-ui)" }}
          >
            TalentAI
          </p>
          <p className="text-xs leading-tight mt-0.5" style={{ color: S.sub }}>
            AI Recruiting Platform
          </p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_SECTIONS.map(({ label, items }) => (
          <div key={label}>
            <p
              className="text-xs font-bold px-3 mb-1.5 tracking-widest uppercase"
              style={{ color: S.sectionLabel }}
            >
              {label}
            </p>
            <div className="space-y-0.5">
              {items.map(({ href, label: itemLabel, icon: Icon, badge }: {
                href: string; label: string; icon: React.ElementType; badge?: string;
              }) => {
                const active =
                  pathname === href ||
                  (href !== "/" && pathname.startsWith(href));

                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-lg text-sm font-medium transition-all"
                    style={{
                      padding: "8px 12px 8px 10px",
                      borderLeft: `2px solid ${active ? S.activeBar : "transparent"}`,
                      background: active ? S.activeBg : "transparent",
                      color: active ? S.activeText : S.inactiveText,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = S.hoverBg;
                        e.currentTarget.style.color = S.hoverText;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = S.inactiveText;
                      }
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="flex-1 truncate">{itemLabel}</span>
                    {badge && (
                      <span
                        className="font-bold rounded-full"
                        style={{
                          background: S.badge.bg,
                          color: S.badge.text,
                          fontSize: "9px",
                          padding: "2px 6px",
                          letterSpacing: "0.06em",
                          border: "1px solid rgba(59,130,246,0.25)",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div
        className="px-3 pb-4 pt-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${S.border}` }}
      >
        <button
          onClick={() => {
            dispatch(logout());
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium w-full transition-all text-left"
          style={{ color: S.footer }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = S.hoverBg;
            e.currentTarget.style.color = S.footerHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = S.footer;
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
