"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { register } from "@/store/authSlice";
import { Brain, Loader2, Sparkles } from "lucide-react";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error } = useSelector((s: RootState) => s.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(register(form));
    if (register.fulfilled.match(result)) router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--surface-raised)" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #1e40af, #2563eb)" }}
          >
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p
              className="font-bold text-lg leading-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
            >
              TalentAI
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>AI Recruiting Platform</p>
          </div>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Create your account
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Start screening candidates with AI
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
                Full name
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Jane Smith"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
              />
            </div>
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
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
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
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
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
              Create account
            </button>
          </form>

          {/* AI badge */}
          <div
            className="flex items-center justify-center gap-1.5 mt-5 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <Sparkles className="w-3 h-3" style={{ color: "var(--ai)" }} />
            Powered by Gemini 2.0 Flash
          </div>
        </div>

        <p className="text-sm text-center mt-5" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
