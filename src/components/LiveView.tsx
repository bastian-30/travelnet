import { useState } from "react";
import { liveStreams } from "../data/nicaragua";
import { useLiveStreams } from "../hooks/useLiveStreams";
import { toDisplayStream, type DisplayStream } from "../services/streamDisplay";
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
  | { type: "reviews" }
  | { type: "auth" }
  | {
      type: "collaborator";
    };

interface LiveViewProps {
  onNavigate: (view: View) => void;
}

const creators = [
  {
    name: "NicaVlog Tours",
    dept: "Granada",
    followers: "14.2K",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    streams: 42,
  },
  {
    name: "Aventuras Nicaragua",
    dept: "Masaya",
    followers: "28.5K",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
    streams: 67,
  },
  {
    name: "Nica Nature",
    dept: "Rivas",
    followers: "9.8K",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&auto=format",
    streams: 23,
  },
  {
    name: "León Historia Viva",
    dept: "León",
    followers: "19.1K",
    avatar:
      "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=80&h=80&fit=crop&auto=format",
    streams: 55,
  },
];

export default function LiveView({ onNavigate }: LiveViewProps) {
  const { streams: remoteStreams, error: remoteError } = useLiveStreams({
    pollIntervalMs: 15_000,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");

  const remoteDisplayStreams = remoteStreams.map(toDisplayStream);
  const fallbackDisplayStreams: DisplayStream[] = liveStreams.map((stream) => ({
    ...stream,
  }));
  const displayStreams =
    remoteDisplayStreams.length > 0 ? remoteDisplayStreams : fallbackDisplayStreams;

  const selectedStream =
    displayStreams.find((stream) => stream.id === selectedId) || displayStreams[0];
  const selectedRemoteStream =
    remoteStreams.find((stream) => stream.id === selectedStream.id) || null;

  const filtered =
    filter === "all"
      ? displayStreams
      : filter === "live"
        ? displayStreams.filter((s) => s.isLive)
        : displayStreams.filter((s) => !s.isLive);

  const liveCount = displayStreams.filter((s) => s.isLive).length;

  return (
    <div className="min-h-screen pt-16" style={{ background: "#050D28" }}>
      {/* Header */}
      <div className="px-4 py-6" style={{ borderBottom: "1px solid rgba(26,111,196,0.15)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full animate-pulse-live"
                style={{ background: "#E53E3E" }}
              />
              <h1
                className="text-2xl font-bold"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Streams En Vivo
              </h1>
            </div>
            <p className="text-sm mt-1" style={{ color: "#8BA3C7" }}>
              Creadores de contenido explorando Nicaragua en tiempo real · {liveCount}{" "}
              {liveCount === 1 ? "stream activo" : "streams activos"}
            </p>
          </div>
          <div className="flex gap-2">
            {[
              { value: "all" as const, label: "Todos" },
              { value: "live" as const, label: "🔴 En Vivo" },
              { value: "upcoming" as const, label: "📅 Próximos" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: filter === f.value ? "rgba(229,62,62,0.15)" : "rgba(10,26,66,0.6)",
                  color: filter === f.value ? "#E53E3E" : "#8BA3C7",
                  border:
                    filter === f.value
                      ? "1px solid rgba(229,62,62,0.35)"
                      : "1px solid rgba(26,111,196,0.15)",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured Stream Player */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "#0A1A42",
                border: "1px solid rgba(26,111,196,0.2)",
              }}
            >
              {/* Video area */}
              {selectedRemoteStream ? (
                <LiveStreamPlayer stream={selectedRemoteStream} className="rounded-none border-0" />
              ) : (
                <div className="relative aspect-video" style={{ background: "#050D28" }}>
                  <img
                    src={selectedStream.thumbnail}
                    alt={selectedStream.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {selectedStream.isLive ? (
                      <>
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{
                            background: "rgba(229,62,62,0.15)",
                            border: "2px solid rgba(229,62,62,0.4)",
                          }}
                        >
                          <svg
                            className="w-8 h-8"
                            style={{ color: "#E53E3E" }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                          Stream en vivo
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#8BA3C7" }}>
                          Conecta a través de la plataforma del creador
                        </p>
                      </>
                    ) : (
                      <>
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                          style={{
                            background: "rgba(244,196,48,0.12)",
                            border: "2px solid rgba(244,196,48,0.3)",
                          }}
                        >
                          <svg
                            className="w-8 h-8"
                            style={{ color: "#F4C430" }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                          Próximamente
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#F4C430" }}>
                          {selectedStream.startTime}
                        </p>
                      </>
                    )}
                  </div>

                  {selectedStream.isLive && (
                    <div
                      className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(229,62,62,0.88)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live" />
                      <span className="text-white text-xs font-bold">EN VIVO</span>
                    </div>
                  )}

                  {selectedStream.isLive && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(0,0,0,0.7)" }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        style={{ color: "#8BA3C7" }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: "#F0F6FF" }}>
                        {selectedStream.viewers.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stream info */}
              <div className="p-4">
                <h2
                  className="font-bold text-base mb-2"
                  style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
                >
                  {selectedStream.title}
                </h2>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedStream.avatar}
                      alt={selectedStream.creator}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
                        {selectedStream.creator}
                      </div>
                      <div className="text-xs" style={{ color: "#3B8FE8" }}>
                        📍 {selectedStream.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!selectedStream.isLive && (
                      <div
                        className="px-3 py-1.5 rounded-full text-xs font-semibold"
                        style={{
                          background: "rgba(244,196,48,0.12)",
                          color: "#F4C430",
                          border: "1px solid rgba(244,196,48,0.25)",
                        }}
                      >
                        {selectedStream.startTime}
                      </div>
                    )}
                    <button
                      className="px-4 py-1.5 rounded-full text-xs font-semibold"
                      style={{ background: "#E53E3E", color: "#F0F6FF" }}
                    >
                      {selectedRemoteStream
                        ? "Viendo ahora"
                        : selectedStream.isLive
                          ? "Conectar"
                          : "Recordar"}
                    </button>
                  </div>
                </div>
              </div>
              {remoteError && (
                <p className="px-4 pb-3 text-xs" style={{ color: "#F87171" }}>
                  {remoteError}
                </p>
              )}
            </div>

            {/* Content Creators */}
            <div className="mt-6">
              <h3
                className="text-base font-bold mb-4"
                style={{ fontFamily: "Fraunces, serif", color: "#F0F6FF" }}
              >
                Creadores de Contenido Colaboradores
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {creators.map((creator) => (
                  <div
                    key={creator.name}
                    className="rounded-xl p-4 text-center card-hover"
                    style={{
                      background: "#0A1A42",
                      border: "1px solid rgba(26,111,196,0.15)",
                    }}
                  >
                    <img
                      src={creator.avatar}
                      alt={creator.name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
                      style={{ border: "2px solid rgba(244,196,48,0.3)" }}
                    />
                    <div className="font-semibold text-xs mb-1" style={{ color: "#F0F6FF" }}>
                      {creator.name}
                    </div>
                    <div className="text-xs mb-2" style={{ color: "#3B8FE8" }}>
                      {creator.dept}
                    </div>
                    <div className="flex justify-center gap-3">
                      <div>
                        <div className="text-xs font-bold" style={{ color: "#F4C430" }}>
                          {creator.followers}
                        </div>
                        <div className="text-xs" style={{ color: "#8BA3C7" }}>
                          seguidores
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={{ color: "#27AE60" }}>
                          {creator.streams}
                        </div>
                        <div className="text-xs" style={{ color: "#8BA3C7" }}>
                          streams
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stream List Sidebar */}
          <div>
            <h3 className="text-base font-bold mb-4" style={{ color: "#F0F6FF" }}>
              {filter === "all"
                ? "Todos los Streams"
                : filter === "live"
                  ? "En Vivo Ahora"
                  : "Próximos"}
            </h3>
            <div className="space-y-3">
              {filtered.map((stream) => (
                <button
                  key={stream.id}
                  onClick={() => setSelectedId(stream.id)}
                  className="w-full text-left rounded-xl overflow-hidden transition-all"
                  style={{
                    background:
                      selectedStream.id === stream.id ? "rgba(26,111,196,0.2)" : "#0A1A42",
                    border:
                      selectedStream.id === stream.id
                        ? "1px solid rgba(26,111,196,0.4)"
                        : "1px solid rgba(26,111,196,0.12)",
                  }}
                >
                  <div className="flex gap-3 p-3">
                    <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                      {stream.isLive && (
                        <div
                          className="absolute top-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                          style={{ background: "rgba(229,62,62,0.88)" }}
                        >
                          <span className="w-1 h-1 rounded-full bg-white animate-pulse-live" />
                          <span className="text-white font-bold" style={{ fontSize: "9px" }}>
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-xs font-semibold line-clamp-2 mb-1"
                        style={{ color: "#F0F6FF" }}
                      >
                        {stream.title}
                      </p>
                      <div className="flex items-center gap-1 mb-1">
                        <img
                          src={stream.avatar}
                          alt={stream.creator}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                        <span className="text-xs" style={{ color: "#8BA3C7" }}>
                          {stream.creator}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "#3B8FE8" }}>
                          {stream.department}
                        </span>
                        {stream.isLive ? (
                          <span className="text-xs" style={{ color: "#E53E3E" }}>
                            👁 {stream.viewers.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: "#F4C430" }}>
                            {stream.startTime}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Info box */}
            <div
              className="mt-4 rounded-xl p-4"
              style={{
                background: "rgba(26,111,196,0.08)",
                border: "1px solid rgba(26,111,196,0.2)",
              }}
            >
              <h4 className="text-xs font-bold mb-2" style={{ color: "#3B8FE8" }}>
                ¿Eres creador de contenido?
              </h4>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#8BA3C7" }}>
                Únete a nuestra red de colaboradores y transmite en vivo desde los sitios turísticos
                de Nicaragua. Conectamos creadores con destinos increíbles.
              </p>
              <button
                onClick={() => onNavigate({ type: "auth" })}
                className="w-full py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: "rgba(26,111,196,0.2)",
                  color: "#3B8FE8",
                  border: "1px solid rgba(59,143,232,0.3)",
                }}
              >
                Registrarse como Colaborador
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
