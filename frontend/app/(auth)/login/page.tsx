"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { login } from "@/store/authSlice";
import { Brain, Loader2, Sparkles, Zap, Users, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: Brain,    title: "Gemini AI Analysis",    desc: "Deep candidate ranking with evidence-backed insights" },
  { icon: Zap,      title: "Automated Screening",   desc: "Pre-score every candidate in seconds, not hours" },
  { icon: Users,    title: "Talent Pool Management", desc: "Import PDF resumes, CSV batches, or add manually" },
  { icon: BarChart3, title: "Decision Workspace",    desc: "Shortlists with scores, strengths, gaps & interview questions" },
];

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login(form));
    if (login.fulfilled.match(result)) router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-10" style={{ background: "var(--surface-raised)" }}>
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1e40af, #0284c7)" }}
            >
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <p
                className="text-base font-bold leading-tight"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
              >
                TalentAI
              </p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>AI Recruiting Platform</p>
            </div>
          </div>

          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Sign in to your recruiter account
          </p>

          {error && (
            <div
              className="mb-5 p-3 rounded-xl text-sm"
              style={{ background: "var(--error-light)", border: "1px solid var(--error-border)", color: "var(--error)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="recruiter@company.com"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                Password
              </label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all mt-2"
              style={loading ? { background: "#e2e8f0", color: "#94a3b8" } : { background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign in
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--text-secondary)" }}>
            No account?{" "}
            <Link href="/signup" className="font-semibold transition-colors" style={{ color: "var(--accent)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
