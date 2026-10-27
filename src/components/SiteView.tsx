import { useState } from "react";
import type { MIPYME } from "../data/nicaragua";
import { useCatalog } from "../hooks/useCatalog";
import { useLiveStreams } from "../hooks/useLiveStreams";
import LiveStreamPlayer from "./LiveStreamPlayer";

type View =
  | { type: "home" }
  | { type: "department"; departmentId: string }
  | {
      type: "site";
      departmentId: string;
      siteId: string;
    }
  | { type: "live" }
  | { type: "reviews" };

interface SiteViewProps {
  departmentId: string;
  siteId: string;
  onNavigate: (view: View) => void;
}

const mipymeTypeIcons: Record<string, string> = {
  hostal: "🛏️",
  hotel: "🏨",
  restaurante: "🍽️",
  tour: "🗺️",
  artesanía: "🎨",
};

const mipymeTypeColors: Record<string, { bg: string; text: string }> = {
  hostal: { bg: "rgba(59,143,232,0.12)", text: "#3B8FE8" },
  hotel: { bg: "rgba(244,196,48,0.12)", text: "#F4C430" },
  restaurante: { bg: "rgba(229,62,62,0.12)", text: "#E53E3E" },
  tour: { bg: "rgba(39,174,96,0.12)", text: "#27AE60" },
  artesanía: { bg: "rgba(160,100,200,0.12)", text: "#B87FD4" },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className="w-3.5 h-3.5"
          fill={s <= Math.round(rating) ? "#F4C430" : "rgba(244,196,48,0.25)"}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: "#F4C430" }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function VideoPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div
      className="relative rounded-xl overflow-hidden aspect-video"
      style={{ background: "#0A1A42" }}
    >
      {!playing ? (
        <>
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1630773899830-15ae96bbd777?w=800&h=450&fit=crop&auto=format";
            }}
          />
          <div className="absolute inset-0" style={{ background: "rgba(5,13,40,0.45)" }} />
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "rgba(244,196,48,0.92)",
                boxShadow: "0 0 40px rgba(244,196,48,0.4)",
              }}
            >
              <svg
                className="w-7 h-7 ml-1"
                style={{ color: "#050D28" }}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                {title}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8BA3C7" }}>
                Haz clic para reproducir el video
              </p>
            </div>
          </button>
        </>
      ) : (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function MIPYMECard({ mipyme }: { mipyme: MIPYME }) {
  const colors = mipymeTypeColors[mipyme.type] || {
    bg: "rgba(26,111,196,0.1)",
    text: "#3B8FE8",
  };
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{
        background: "#0A1A42",
        border: "1px solid rgba(26,111,196,0.15)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{mipymeTypeIcons[mipyme.type]}</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
              style={{ background: colors.bg, color: colors.text }}
            >
              {mipyme.type}
            </span>
          </div>
          <h4 className="font-bold text-sm" style={{ color: "#F0F6FF" }}>
            {mipyme.name}
          </h4>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold" style={{ color: "#F4C430" }}>
            {mipyme.priceRange}
          </div>
          <div className="text-xs" style={{ color: "#8BA3C7" }}>
            precio
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: "#8BA3C7" }}>
        {mipyme.description}
      </p>

      <div className="flex items-center justify-between">
        <StarRating rating={mipyme.rating} />
        <span className="text-xs" style={{ color: "#3B8FE8" }}>
          📍 {mipyme.distance}
        </span>
      </div>

      <div
        className="flex items-center gap-2 pt-1"
        style={{ borderTop: "1px solid rgba(26,111,196,0.1)" }}
      >
        <span className="text-xs" style={{ color: "#8BA3C7" }}>
          📞 {mipyme.phone}
        </span>
      </div>
    </div>
  );
}

const categoryConfig = {
  colonial: { bg: "rgba(244,196,48,0.12)", text: "#F4C430", label: "Colonial" },
  historico: {
    bg: "rgba(59,143,232,0.12)",
    text: "#3B8FE8",
    label: "Histórico",
  },
  turistico: {
    bg: "rgba(39,174,96,0.12)",
    text: "#27AE60",
    label: "Turístico",
  },
};

export default function SiteView({ departmentId, siteId, onNavigate }: SiteViewProps) {
  const [activeTab, setActiveTab] = useState<"historia" | "video" | "envivo" | "mipymes">(
    "historia",
  );
  const departments = useCatalog();
  const {
    streams,
    isLoading: streamsLoading,
    error: streamsError,
    refresh: refreshStreams,
  } = useLiveStreams({ siteId, pollIntervalMs: 30_000 });

  const dept = departments.find((d) => d.id === departmentId);
  const site = dept?.sites.find((s) => s.id === siteId);
  const liveStream =
    streams.find((stream) => stream.status === "live") ||
    streams.find((stream) => stream.status === "scheduled");
  const liveCount = streams.filter((stream) => stream.status === "live").length;

  if (!dept || !site) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#050D28" }}
      >
        <div className="text-center">
          <p style={{ color: "#8BA3C7" }}>Sitio no encontrado.</p>
          <button
            onClick={() => onNavigate({ type: "home" })}
            className="mt-4 text-sm font-semibold"
            style={{ color: "#F4C430" }}
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const catStyle = categoryConfig[site.category];

  return (
    <div className="min-h-screen" style={{ background: "#050D28" }}>
      {/* Hero Image */}
      <div className="relative h-80 sm:h-96 overflow-hidden">
        <img src={site.coverImage} alt={site.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,13,40,0.25) 0%, rgba(5,13,40,0.7) 60%, rgba(5,13,40,1) 100%)",
          }}
        />

        {/* Breadcrumb */}
        <div
          className="absolute top-20 left-6 flex items-center gap-2 text-sm"
          style={{ color: "#8BA3C7" }}
        >
          <button
            onClick={() => onNavigate({ type: "home" })}
            className="hover:text-white transition-colors"
          >
            Inicio
          </button>
          <span>/</span>
          <button
            onClick={() => onNavigate({ type: "department", departmentId: dept.id })}
            className="hover:text-white transition-colors"
          >
            {dept.name}
          </button>
          <span>/</span>
          <span style={{ color: "#F0F6FF" }}>{site.name}</span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 max-w-5xl">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: catStyle.bg,
                color: catStyle.text,
                border: `1px solid ${catStyle.text}44`,
              }}
            >
              {catStyle.label}
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: "rgba(26,111,196,0.25)", color: "#3B8FE8" }}
            >
              {dept.name}
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
          >
            {site.name}
          </h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "#8BA3C7" }}>
            {site.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            {site.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(26,111,196,0.15)",
                  color: "#3B8FE8",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="sticky top-16 z-40"
        style={{
          background: "rgba(5,13,40,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(26,111,196,0.15)",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 flex gap-1">
          {[
            { id: "historia" as const, label: "Historia", icon: "📜" },
            { id: "video" as const, label: "Video Interactivo", icon: "🎬" },
            {
              id: "envivo" as const,
              label: liveCount > 0 ? `En Vivo (${liveCount})` : "En Vivo",
              icon: "●",
            },
            {
              id: "mipymes" as const,
              label: `MIPYMES (${site.mipymes.length})`,
              icon: "🏨",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors border-b-2"
              style={{
                color: activeTab === tab.id ? "#F4C430" : "#8BA3C7",
                borderBottomColor: activeTab === tab.id ? "#F4C430" : "transparent",
              }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "historia" && (
          <div className="animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                >
                  Reseña Histórica
                </h2>
                <div
                  className="rounded-xl p-6"
                  style={{
                    background: "rgba(10,26,66,0.5)",
                    border: "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  <p className="text-sm leading-8" style={{ color: "#8BA3C7" }}>
                    {site.history}
                  </p>
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => setActiveTab("video")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(244,196,48,0.12)",
                      color: "#F4C430",
                      border: "1px solid rgba(244,196,48,0.25)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    🎬 Ver Video del Sitio
                  </button>
                  <button
                    onClick={() => setActiveTab("mipymes")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: "rgba(39,174,96,0.12)",
                      color: "#27AE60",
                      border: "1px solid rgba(39,174,96,0.25)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    🏨 Ver MIPYMES Cercanas
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quick Info Card */}
                <div
                  className="rounded-xl p-5"
                  style={{
                    background: "rgba(10,26,66,0.5)",
                    border: "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  <h3 className="font-bold text-sm mb-4" style={{ color: "#F0F6FF" }}>
                    Información del Sitio
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#8BA3C7" }}>
                        Departamento
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "#F0F6FF" }}>
                        {dept.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#8BA3C7" }}>
                        Categoría
                      </span>
                      <span className="text-xs font-semibold" style={{ color: catStyle.text }}>
                        {catStyle.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#8BA3C7" }}>
                        MIPYMES
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "#27AE60" }}>
                        {site.mipymes.length} disponibles
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: "#8BA3C7" }}>
                        Región
                      </span>
                      <span className="text-xs font-semibold" style={{ color: "#F0F6FF" }}>
                        {dept.region}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Thumbnail preview to video */}
                <button
                  onClick={() => setActiveTab("video")}
                  className="w-full rounded-xl overflow-hidden relative group"
                  style={{ border: "1px solid rgba(26,111,196,0.15)" }}
                >
                  <img
                    src={site.thumbnailImage}
                    alt={site.name}
                    className="w-full h-32 object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(5,13,40,0.5)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: "rgba(244,196,48,0.9)" }}
                    >
                      <svg
                        className="w-5 h-5 ml-0.5"
                        style={{ color: "#050D28" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "video" && (
          <div className="animate-fade-in">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
            >
              Video Interactivo — {site.name}
            </h2>
            <div className="max-w-3xl">
              <VideoPlayer videoId={site.videoId} title={site.name} />
              <div
                className="mt-4 rounded-xl p-4"
                style={{
                  background: "rgba(10,26,66,0.5)",
                  border: "1px solid rgba(26,111,196,0.15)",
                }}
              >
                <p className="text-sm" style={{ color: "#8BA3C7" }}>
                  Descubre {site.name} a través de este recorrido visual. El video te mostrará los
                  aspectos más destacados del sitio, su entorno y el contexto cultural e histórico
                  de uno de los tesoros de {dept.name}, Nicaragua.
                </p>
              </div>

              {/* Other site videos in department */}
              {dept.sites.filter((s) => s.id !== site.id).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-bold mb-3" style={{ color: "#F0F6FF" }}>
                    Más sitios en {dept.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {dept.sites
                      .filter((s) => s.id !== site.id)
                      .map((s) => (
                        <button
                          key={s.id}
                          onClick={() =>
                            onNavigate({
                              type: "site",
                              departmentId: dept.id,
                              siteId: s.id,
                            })
                          }
                          className="text-left rounded-lg overflow-hidden card-hover group"
                          style={{ border: "1px solid rgba(26,111,196,0.15)" }}
                        >
                          <div className="relative h-20">
                            <img
                              src={s.thumbnailImage}
                              alt={s.name}
                              className="w-full h-full object-cover"
                            />
                            <div
                              className="absolute inset-0"
                              style={{ background: "rgba(5,13,40,0.5)" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg
                                className="w-6 h-6"
                                style={{ color: "#F4C430" }}
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="p-2" style={{ background: "#0A1A42" }}>
                            <p
                              className="text-xs font-semibold line-clamp-2"
                              style={{ color: "#F0F6FF" }}
                            >
                              {s.name}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "envivo" && (
          <div className="animate-fade-in">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                >
                  Transmisión en vivo — {site.name}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "#8BA3C7" }}>
                  Señal en directo desde {dept.name}, Nicaragua.
                </p>
              </div>
              {liveStream && (
                <button
                  type="button"
                  onClick={refreshStreams}
                  className="rounded-lg px-3 py-2 text-xs font-semibold"
                  style={{
                    background: "rgba(26,111,196,0.12)",
                    color: "#3B8FE8",
                    border: "1px solid rgba(59,143,232,0.22)",
                  }}
                >
                  Actualizar señal
                </button>
              )}
            </div>

            {streamsLoading ? (
              <div
                className="aspect-video animate-pulse rounded-xl"
                style={{ background: "rgba(10,26,66,0.7)" }}
              />
            ) : liveStream ? (
              <>
                <LiveStreamPlayer stream={liveStream} allowWebrtc />
                <div
                  className="mt-4 rounded-xl p-5"
                  style={{
                    background: "rgba(10,26,66,0.5)",
                    border: "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold" style={{ color: "#F0F6FF" }}>
                        {liveStream.title}
                      </h3>
                      <p className="mt-1 text-sm" style={{ color: "#8BA3C7" }}>
                        {liveStream.description || "Recorrido en tiempo real por este destino."}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: "rgba(229,62,62,0.12)",
                        color: "#F87171",
                      }}
                    >
                      {liveStream.status === "live" ? "En vivo ahora" : "Próxima emisión"}
                    </span>
                  </div>
                  <p className="mt-3 text-xs" style={{ color: "#3B8FE8" }}>
                    Colaborador: {liveStream.collaborator.name || "TravelNet"}
                  </p>
                </div>
              </>
            ) : (
              <div
                className="rounded-xl px-6 py-12 text-center"
                style={{
                  background: "rgba(10,26,66,0.5)",
                  border: "1px solid rgba(26,111,196,0.15)",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                  No hay una transmisión activa para este sitio.
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6" style={{ color: "#8BA3C7" }}>
                  Cuando un colaborador inicie el directo desde {site.name}, la señal aparecerá
                  automáticamente aquí.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate({ type: "live" })}
                  className="mt-5 rounded-lg px-4 py-2 text-sm font-bold"
                  style={{ background: "#F4C430", color: "#050D28" }}
                >
                  Ver otros directos
                </button>
              </div>
            )}

            {streamsError && (
              <p className="mt-3 text-xs" style={{ color: "#F87171" }}>
                {streamsError}
              </p>
            )}
          </div>
        )}

        {activeTab === "mipymes" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                >
                  MIPYMES Cercanas
                </h2>
                <p className="text-sm mt-1" style={{ color: "#8BA3C7" }}>
                  Pequeñas y medianas empresas de alojamiento, gastronomía y tours cerca de{" "}
                  {site.name}
                </p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  background: "rgba(27,122,62,0.15)",
                  color: "#27AE60",
                  border: "1px solid rgba(39,174,96,0.25)",
                }}
              >
                {site.mipymes.length} disponibles
              </div>
            </div>

            {site.mipymes.length === 0 ? (
              <div className="text-center py-12" style={{ color: "#8BA3C7" }}>
                No hay MIPYMES registradas para este sitio aún.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {site.mipymes.map((m) => (
                  <MIPYMECard key={m.id} mipyme={m} />
                ))}
              </div>
            )}

            <div
              className="mt-6 rounded-xl p-4"
              style={{
                background: "rgba(27,122,62,0.08)",
                border: "1px solid rgba(39,174,96,0.2)",
              }}
            >
              <p className="text-xs" style={{ color: "#27AE60" }}>
                💡 Las MIPYMES (Micro, Pequeñas y Medianas Empresas) son negocios locales que
                contribuyen directamente al desarrollo económico de las comunidades. Al hospedarte o
                consumir en ellas, apoyas la economía local de Nicaragua.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
