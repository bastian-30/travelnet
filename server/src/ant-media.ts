import { config } from "./config.js";

export function playbackUrls(streamId: string | null | undefined) {
  return {
    hlsUrl: `${config.antMedia.hlsBase}/${streamId}.m3u8`,
    webrtcUrl: `${config.antMedia.webrtcBase}${encodeURIComponent(String(streamId ?? ""))}`,
  };
}

export function rtmpCredentials(
  streamId: string | null | undefined,
  streamKey: string | null | undefined,
) {
  return {
    streamId,
    streamKey,
    rtmpServer: config.antMedia.rtmpServer,
    hlsUrl: playbackUrls(streamId).hlsUrl,
    webrtcUrl: playbackUrls(streamId).webrtcUrl,
  };
}
