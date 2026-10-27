"use client"; /* Logo */ /* Desktop Nav */ /* Departments Dropdown */ /* Mobile menu button */ /* Mobile Menu */

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useViewNavigation } from "../context/NavigationContext";
import { useCatalog } from "../hooks/useCatalog";
import { pathnameToViewType } from "../navigation";

export default function Navbar() {
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useViewNavigation();
  const pathname = usePathname();
  const currentViewType = pathnameToViewType(pathname);
  const departments = useCatalog();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDeptMenuOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (type: string) => currentViewType === type;

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(5, 13, 40, 0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(26,111,196,0.2)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {}
        <button
          onClick={() => navigate({ type: "home" })}
          className="flex items-center gap-2.5 group"
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)" }}
          >
            <span style={{ color: "#F4C430", fontFamily: "Fraunces, serif" }}>TN</span>
          </div>
          <div className="leading-tight">
            <div
              className="font-bold text-base tracking-tight"
              style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
            >
              TravelNet
            </div>
            <div className="text-xs" style={{ color: "#8BA3C7" }}>
              Tu Ventana al Turismo
            </div>
          </div>
        </button>

        {}
        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => navigate({ type: "home" })}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              color: isActive("home") ? "#F4C430" : "#8BA3C7",
              background: isActive("home") ? "rgba(244,196,48,0.08)" : "transparent",
            }}
          >
            Inicio
          </button>

          {}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setDeptMenuOpen(!deptMenuOpen)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                color: isActive("department") || isActive("site") ? "#F4C430" : "#8BA3C7",
                background:
                  isActive("department") || isActive("site") || deptMenuOpen
                    ? "rgba(244,196,48,0.08)"
                    : "transparent",
              }}
            >
              Departamentos
              <svg
                className="w-3.5 h-3.5 transition-transform"
                style={{
                  transform: deptMenuOpen ? "rotate(180deg)" : "rotate(0)",
                }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {deptMenuOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-56 rounded-xl overflow-hidden animate-fade-in"
                style={{
                  background: "#0A1A42",
                  border: "1px solid rgba(26,111,196,0.25)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                }}
              >
                <div className="p-1.5">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      onClick={() => {
                        navigate({ type: "department", departmentId: dept.id });
                        setDeptMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between"
                      style={{ color: "#F0F6FF" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(26,111,196,0.15)";
                        (e.currentTarget as HTMLElement).style.color = "#F4C430";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#F0F6FF";
                      }}
                    >
                      <span>{dept.name}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "rgba(26,111,196,0.2)",
                          color: "#3B8FE8",
                        }}
                      >
                        {dept.sites.length} sitios
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate({ type: "live" })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              color: isActive("live") ? "#E53E3E" : "#8BA3C7",
              background: isActive("live") ? "rgba(229,62,62,0.08)" : "transparent",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse-live"
              style={{ background: "#E53E3E" }}
            />
            En Vivo
          </button>

          <button
            onClick={() => navigate({ type: "reviews" })}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{
              color: isActive("reviews") ? "#27AE60" : "#8BA3C7",
              background: isActive("reviews") ? "rgba(39,174,96,0.08)" : "transparent",
            }}
          >
            Reseñas
          </button>

          {(user?.role === "collaborator" || user?.role === "admin") && (
            <button
              onClick={() => navigate({ type: "collaborator" })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                color: isActive("collaborator") ? "#27AE60" : "#8BA3C7",
                background: isActive("collaborator") ? "rgba(39,174,96,0.08)" : "transparent",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: "#27AE60" }} />
              Transmitir
            </button>
          )}

          {user ? (
            <div ref={accountRef} className="relative ml-1">
              <button
                onClick={() => setAccountOpen((open) => !open)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold"
                style={{
                  background: accountOpen ? "rgba(26,111,196,0.14)" : "transparent",
                  color: "#F0F6FF",
                }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(26,111,196,0.3)",
                    color: "#F4C430",
                  }}
                >
                  {user.fullName
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <span className="max-w-28 truncate">{user.fullName.split(" ")[0]}</span>
                <svg
                  className="h-3.5 w-3.5"
                  style={{
                    transform: accountOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {accountOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl animate-fade-in"
                  style={{
                    background: "#0A1A42",
                    border: "1px solid rgba(26,111,196,0.25)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
                  }}
                >
                  <div
                    className="px-3 py-3"
                    style={{ borderBottom: "1px solid rgba(26,111,196,0.14)" }}
                  >
                    <p className="truncate text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                      {user.fullName}
                    </p>
                    <p className="truncate text-xs" style={{ color: "#8BA3C7" }}>
                      {user.email}
                    </p>
                    <span
                      className="mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-bold capitalize"
                      style={{
                        background: "rgba(59,143,232,0.12)",
                        color: "#3B8FE8",
                      }}
                    >
                      {user.role}
                    </span>
                  </div>
                  <div className="p-1.5">
                    {(user.role === "collaborator" || user.role === "admin") && (
                      <button
                        onClick={() => {
                          navigate({ type: "collaborator" });
                          setAccountOpen(false);
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium"
                        style={{ color: "#F0F6FF" }}
                      >
                        Panel de transmisión
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setAccountOpen(false);
                        navigate({ type: "auth" });
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium"
                      style={{ color: "#F87171" }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate({ type: "auth" })}
              className="ml-2 rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: "#F4C430", color: "#050D28" }}
            >
              Ingresar
            </button>
          )}
        </div>

        {}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg"
          style={{ color: "#8BA3C7" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {}
      {mobileOpen && (
        <div
          className="md:hidden animate-fade-in"
          style={{ borderTop: "1px solid rgba(26,111,196,0.15)" }}
        >
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => {
                navigate({ type: "home" });
                setMobileOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ color: "#F0F6FF" }}
            >
              Inicio
            </button>
            <div className="text-xs font-semibold px-3 py-1" style={{ color: "#8BA3C7" }}>
              DEPARTAMENTOS
            </div>
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  navigate({ type: "department", departmentId: dept.id });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm"
                style={{ color: "#8BA3C7" }}
              >
                {dept.name}
              </button>
            ))}
            <button
              onClick={() => {
                navigate({ type: "live" });
                setMobileOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ color: "#E53E3E" }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" /> En Vivo
            </button>
            <button
              onClick={() => {
                navigate({ type: "reviews" });
                setMobileOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
              style={{ color: "#27AE60" }}
            >
              Reseñas
            </button>
            {(user?.role === "collaborator" || user?.role === "admin") && (
              <button
                onClick={() => {
                  navigate({ type: "collaborator" });
                  setMobileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ color: "#27AE60" }}
              >
                Panel de transmisión
              </button>
            )}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                  navigate({ type: "auth" });
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold"
                style={{ color: "#F87171" }}
              >
                Cerrar sesión ({user.fullName.split(" ")[0]})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate({ type: "auth" });
                }}
                className="w-full rounded-lg px-3 py-2 text-sm font-bold"
                style={{ background: "#F4C430", color: "#050D28" }}
              >
                Ingresar
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
