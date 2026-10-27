import crypto from "node:crypto";
import fs from "node:fs/promises";

const target = ".env.docker";

try {
  await fs.access(target);
  if (!process.argv.includes("--force")) {
    console.error(`${target} ya existe. Usa --force para regenerarlo.`);
    process.exit(1);
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

const template = await fs.readFile(".env.docker.example", "utf8");
const replacements: Record<string, string> = {
  "change-this-url-safe-password": crypto.randomBytes(24).toString("hex"),
  "change-this-for-a-random-secret-of-at-least-32-characters": crypto
    .randomBytes(48)
    .toString("hex"),
  "change-this-for-a-32-byte-base64-key": crypto.randomBytes(32).toString("base64"),
  "change-this-webhook-secret": crypto.randomBytes(24).toString("hex"),
};

let content = template;
for (const [placeholder, value] of Object.entries(replacements)) {
  content = content.replaceAll(placeholder, value);
}

await fs.writeFile(target, content, { mode: 0o600 });
console.log(`${target} generado con secretos aleatorios.`);
