import crypto from "node:crypto";
import { config } from "./config.js";

export interface EncryptedStreamKey {
  ciphertext: string;
  iv: string;
  tag: string;
}

function getEncryptionKey(): Buffer {
  const raw = config.streamKeyEncryptionKey;
  const asHex = /^[0-9a-f]{64}$/i.test(raw) ? Buffer.from(raw, "hex") : Buffer.from(raw, "base64");

  if (asHex.length === 32) {
    return asHex;
  }

  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

const encryptionKey = getEncryptionKey();

export function generateStreamKey(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function encryptStreamKey(streamKey: string): EncryptedStreamKey {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const ciphertext = Buffer.concat([cipher.update(streamKey, "utf8"), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptStreamKey({ ciphertext, iv, tag }: EncryptedStreamKey): string {
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
