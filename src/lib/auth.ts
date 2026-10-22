import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Acceso al panel con una contraseña única del local (ADMIN_PASSWORD en .env.local).
 * La cookie va firmada con HMAC; si cambia la contraseña, se cierran todas las sesiones.
 */
const COOKIE = "lp_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 días

const password = () => process.env.ADMIN_PASSWORD || "liberados2026";
const secret = () => (process.env.SESSION_SECRET || "dev-secret") + password();

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function checkPassword(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return false;
  const [exp, sig] = raw.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = Buffer.from(sign(exp));
  const got = Buffer.from(sig);
  return expected.length === got.length && timingSafeEqual(expected, got);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin-lp/login");
}
