import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { seed } from "./seed";
import type { DB, PublicProduct } from "./types";

/**
 * Base de datos local en un archivo JSON (data/db.json).
 * Ideal para la demo y para un local con un solo panel.
 * Cuando haga falta (varios usuarios, hosting serverless), se reemplaza
 * este archivo por Supabase/Postgres manteniendo las mismas funciones.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();

export async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(seed, null, 2));
    return structuredClone(seed);
  }
}

/** Lee, modifica y guarda de forma atómica (una escritura por vez). */
export function mutateDB<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await readDB();
    const result = await fn(db);
    const tmp = DB_FILE + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, DB_FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function getPublicData() {
  const db = await readDB();
  const products: PublicProduct[] = db.products
    .filter((p) => p.visible)
    .map(({ cost: _cost, ...rest }) => rest);
  return { products, settings: db.settings };
}

export function uid(prefix = "") {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
