"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { fetchMe } from "@/store/authSlice";
import Sidebar from "./Sidebar";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useSelector((s: RootState) => s.auth);

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto">{children}</main>
    </div>
  );
}
