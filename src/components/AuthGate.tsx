"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function AuthLoading({ message = "Verificando sesión…" }: { message?: string }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-base font-bold"
        style={{
          background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
          color: "#F4C430",
          fontFamily: "Fraunces, serif",
        }}
      >
        TN
      </div>
      <p className="text-sm font-semibold" style={{ color: "#8BA3C7" }}>
        {message}
      </p>
      <span className="h-2 w-2 rounded-full animate-pulse-live" style={{ background: "#3B8FE8" }} />
    </div>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/acceso";

  useEffect(() => {
    if (initializing) return;

    if (!isLoginPage && !user) {
      router.replace("/acceso");
      return;
    }

    if (isLoginPage && user) {
      router.replace("/");
    }
  }, [initializing, user, isLoginPage, router]);

  if (initializing) {
    return <AuthLoading />;
  }

  if (isLoginPage) {
    return user ? <AuthLoading message="Entrando a TravelNet…" /> : children;
  }

  if (!user) {
    return <AuthLoading message="Redirigiendo al inicio de sesión…" />;
  }

  return children;
}
