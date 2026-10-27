import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "./config.js";

const jwks = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export interface FirebaseIdTokenPayload {
  sub: string;
  email?: string;
  name?: string;
  aud?: string | string[];
  iss?: string;
}

export async function verifyFirebaseIdToken(token: string): Promise<FirebaseIdTokenPayload> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer: `https://securetoken.google.com/${config.firebaseProjectId}`,
    audience: config.firebaseProjectId,
  });

  if (!payload.sub) {
    throw new Error("Token sin sujeto");
  }

  return payload as FirebaseIdTokenPayload;
}
