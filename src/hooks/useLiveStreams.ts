import { useCallback, useEffect, useState } from "react";
import { getStreams } from "../services/streamService";
import type { LiveStream } from "../types/domain";

interface UseLiveStreamsOptions {
  departmentId?: string;
  siteId?: string;
  status?: "scheduled" | "live";
  pollIntervalMs?: number;
}

export function useLiveStreams({
  departmentId,
  siteId,
  status,
  pollIntervalMs = 0,
}: UseLiveStreamsOptions = {}) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getStreams({ departmentId, siteId, status });
        if (!cancelled) {
          setStreams(result);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudieron cargar las transmisiones",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    if (pollIntervalMs > 0) {
      const timer = window.setInterval(load, pollIntervalMs);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [departmentId, siteId, status, pollIntervalMs, reloadToken]);

  return { streams, isLoading, error, refresh };
}
