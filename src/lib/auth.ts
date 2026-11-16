import "server-only";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";

/**
 * Acceso al panel con una contraseña única del local.
 * - Si el local ya la cambió desde Ajustes, se usa esa (guardada cifrada en la base, fila "admin").
 * - Si no, se usa la inicial de ADMIN_PASSWORD (.env.local / Vercel).
 * La cookie va firmada con HMAC; al cambiar la contraseña se cierran todas las sesiones abiertas.
 * Si se olvidan la contraseña: borrar la fila "admin" de la tabla Setting y vuelve a valer ADMIN_PASSWORD.
 */
const COOKIE = "lp_admin";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 días
const ADMIN_KEY = "admin";
export const MIN_PASSWORD = 8;

// En producción (Vercel) SESSION_SECRET es obligatoria: sin ella el panel no deja entrar.
// En la compu, si faltan, se usan valores de prueba.
const isProd = process.env.NODE_ENV === "production";
const envPassword = () => process.env.ADMIN_PASSWORD || (isProd ? "" : "liberados2026");
const sessionSecret = () => process.env.SESSION_SECRET || (isProd ? "" : "dev-secret");

type Stored = { salt: string; hash: string };
const hashOf = (pass: string, salt: string) => scryptSync(pass, salt, 64).toString("base64url");

async function stored(): Promise<Stored | null> {
  const row = await prisma.setting.findUnique({ where: { key: ADMIN_KEY } });
  const v = row?.value as Partial<Stored> | undefined;
  return v?.salt && v?.hash ? { salt: v.salt, hash: v.hash } : null;
}

/** Lo que identifica a la contraseña vigente (cambia la contraseña → cambia la firma → se cierran las sesiones). */
async function current() {
  const s = await stored();
  if (s) return { stored: s, key: s.hash };
  const p = envPassword();
  return { stored: null, key: p };
}

async function signer() {
  const c = await current();
  const secret = sessionSecret();
  if (!c.key || (isProd && !secret)) return null;
  return (value: string) => createHmac("sha256", secret + c.key).update(value).digest("base64url");
}

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export async function checkPassword(input: string) {
  if (isProd && !sessionSecret()) return false;
  const c = await current();
  if (c.stored) return same(hashOf(input, c.stored.salt), c.stored.hash);
  return !!c.key && same(input, c.key);
}

/** Guarda la contraseña nueva (cifrada). Las sesiones anteriores dejan de valer. */
export async function setPassword(next: string) {
  const salt = randomBytes(16).toString("base64url");
  const value = { salt, hash: hashOf(next, salt) };
  await prisma.setting.upsert({ where: { key: ADMIN_KEY }, create: { key: ADMIN_KEY, value }, update: { value } });
}

export async function createSession() {
  const sign = await signer();
  if (!sign) return;
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
  const sign = await signer();
  return !!sign && same(sign(exp), sig);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin-lp/login");
}
