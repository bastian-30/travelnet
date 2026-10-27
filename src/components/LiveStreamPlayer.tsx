import type Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import type { LiveStream } from "../types/domain";

interface LiveStreamPlayerProps {
  stream: LiveStream;
  className?: string;
  allowWebrtc?: boolean;
}

type PlaybackMode = "hls" | "webrtc";

export default function LiveStreamPlayer({
  stream,
  className = "",
  allowWebrtc = true,
}: LiveStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<PlaybackMode>("hls");
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const isLive = stream.status === "live";
  const hlsUrl = stream.playback.hlsUrl;
  const webrtcUrl = stream.playback.webrtcUrl;

  useEffect(() => {
    if (mode !== "hls" || !isLive || !hlsUrl) return;

    const video = videoRef.current;
    if (!video) return;
    const media = video;

    setPlayerError(null);
    let hls: Hls | null = null;
    let networkRetries = 0;
    let disposed = false;

    if (media.canPlayType("application/vnd.apple.mpegurl")) {
      media.src = hlsUrl;
      media.play().catch(() => undefined);
      return () => {
        media.removeAttribute("src");
        media.load();
      };
    }

    async function setupPlayer() {
      const { default: HlsPlayer } = await import("hls.js");
      if (disposed) return;

      if (!HlsPlayer.isSupported()) {
        setPlayerError("Tu navegador no soporta reproducción HLS.");
        return;
      }

      hls = new HlsPlayer({
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        backBufferLength: 30,
        maxLiveSyncPlaybackRate: 1.5,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(media);

      hls.on(HlsPlayer.Events.MANIFEST_PARSED, () => {
        media.play().catch(() => undefined);
      });

      hls.on(HlsPlayer.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;

        if (data.type === HlsPlayer.ErrorTypes.NETWORK_ERROR && networkRetries < 2) {
          networkRetries += 1;
          window.setTimeout(() => hls?.startLoad(), 1500 * networkRetries);
          return;
        }

        if (data.type === HlsPlayer.ErrorTypes.MEDIA_ERROR) {
          hls?.recoverMediaError();
          return;
        }

        setPlayerError("La señal no está disponible en este momento.");
        hls?.destroy();
      });
    }

    setupPlayer().catch(() => {
      if (!disposed) {
        setPlayerError("No se pudo cargar el reproductor HLS.");
      }
    });

    return () => {
      disposed = true;
      hls?.destroy();
      hls = null;
      media.removeAttribute("src");
      media.load();
    };
  }, [hlsUrl, isLive, mode, retryKey]);

  if (!isLive) {
    return (
      <div
        className={`relative aspect-video overflow-hidden rounded-xl ${className}`}
        style={{
          background: "#0A1A42",
          border: "1px solid rgba(26,111,196,0.2)",
        }}
      >
        {stream.thumbnailUrl && (
          <img
            src={stream.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: "rgba(244,196,48,0.1)",
              border: "1px solid rgba(244,196,48,0.3)",
            }}
          >
            <svg
              className="h-6 w-6"
              style={{ color: "#F4C430" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#F0F6FF" }}>
              {stream.status === "scheduled" ? "Transmisión programada" : "Transmisión finalizada"}
            </p>
            <p className="mt-1 text-xs" style={{ color: "#8BA3C7" }}>
              {stream.scheduledFor
                ? new Date(stream.scheduledFor).toLocaleString("es-NI")
                : "El video estará disponible cuando el colaborador inicie el directo."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative aspect-video overflow-hidden rounded-xl ${className}`}
      style={{ background: "#050D28", border: "1px solid rgba(229,62,62,0.3)" }}
    >
      {mode === "hls" ? (
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          controls
          playsInline
          poster={stream.thumbnailUrl || undefined}
        />
      ) : (
        <iframe
          src={webrtcUrl}
          title={stream.title}
          className="h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      )}

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
          style={{ background: "rgba(229,62,62,0.92)" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" />
          EN VIVO
        </span>
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.68)", color: "#F0F6FF" }}
        >
          {stream.viewerCount.toLocaleString("es-NI")} espectadores
        </span>
      </div>

      {allowWebrtc && (
        <div className="absolute right-3 top-3 flex overflow-hidden rounded-lg bg-black/70 p-0.5">
          {(["hls", "webrtc"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className="rounded-md px-2.5 py-1 text-xs font-semibold uppercase"
              style={{
                background: mode === option ? "#F4C430" : "transparent",
                color: mode === option ? "#050D28" : "#8BA3C7",
              }}
            >
              {option === "hls" ? "HLS" : "WebRTC"}
            </button>
          ))}
        </div>
      )}

      {playerError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#050D28]/90 px-6 text-center">
          <p className="text-sm" style={{ color: "#F0F6FF" }}>
            {playerError}
          </p>
          <button
            type="button"
            onClick={() => setRetryKey((value) => value + 1)}
            className="rounded-lg px-4 py-2 text-xs font-bold"
            style={{ background: "#1A6FC4", color: "#F0F6FF" }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
