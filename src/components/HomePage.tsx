import { useState } from "react";
import NicaMap from "./NicaMap";
import { liveStreams } from "../data/nicaragua";
import { useCatalog } from "../hooks/useCatalog";
import { useLiveStreams } from "../hooks/useLiveStreams";
import { toDisplayStream, type DisplayStream } from "../services/streamDisplay";

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

interface HomePageProps {
  onNavigate: (view: View) => void;
}

const categoryColors: Record<
  string,
  {
    bg: string;
    text: string;
    label: string;
  }
> = {
  colonial: { bg: "rgba(244,196,48,0.15)", text: "#F4C430", label: "Colonial" },
  historico: {
    bg: "rgba(59,143,232,0.15)",
    text: "#3B8FE8",
    label: "Histórico",
  },
  turistico: {
    bg: "rgba(39,174,96,0.15)",
    text: "#27AE60",
    label: "Turístico",
  },
};

export default function HomePage({ onNavigate }: HomePageProps) {
  const [activeDept, setActiveDept] = useState<string | undefined>(undefined);
  const departments = useCatalog();
  const { streams } = useLiveStreams({ pollIntervalMs: 30_000 });

  const remoteDisplayStreams = streams.map(toDisplayStream);
  const displayStreams: DisplayStream[] =
    remoteDisplayStreams.length > 0
      ? remoteDisplayStreams
      : liveStreams.map((stream) => ({ ...stream }));

  const liveCount = displayStreams.filter((s) => s.isLive).length;

  const featuredDepts = departments.slice(0, 6);

  const recentSites = departments
    .flatMap((d) =>
      d.sites.slice(0, 1).map((s) => ({ ...s, departmentId: d.id, departmentName: d.name })),
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen" style={{ background: "#050D28" }}>
      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(26,111,196,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in">
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
                style={{
                  background: "rgba(229,62,62,0.12)",
                  border: "1px solid rgba(229,62,62,0.3)",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse-live"
                  style={{ background: "#E53E3E" }}
                />
                <span className="text-xs font-semibold" style={{ color: "#E53E3E" }}>
                  {liveCount} STREAMS EN VIVO AHORA
                </span>
              </div>

              <h1
                className="text-5xl lg:text-6xl font-bold leading-tight mb-4"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Descubre
                <br />
                <span style={{ color: "#F4C430" }}>Nicaragua</span>
                <br />
                <span style={{ color: "#27AE60" }}>En Vivo</span>
              </h1>

              <p className="text-base mb-8 leading-relaxed max-w-md" style={{ color: "#8BA3C7" }}>
                Explora sitios turísticos, históricos y coloniales de los 17 departamentos de
                Nicaragua. Conecta con creadores de contenido que transmiten en tiempo real desde
                los destinos más increíbles del país.
              </p>

              {/* Stats */}
              <div className="flex gap-6 mb-8">
                {[
                  { value: "17", label: "Departamentos" },
                  { value: "40+", label: "Sitios" },
                  { value: "120+", label: "MIPYMES" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      className="text-2xl font-bold"
                      style={{
                        fontFamily: "Fraunces, serif",
                        color: "#F4C430",
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs" style={{ color: "#8BA3C7" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => onNavigate({ type: "department", departmentId: "granada" })}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
                  style={{
                    background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
                    color: "#F0F6FF",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  Explorar Destinos
                </button>
                <button
                  onClick={() => onNavigate({ type: "live" })}
                  className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                  style={{
                    background: "rgba(229,62,62,0.12)",
                    color: "#E53E3E",
                    border: "1px solid rgba(229,62,62,0.3)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse-live"
                    style={{ background: "#E53E3E" }}
                  />
                  Ver En Vivo
                </button>
              </div>
            </div>

            {/* Right: Map */}
            <div className="animate-fade-in">
              <NicaMap
                onDepartmentClick={(id) => {
                  setActiveDept(id);
                  onNavigate({ type: "department", departmentId: id });
                }}
                activeDepartmentId={activeDept}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Departments */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Departamentos Destacados
              </h2>
              <p className="text-sm mt-1" style={{ color: "#8BA3C7" }}>
                Selecciona un departamento para explorar sus sitios
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredDepts.map((dept) => (
              <button
                key={dept.id}
                onClick={() => onNavigate({ type: "department", departmentId: dept.id })}
                className="card-hover text-left relative overflow-hidden rounded-2xl group"
                style={{
                  background: "#0A1A42",
                  border: "1px solid rgba(26,111,196,0.15)",
                }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={dept.coverImage}
                    alt={dept.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,26,66,0.95) 0%, rgba(10,26,66,0.4) 50%, transparent 100%)",
                    }}
                  />
                  <div
                    className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(26,111,196,0.3)",
                      color: "#3B8FE8",
                      border: "1px solid rgba(59,143,232,0.3)",
                    }}
                  >
                    {dept.region}
                  </div>
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      background: "rgba(27,122,62,0.3)",
                      color: "#27AE60",
                    }}
                  >
                    {dept.sites.length} sitios
                  </div>
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-lg mb-1"
                    style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                  >
                    {dept.name}
                  </h3>
                  <p className="text-xs line-clamp-2" style={{ color: "#8BA3C7" }}>
                    {dept.description}
                  </p>
                  <div
                    className="mt-3 flex items-center gap-1 text-xs font-semibold"
                    style={{ color: "#F4C430" }}
                  >
                    Explorar
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
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sites / Latest */}
      <section className="py-12 px-4" style={{ background: "rgba(10,26,66,0.3)" }}>
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
          >
            Sitios Destacados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentSites.map((site) => {
              const catStyle = categoryColors[site.category];
              return (
                <button
                  key={site.id}
                  onClick={() =>
                    onNavigate({
                      type: "site",
                      departmentId: site.departmentId,
                      siteId: site.id,
                    })
                  }
                  className="card-hover text-left rounded-xl overflow-hidden group"
                  style={{
                    background: "#0A1A42",
                    border: "1px solid rgba(26,111,196,0.12)",
                  }}
                >
                  <div className="relative h-36">
                    <img
                      src={site.thumbnailImage}
                      alt={site.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10,26,66,0.9) 0%, transparent 60%)",
                      }}
                    />
                    <div className="absolute bottom-2 left-2">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{
                          background: catStyle.bg,
                          color: catStyle.text,
                        }}
                      >
                        {catStyle.label}
                      </span>
                    </div>
                    <div
                      className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(244,196,48,0.9)" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        style={{ color: "#050D28" }}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs mb-0.5" style={{ color: "#3B8FE8" }}>
                      {site.departmentName}
                    </div>
                    <div
                      className="font-semibold text-sm line-clamp-2"
                      style={{ color: "#F0F6FF" }}
                    >
                      {site.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live preview strip */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full animate-pulse-live"
                style={{ background: "#E53E3E" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Streams En Vivo
              </h2>
            </div>
            <button
              onClick={() => onNavigate({ type: "live" })}
              className="text-sm font-semibold transition-colors"
              style={{ color: "#F4C430" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F6FF")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#F4C430")}
            >
              Ver todos →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayStreams
              .filter((s) => s.isLive)
              .map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => onNavigate({ type: "live" })}
                  className="card-hover text-left rounded-xl overflow-hidden group"
                  style={{
                    background: "#0A1A42",
                    border: "1px solid rgba(26,111,196,0.15)",
                  }}
                >
                  <div className="relative h-40">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(10,26,66,0.85) 0%, transparent 60%)",
                      }}
                    />
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(229,62,62,0.85)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                      <span className="text-white text-xs font-bold">EN VIVO</span>
                    </div>
                    <div
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: "#F0F6FF",
                      }}
                    >
                      👁 {stream.viewers.toLocaleString()}
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div
                        className="font-semibold text-sm line-clamp-2"
                        style={{ color: "#F0F6FF" }}
                      >
                        {stream.title}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 flex items-center gap-2">
                    <img
                      src={stream.avatar}
                      alt={stream.creator}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-xs font-semibold" style={{ color: "#F0F6FF" }}>
                        {stream.creator}
                      </div>
                      <div className="text-xs" style={{ color: "#3B8FE8" }}>
                        {stream.department}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 mt-4" style={{ borderTop: "1px solid rgba(26,111,196,0.15)" }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #1A6FC4, #1B7A3E)",
              }}
            >
              <span
                style={{
                  color: "#F4C430",
                  fontFamily: "Fraunces, serif",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                TN
              </span>
            </div>
            <span className="font-bold" style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}>
              TravelNet
            </span>
          </div>
          <p className="text-xs text-center" style={{ color: "#8BA3C7" }}>
            © 2024 TravelNet — Turismo & Patrimonio de Nicaragua. Conectando el mundo con nuestra
            cultura.
          </p>
          <div className="flex gap-2">
            <div className="w-5 h-3 rounded-sm" style={{ background: "#1B7A3E" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#F0F6FF" }} />
            <div className="w-5 h-3 rounded-sm" style={{ background: "#1A6FC4" }} />
          </div>
        </div>
      </footer>
    </div>
  );
}
