import dotenv from "dotenv";

dotenv.config({ path: "server/.env" });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value.trim();
}

function optionalEnv(name: string, fallback = ""): string {
  return (process.env[name] || fallback).trim();
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

const antMediaBaseUrl = stripTrailingSlash(optionalEnv("ANT_MEDIA_URL", "http://127.0.0.1:5080"));
const antMediaApp = optionalEnv("ANT_MEDIA_APP", "LiveApp");
const antMediaRtmpBase = stripTrailingSlash(
  optionalEnv("ANT_MEDIA_RTMP_URL", "rtmp://127.0.0.1:1935"),
);
const antMediaHlsBase = stripTrailingSlash(
  optionalEnv("ANT_MEDIA_HLS_URL", `${antMediaBaseUrl}/${antMediaApp}/streams`),
);
const antMediaWebrtcBase = stripTrailingSlash(
  optionalEnv("ANT_MEDIA_WEBRTC_URL", `${antMediaBaseUrl}/${antMediaApp}/play.html?name=`),
);

export const config = {
  port: Number(optionalEnv("PORT", "3000")),
  frontendOrigin: optionalEnv(
    "FRONTEND_ORIGIN",
    "http://localhost:8443,http://localhost:5173,http://127.0.0.1:8443,http://127.0.0.1:5173",
  ),
  databaseUrl: requireEnv("DATABASE_URL"),
  firebaseProjectId: optionalEnv("FIREBASE_PROJECT_ID", "travelnet-53faa"),
  streamKeyEncryptionKey: requireEnv("STREAM_KEY_ENCRYPTION_KEY"),
  antMedia: {
    baseUrl: antMediaBaseUrl,
    app: antMediaApp,
    rtmpServer: `${antMediaRtmpBase}/${antMediaApp}`,
    hlsBase: antMediaHlsBase,
    webrtcBase: antMediaWebrtcBase,
    webhookSecret: optionalEnv("ANT_MEDIA_WEBHOOK_SECRET"),
  },
};
