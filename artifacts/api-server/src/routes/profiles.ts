import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import {
  GetCurrentProfileResponse,
  UpdateCurrentProfileBody,
  UpdateCurrentProfileResponse,
} from "@workspace/api-zod";
import { db, userProfilesTable, type UserProfile } from "@workspace/db";

export type AppRequest = Request & {
  userId?: string;
};

const router: IRouter = Router();

function getClaimString(claims: unknown, keys: string[]): string {
  if (!claims || typeof claims !== "object") return "";
  const record = claims as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function requireAuth(req: AppRequest, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  const claims = auth?.sessionClaims as Record<string, unknown> | undefined;
  const userId = (claims?.userId as string | undefined) || auth?.userId || (claims?.sub as string | undefined);

  if (!userId) {
    res.status(401).json({ error: "Debe iniciar sesión" });
    return;
  }

  const email = getClaimString(claims, ["email", "email_address", "primary_email_address"]);
  if (email && !email.toLowerCase().endsWith("@scania.com")) {
    res.status(403).json({ error: "Acceso restringido al dominio @scania.com" });
    return;
  }

  req.userId = userId;
  next();
}

function profileSeed(req: AppRequest) {
  const auth = getAuth(req);
  const claims = auth?.sessionClaims;
  const email = getClaimString(claims, ["email", "email_address", "primary_email_address"]);
  const firstName = getClaimString(claims, ["first_name", "given_name"]);
  const lastName = getClaimString(claims, ["last_name", "family_name"]);
  const fullName = getClaimString(claims, ["name", "full_name"]);
  const displayName = fullName || [firstName, lastName].filter(Boolean).join(" ") || email || "Técnico";
  return { displayName, email };
}

export function serializeProfile(profile: UserProfile) {
  return {
    ...profile,
    role: profile.role === "supervisor" ? "supervisor" : "technician",
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export async function getOrCreateProfile(req: AppRequest): Promise<UserProfile> {
  if (!req.userId) throw new Error("Missing authenticated user");

  const [existing] = await db
    .select()
    .from(userProfilesTable)
    .where(eq(userProfilesTable.userId, req.userId))
    .limit(1);

  if (existing) return existing;

  const seed = profileSeed(req);
  const [created] = await db
    .insert(userProfilesTable)
    .values({
      userId: req.userId,
      displayName: seed.displayName,
      email: seed.email,
      role: "technician",
    })
    .returning();

  return created;
}

router.get("/profile", requireAuth, async (req: AppRequest, res): Promise<void> => {
  const profile = await getOrCreateProfile(req);
  res.json(GetCurrentProfileResponse.parse(serializeProfile(profile)));
});

router.patch("/profile", requireAuth, async (req: AppRequest, res): Promise<void> => {
  const parsed = UpdateCurrentProfileBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid profile update body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await getOrCreateProfile(req);

  const [profile] = await db
    .update(userProfilesTable)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(userProfilesTable.userId, req.userId!))
    .returning();

  res.json(UpdateCurrentProfileResponse.parse(serializeProfile(profile)));
});

export default router;
