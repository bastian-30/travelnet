import { useState } from "react";
import { type SiteCategory } from "../data/nicaragua";
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

interface DepartmentViewProps {
  departmentId: string;
  onNavigate: (view: View) => void;
}

const categoryConfig: Record<
  SiteCategory,
  {
    bg: string;
    text: string;
    border: string;
    label: string;
  }
> = {
  colonial: {
    bg: "rgba(244,196,48,0.12)",
    text: "#F4C430",
    border: "rgba(244,196,48,0.3)",
    label: "Colonial",
  },
  historico: {
    bg: "rgba(59,143,232,0.12)",
    text: "#3B8FE8",
    border: "rgba(59,143,232,0.3)",
    label: "Histórico",
  },
  turistico: {
    bg: "rgba(39,174,96,0.12)",
    text: "#27AE60",
    border: "rgba(39,174,96,0.3)",
    label: "Turístico",
  },
};

type Filter = "all" | SiteCategory;

export default function DepartmentView({ departmentId, onNavigate }: DepartmentViewProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const departments = useCatalog();
  const { streams } = useLiveStreams({
    departmentId,
    pollIntervalMs: 30_000,
  });

  const dept = departments.find((d) => d.id === departmentId);
  const featuredStream =
    streams.find((stream) => stream.status === "live") ||
    streams.find((stream) => stream.status === "scheduled");
  if (!dept) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#050D28" }}
      >
        <div className="text-center">
          <p style={{ color: "#8BA3C7" }}>Departamento no encontrado.</p>
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

  const filtered = filter === "all" ? dept.sites : dept.sites.filter((s) => s.category === filter);

  const categories: { value: Filter; label: string }[] = [
    { value: "all", label: "Todos" },
    { value: "colonial", label: "Colonial" },
    { value: "historico", label: "Histórico" },
    { value: "turistico", label: "Turístico" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#050D28" }}>
      {/* Hero */}
      <div className="relative h-72 sm:h-80 overflow-hidden">
        <img src={dept.coverImage} alt={dept.name} className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(5,13,40,0.3) 0%, rgba(5,13,40,0.85) 60%, rgba(5,13,40,1) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-6 max-w-7xl mx-auto">
          <button
            onClick={() => onNavigate({ type: "home" })}
            className="flex items-center gap-1.5 text-sm mb-4 w-fit"
            style={{ color: "#8BA3C7" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Inicio
          </button>

          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(26,111,196,0.3)",
                    color: "#3B8FE8",
                    border: "1px solid rgba(59,143,232,0.4)",
                  }}
                >
                  {dept.region}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: "rgba(27,122,62,0.25)",
                    color: "#27AE60",
                  }}
                >
                  {dept.sites.length} sitios
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                {dept.name}
              </h1>
              <p className="text-sm mt-2 max-w-xl" style={{ color: "#8BA3C7" }}>
                Capital: {dept.capital}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Description */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{
            background: "rgba(10,26,66,0.5)",
            border: "1px solid rgba(26,111,196,0.15)",
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: "#8BA3C7" }}>
            {dept.description}
          </p>
        </div>

        {featuredStream && (
          <section
            className="mb-8 rounded-2xl p-4 sm:p-5"
            style={{
              background: "#0A1A42",
              border:
                featuredStream.status === "live"
                  ? "1px solid rgba(229,62,62,0.3)"
                  : "1px solid rgba(244,196,48,0.25)",
            }}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    featuredStream.status === "live" ? "animate-pulse-live" : ""
                  }`}
                  style={{
                    background: featuredStream.status === "live" ? "#E53E3E" : "#F4C430",
                  }}
                />
                <h2
                  className="text-base font-bold"
                  style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                >
                  {featuredStream.status === "live"
                    ? `En vivo desde ${dept.name}`
                    : `Próxima transmisión en ${dept.name}`}
                </h2>
              </div>
              <span className="text-xs" style={{ color: "#8BA3C7" }}>
                {featuredStream.title}
              </span>
            </div>
            <LiveStreamPlayer stream={featuredStream} />
          </section>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => {
            const active = filter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setFilter(cat.value)}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: active ? "rgba(244,196,48,0.15)" : "rgba(10,26,66,0.6)",
                  color: active ? "#F4C430" : "#8BA3C7",
                  border: active
                    ? "1px solid rgba(244,196,48,0.35)"
                    : "1px solid rgba(26,111,196,0.15)",
                }}
              >
                {cat.label}
                {cat.value !== "all" && (
                  <span className="ml-1.5 text-xs opacity-70">
                    ({dept.sites.filter((s) => s.category === cat.value).length})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sites Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#8BA3C7" }}>
            No hay sitios con este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((site) => {
              const catStyle = categoryConfig[site.category];
              return (
                <button
                  key={site.id}
                  onClick={() =>
                    onNavigate({
                      type: "site",
                      departmentId: dept.id,
                      siteId: site.id,
                    })
                  }
                  className="card-hover text-left rounded-2xl overflow-hidden group"
                  style={{
                    background: "#0A1A42",
                    border: "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={site.coverImage}
                      alt={site.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10,26,66,0.9) 0%, transparent 55%)",
                      }}
                    />

                    {/* Category badge */}
                    <div
                      className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: catStyle.bg,
                        color: catStyle.text,
                        border: `1px solid ${catStyle.border}`,
                      }}
                    >
                      {catStyle.label}
                    </div>

                    {/* Play button */}
                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      style={{ background: "rgba(244,196,48,0.9)" }}
                    >
                      <svg
                        className="w-4 h-4 ml-0.5"
                        style={{ color: "#050D28" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>

                    {/* MIPYMES count */}
                    <div
                      className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: "rgba(5,13,40,0.8)",
                        color: "#27AE60",
                      }}
                    >
                      🏨 {site.mipymes.length} MIPYMES
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3
                      className="font-bold text-base mb-2"
                      style={{
                        fontFamily: "Fraunces, serif",
                        color: "#F0F6FF",
                      }}
                    >
                      {site.name}
                    </h3>
                    <p className="text-xs line-clamp-3 mb-3" style={{ color: "#8BA3C7" }}>
                      {site.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {site.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{
                            background: "rgba(26,111,196,0.12)",
                            color: "#3B8FE8",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div
                      className="flex items-center gap-1 text-xs font-semibold"
                      style={{ color: "#F4C430" }}
                    >
                      Ver sitio
                      <svg
                        className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
