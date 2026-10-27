import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { getDepartment, getDepartments } from "../services/contentService";
import {
  createStream,
  getMyStreams,
  getStreamCredentials,
  updateStreamStatus,
} from "../services/streamService";
import type {
  DepartmentSummary,
  LiveStream,
  StreamCredentials,
  StreamStatus,
  TouristSite,
} from "../types/domain";
import type { View } from "../navigation";

interface CollaboratorDashboardProps {
  onNavigate: (view: View) => void;
}

const statusLabels: Record<StreamStatus, string> = {
  scheduled: "Programada",
  live: "En vivo",
  ended: "Finalizada",
  offline: "Fuera de línea",
};

const statusColors: Record<StreamStatus, { background: string; color: string }> = {
  scheduled: { background: "rgba(244,196,48,0.12)", color: "#F4C430" },
  live: { background: "rgba(229,62,62,0.15)", color: "#F87171" },
  ended: { background: "rgba(139,163,199,0.12)", color: "#8BA3C7" },
  offline: { background: "rgba(139,163,199,0.12)", color: "#8BA3C7" },
};

function CopyField({
  label,
  value,
  secret = false,
}: {
  label: string;
  value: string;
  secret?: boolean;
}) {
  const [visible, setVisible] = useState(!secret);
  const [copied, setCopied] = useState(false);

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  const displayed = visible ? value : "•".repeat(Math.min(value.length, 32));

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold" style={{ color: "#8BA3C7" }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {secret && (
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="text-xs font-semibold"
              style={{ color: "#3B8FE8" }}
            >
              {visible ? "Ocultar" : "Mostrar"}
            </button>
          )}
          <button
            type="button"
            onClick={copyValue}
            className="rounded-md px-2 py-1 text-xs font-semibold"
            style={{
              background: copied ? "rgba(39,174,96,0.15)" : "rgba(26,111,196,0.14)",
              color: copied ? "#27AE60" : "#3B8FE8",
            }}
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
      </div>
      <div
        className="overflow-x-auto rounded-xl px-3 py-2.5 font-mono text-xs"
        style={{
          background: "rgba(5,13,40,0.72)",
          border: "1px solid rgba(26,111,196,0.2)",
          color: "#F0F6FF",
        }}
      >
        {displayed}
      </div>
    </div>
  );
}

export default function CollaboratorDashboard({ onNavigate }: CollaboratorDashboardProps) {
  const { user, logout } = useAuth();
  const [credentials, setCredentials] = useState<StreamCredentials | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [departments, setDepartments] = useState<DepartmentSummary[]>([]);
  const [sites, setSites] = useState<TouristSite[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const canStream = user?.role === "collaborator" || user?.role === "admin";

  useEffect(() => {
    if (!canStream) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setError(null);
      const [credentialsResult, streamsResult, departmentsResult] = await Promise.allSettled([
        getStreamCredentials(),
        getMyStreams(),
        getDepartments(),
      ]);

      if (cancelled) return;

      if (credentialsResult.status === "fulfilled") {
        setCredentials(credentialsResult.value);
      } else {
        setError(
          credentialsResult.reason instanceof Error
            ? credentialsResult.reason.message
            : "No se pudieron obtener tus credenciales",
        );
      }

      if (streamsResult.status === "fulfilled") {
        setStreams(streamsResult.value);
      }

      if (departmentsResult.status === "fulfilled") {
        setDepartments(departmentsResult.value);
        setDepartmentId((current) => current || departmentsResult.value[0]?.id || "");
      }

      setIsLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [canStream, user?.id]);

  useEffect(() => {
    if (!departmentId) {
      setSites([]);
      return;
    }

    let cancelled = false;
    getDepartment(departmentId)
      .then((department) => {
        if (!cancelled) setSites(department.sites);
      })
      .catch(() => {
        if (!cancelled) setSites([]);
      });

    return () => {
      cancelled = true;
    };
  }, [departmentId]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const created = await createStream({
        title,
        description,
        ...(siteId ? { touristSiteId: siteId } : { departmentId }),
        ...(scheduledFor ? { scheduledFor: new Date(scheduledFor).toISOString() } : {}),
      });

      setStreams((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setScheduledFor("");
      setSiteId("");
      setNotice("Transmisión creada. Ya puedes iniciar el directo.");
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "No se pudo crear la transmisión",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function changeStatus(stream: LiveStream, status: StreamStatus) {
    setError(null);
    setNotice(null);

    try {
      const updated = await updateStreamStatus(stream.id, status);
      setStreams((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(
        status === "live" ? "Transmisión marcada como en vivo." : "Transmisión finalizada.",
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error ? statusError.message : "No se pudo actualizar la transmisión",
      );
    }
  }

  if (!user) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 pt-16"
        style={{ background: "#050D28" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            background: "#0A1A42",
            border: "1px solid rgba(26,111,196,0.2)",
          }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
          >
            Panel de colaborador
          </h1>
          <p className="mt-3 text-sm" style={{ color: "#8BA3C7" }}>
            Inicia sesión con una cuenta habilitada para emitir en vivo.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ type: "auth" })}
            className="mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
            style={{ background: "#F4C430", color: "#050D28" }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  if (!canStream) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 pt-16"
        style={{ background: "#050D28" }}
      >
        <div
          className="w-full max-w-lg rounded-2xl p-8 text-center"
          style={{
            background: "#0A1A42",
            border: "1px solid rgba(26,111,196,0.2)",
          }}
        >
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
          >
            Cuenta sin permisos de transmisión
          </h1>
          <p className="mt-3 text-sm leading-6" style={{ color: "#8BA3C7" }}>
            Tu cuenta es de tipo usuario. Un administrador debe asignarte el rol de colaborador para
            habilitar tu Stream Key y el acceso a OBS.
          </p>
          <button
            type="button"
            onClick={() => onNavigate({ type: "home" })}
            className="mt-6 rounded-xl px-5 py-2.5 text-sm font-bold"
            style={{ background: "#1A6FC4", color: "#F0F6FF" }}
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pb-16 pt-24" style={{ background: "#050D28" }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.18em]"
              style={{ color: "#27AE60" }}
            >
              Panel de transmisión
            </p>
            <h1
              className="mt-1 text-3xl font-bold"
              style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
            >
              Hola, {user.fullName.split(" ")[0]}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#8BA3C7" }}>
              Obtén tus credenciales, configura OBS y transmite desde cualquier departamento o sitio
              turístico.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate({ type: "home" });
            }}
            className="rounded-xl px-4 py-2 text-sm font-semibold"
            style={{
              background: "rgba(229,62,62,0.1)",
              border: "1px solid rgba(229,62,62,0.25)",
              color: "#F87171",
            }}
          >
            Cerrar sesión
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(229,62,62,0.1)",
              border: "1px solid rgba(229,62,62,0.3)",
              color: "#FCA5A5",
            }}
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            className="mt-5 rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(39,174,96,0.1)",
              border: "1px solid rgba(39,174,96,0.25)",
              color: "#6EE7A0",
            }}
          >
            {notice}
          </div>
        )}

        {isLoading ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {[0, 1].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-2xl"
                style={{ background: "rgba(10,26,66,0.7)" }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section
              className="rounded-2xl p-6"
              style={{
                background: "#0A1A42",
                border: "1px solid rgba(26,111,196,0.2)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2
                    className="text-xl font-bold"
                    style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                  >
                    Credenciales para OBS
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: "#8BA3C7" }}>
                    Usa el servidor RTMP y tu clave personal en OBS Studio.
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(39,174,96,0.12)",
                    color: "#27AE60",
                  }}
                >
                  Privado
                </span>
              </div>

              {credentials ? (
                <div className="mt-5 space-y-4">
                  <CopyField label="Servidor RTMP" value={credentials.rtmpServer} />
                  <CopyField label="Stream Key" value={credentials.streamKey} secret />
                  <CopyField label="URL HLS" value={credentials.hlsUrl} />
                  <div
                    className="rounded-xl p-4 text-xs leading-6"
                    style={{
                      background: "rgba(26,111,196,0.08)",
                      border: "1px solid rgba(26,111,196,0.16)",
                      color: "#8BA3C7",
                    }}
                  >
                    En OBS: Ajustes &gt; Emisión &gt; Servicio personalizado. Pega el servidor RTMP
                    y la Stream Key. La clave es única por colaborador y nunca debe compartirse.
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm" style={{ color: "#8BA3C7" }}>
                  No fue posible cargar las credenciales.
                </p>
              )}

              <div className="mt-5 rounded-xl p-4" style={{ background: "rgba(5,13,40,0.55)" }}>
                <h3 className="text-sm font-bold" style={{ color: "#F0F6FF" }}>
                  Configuración rápida de OBS
                </h3>
                <ol className="mt-3 space-y-2 text-xs leading-5" style={{ color: "#8BA3C7" }}>
                  <li>1. Abre OBS y entra en Ajustes.</li>
                  <li>2. En Emisión elige Servicio: Personalizado.</li>
                  <li>3. Pega el servidor RTMP en Servidor.</li>
                  <li>4. Pega tu Stream Key en Clave de retransmisión.</li>
                  <li>5. Aplica los cambios y pulsa Iniciar transmisión.</li>
                </ol>
              </div>
            </section>

            <section
              className="rounded-2xl p-6"
              style={{
                background: "#0A1A42",
                border: "1px solid rgba(26,111,196,0.2)",
              }}
            >
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Nueva transmisión
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#8BA3C7" }}>
                Elige el destino y completa los datos que verá el público.
              </p>

              <form onSubmit={handleCreate} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                    Título
                  </span>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                    minLength={3}
                    maxLength={180}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(5,13,40,0.7)",
                      border: "1px solid rgba(26,111,196,0.25)",
                      color: "#F0F6FF",
                    }}
                    placeholder="Recorrido en vivo por..."
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                    Descripción
                  </span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(5,13,40,0.7)",
                      border: "1px solid rgba(26,111,196,0.25)",
                      color: "#F0F6FF",
                    }}
                    placeholder="Describe lo que mostrarás..."
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span
                      className="mb-1.5 block text-xs font-semibold"
                      style={{ color: "#C7D6EC" }}
                    >
                      Departamento
                    </span>
                    <select
                      value={departmentId}
                      onChange={(event) => {
                        setDepartmentId(event.target.value);
                        setSiteId("");
                      }}
                      required
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(5,13,40,0.7)",
                        border: "1px solid rgba(26,111,196,0.25)",
                        color: "#F0F6FF",
                      }}
                    >
                      <option value="">Selecciona uno</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span
                      className="mb-1.5 block text-xs font-semibold"
                      style={{ color: "#C7D6EC" }}
                    >
                      Sitio turístico (opcional)
                    </span>
                    <select
                      value={siteId}
                      onChange={(event) => setSiteId(event.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                      style={{
                        background: "rgba(5,13,40,0.7)",
                        border: "1px solid rgba(26,111,196,0.25)",
                        color: "#F0F6FF",
                      }}
                    >
                      <option value="">Todo el departamento</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold" style={{ color: "#C7D6EC" }}>
                    Fecha programada (opcional)
                  </span>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(event) => setScheduledFor(event.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{
                      background: "rgba(5,13,40,0.7)",
                      border: "1px solid rgba(26,111,196,0.25)",
                      color: "#F0F6FF",
                    }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || !departmentId}
                  className="w-full rounded-xl py-2.5 text-sm font-bold disabled:opacity-60"
                  style={{ background: "#F4C430", color: "#050D28" }}
                >
                  {isSubmitting ? "Creando..." : "Crear transmisión"}
                </button>
              </form>
            </section>
          </div>
        )}

        <section
          className="mt-6 rounded-2xl p-6"
          style={{
            background: "#0A1A42",
            border: "1px solid rgba(26,111,196,0.2)",
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Mis transmisiones
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#8BA3C7" }}>
                Inicia o finaliza el estado de cada emisión.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                getMyStreams()
                  .then(setStreams)
                  .catch(() => setError("No se pudieron recargar las transmisiones"))
              }
              className="rounded-lg px-3 py-2 text-xs font-semibold"
              style={{
                background: "rgba(26,111,196,0.12)",
                color: "#3B8FE8",
                border: "1px solid rgba(59,143,232,0.22)",
              }}
            >
              Actualizar
            </button>
          </div>

          {streams.length === 0 ? (
            <p className="mt-6 text-sm" style={{ color: "#8BA3C7" }}>
              Todavía no has creado transmisiones.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {streams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(5,13,40,0.5)",
                    border: "1px solid rgba(26,111,196,0.14)",
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={statusColors[stream.status]}
                      >
                        {statusLabels[stream.status]}
                      </span>
                      <span className="text-xs" style={{ color: "#8BA3C7" }}>
                        {stream.departmentName || stream.touristSiteName || "Sin destino"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                      {stream.title}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "#8BA3C7" }}>
                      {stream.startedAt
                        ? `Inicio: ${new Date(stream.startedAt).toLocaleString("es-NI")}`
                        : "Aún no iniciada"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {stream.status !== "live" && stream.status !== "ended" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(stream, "live")}
                        className="rounded-lg px-3 py-2 text-xs font-bold"
                        style={{ background: "#E53E3E", color: "#F0F6FF" }}
                      >
                        Iniciar en vivo
                      </button>
                    )}
                    {stream.status === "live" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(stream, "ended")}
                        className="rounded-lg px-3 py-2 text-xs font-bold"
                        style={{
                          background: "rgba(139,163,199,0.15)",
                          color: "#F0F6FF",
                        }}
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
