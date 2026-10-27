import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import type { View } from "../navigation";

interface AuthPageProps {
  onNavigate: (view: View) => void;
}

type Mode = "login" | "register";

export default function AuthPage({ onNavigate }: AuthPageProps) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const user =
        mode === "login" ? await login(email, password) : await register(fullName, email, password);

      onNavigate({
        type: user.role === "collaborator" || user.role === "admin" ? "collaborator" : "home",
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "No se pudo completar la operación",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-24" style={{ background: "#050D28" }}>
      <div
        className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl lg:grid-cols-2"
        style={{
          background: "#0A1A42",
          border: "1px solid rgba(26,111,196,0.22)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
        }}
      >
        <div className="relative hidden min-h-[560px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=1000&h=1200&fit=crop&auto=format"
            alt="Arquitectura colonial de Granada"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(160deg, rgba(5,13,40,0.15), rgba(5,13,40,0.92))",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-9">
            <div
              className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold"
              style={{
                background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
                color: "#F4C430",
                fontFamily: "Fraunces, serif",
              }}
            >
              TN
            </div>
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
            >
              Nicaragua en vivo,
              <br />
              desde cualquier lugar.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6" style={{ color: "#C7D6EC" }}>
              Recorre los departamentos, descubre sus sitios y acompaña a los colaboradores que
              transmiten desde el terreno.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "#3B8FE8" }}>
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </p>
          <h2
            className="mt-2 text-2xl font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
          >
            {mode === "login" ? "Iniciar sesión" : "Registro de usuario"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#8BA3C7" }}>
            {mode === "login"
              ? "Accede a tu cuenta para continuar."
              : "Las cuentas se crean con rol de usuario. Un administrador puede habilitarte como colaborador."}
          </p>

          <div
            className="mt-6 grid grid-cols-2 rounded-xl p-1"
            style={{ background: "rgba(5,13,40,0.65)" }}
          >
            {[
              { value: "login" as const, label: "Ingresar" },
              { value: "register" as const, label: "Registrarme" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => changeMode(option.value)}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: mode === option.value ? "#152B7A" : "transparent",
                  color: mode === option.value ? "#F0F6FF" : "#8BA3C7",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                  Nombre completo
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  minLength={3}
                  maxLength={120}
                  autoComplete="name"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background: "rgba(5,13,40,0.65)",
                    border: "1px solid rgba(26,111,196,0.28)",
                    color: "#F0F6FF",
                  }}
                  placeholder="Tu nombre"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                Correo electrónico
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "rgba(5,13,40,0.65)",
                  border: "1px solid rgba(26,111,196,0.28)",
                  color: "#F0F6FF",
                }}
                placeholder="nombre@correo.com"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                Contraseña
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={72}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: "rgba(5,13,40,0.65)",
                  border: "1px solid rgba(26,111,196,0.28)",
                  color: "#F0F6FF",
                }}
                placeholder="Mínimo 8 caracteres"
              />
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(229,62,62,0.1)",
                  border: "1px solid rgba(229,62,62,0.3)",
                  color: "#FCA5A5",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-3 text-sm font-bold transition-opacity disabled:opacity-60"
              style={{ background: "#F4C430", color: "#050D28" }}
            >
              {submitting
                ? "Procesando..."
                : mode === "login"
                  ? "Entrar a TravelNet"
                  : "Crear cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
