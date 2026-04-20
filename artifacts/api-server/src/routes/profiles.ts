import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import {
  GetCurrentProfileResponse,
  UpdateCurrentProfileBody,
  UpdateCurrentProfileResponse,
} from "@workspace/api-zod";
import { db, userProfilesTable, type UserProfile } from "@workspace/db";
import { z } from "zod";

export type AppRequest = Request & {
  userId?: string;
};

const router: IRouter = Router();

// ─── Approved names list ─────────────────────────────────────────────────────
const APPROVED_NAMES_RAW = [
  "Daniel Castaneda",
  "Tatiana Leal",
  "Pedro Gonzalez",
  "Jonatan Baez",
  "Fernando Barrera",
  "Javier Espinola",
  "Gustavo Mancuello Baez",
  "Cristian Martinez",
  "Gonzalo Perez",
  "Guillermo Pipet",
  "Nahuel Ueki",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const APPROVED_NAMES = APPROVED_NAMES_RAW.map(normalize);

function isApprovedName(firstName: string, lastName: string): boolean {
  const enteredWords = [firstName, lastName]
    .flatMap((s) => normalize(s).split(/\s+/))
    .filter((w) => w.length > 1);

  if (enteredWords.length < 2) return false;

  return APPROVED_NAMES.some((approved) =>
    enteredWords.every((word) => approved.includes(word)),
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getClaimString(claims: unknown, keys: string[]): string {
  if (!claims || typeof claims !== "object") return "";
  const record = claims as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getClerkEmail(req: AppRequest): string {
  const auth = getAuth(req);
  const claims = auth?.sessionClaims;
  return getClaimString(claims, ["email", "email_address", "primary_email_address"]);
}

export function requireAuth(req: AppRequest, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const claims = auth?.sessionClaims as Record<string, unknown> | undefined;
  const userId =
    (claims?.userId as string | undefined) ||
    auth?.userId ||
    (claims?.sub as string | undefined);

  if (!userId) {
    res.status(401).json({ error: "Debe iniciar sesión" });
    return;
  }

  req.userId = userId;
  next();
}

export function serializeProfile(profile: UserProfile) {
  return {
    ...profile,
    role: profile.role === "supervisor" ? "supervisor" : "technician",
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

/** Returns the profile for the current user, or null if not yet set up. */
export async function getExistingProfile(req: AppRequest): Promise<UserProfile | null> {
  if (!req.userId) return null;
  const [existing] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, req.userId))
    .limit(1);
  return existing ?? null;
}

/** Returns profile or throws 403 if not set up yet (used by service-report routes). */
export async function requireProfile(req: AppRequest, res: Response): Promise<UserProfile | null> {
  const profile = await getExistingProfile(req);
  if (!profile) {
    res.status(403).json({ error: "Perfil no configurado. Completá tu registro primero." });
    return null;
  }
  return profile;
}

/** Legacy alias used by serviceReports.ts — behaves like requireProfile. */
export async function getOrCreateProfile(req: AppRequest): Promise<UserProfile> {
  const profile = await getExistingProfile(req);
  if (!profile) {
    throw Object.assign(new Error("Perfil no configurado"), { statusCode: 403 });
  }
  return profile;
}

// ─── GET /profile ─────────────────────────────────────────────────────────────
router.get("/profile", requireAuth, async (req: AppRequest, res): Promise<void> => {
  const profile = await getExistingProfile(req);
  if (!profile) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }
  res.json(GetCurrentProfileResponse.parse(serializeProfile(profile)));
});

// ─── POST /profile/setup ──────────────────────────────────────────────────────
const SetupBody = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

router.post("/profile/setup", requireAuth, async (req: AppRequest, res): Promise<void> => {
  const existing = await getExistingProfile(req);
  if (existing) {
    res.json(GetCurrentProfileResponse.parse(serializeProfile(existing)));
    return;
  }

  const parsed = SetupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Nombre y apellido son requeridos" });
    return;
  }

  const { firstName, lastName } = parsed.data;

  if (!isApprovedName(firstName, lastName)) {
    res.status(403).json({
      error: "Tu nombre no está en la lista de usuarios autorizados. Contactá al administrador.",
    });
    return;
  }

  const email = getClerkEmail(req);
  const displayName = `${firstName} ${lastName}`.trim();

  const [profile] = await db
    .insert(userProfilesTable)
    .values({
      userId: req.userId!,
      displayName,
      email,
      role: "technician",
    })
    .returning();

  res.status(201).json(GetCurrentProfileResponse.parse(serializeProfile(profile)));
});

// ─── PATCH /profile ───────────────────────────────────────────────────────────
router.patch("/profile", requireAuth, async (req: AppRequest, res): Promise<void> => {
  const profile = await getExistingProfile(req);
  if (!profile) {
    res.status(404).json({ error: "Perfil no encontrado" });
    return;
  }

  const parsed = UpdateCurrentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(userProfilesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(userProfilesTable.userId, req.userId!))
    .returning();

  res.json(UpdateCurrentProfileResponse.parse(serializeProfile(updated)));
});

export default router;
