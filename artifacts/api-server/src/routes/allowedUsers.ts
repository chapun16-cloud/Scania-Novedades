import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, allowedUsersTable, userProfilesTable } from "@workspace/db";
import { z } from "zod";
import { requireAuth, getExistingProfile, type AppRequest } from "./profiles";
import type { Response } from "express";

const router: IRouter = Router();

const INITIAL_APPROVED: { displayName: string; isSupervisor: boolean }[] = [
  { displayName: "Daniel Castaneda", isSupervisor: true },
  { displayName: "Tatiana Leal", isSupervisor: true },
  { displayName: "Marcos Damian Ferrara", isSupervisor: true },
  { displayName: "Pedro Gonzalez", isSupervisor: false },
  { displayName: "Jonatan Baez", isSupervisor: false },
  { displayName: "Fernando Barrera", isSupervisor: false },
  { displayName: "Javier Espinola", isSupervisor: false },
  { displayName: "Gustavo Mancuello Baez", isSupervisor: false },
  { displayName: "Cristian Martinez", isSupervisor: false },
  { displayName: "Gonzalo Perez", isSupervisor: false },
  { displayName: "Guillermo Pipet", isSupervisor: false },
  { displayName: "Nahuel Ueki", isSupervisor: false },
  { displayName: "Juan Duarte", isSupervisor: false },
];

export async function seedAllowedUsersIfEmpty(): Promise<void> {
  const existing = await db.select().from(allowedUsersTable).limit(1);
  if (existing.length === 0) {
    await db.insert(allowedUsersTable).values(INITIAL_APPROVED);
  }
}

router.get("/allowed-users", requireAuth, async (req: AppRequest, res: Response): Promise<void> => {
  const profile = await getExistingProfile(req);
  if (!profile || profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede ver la lista de usuarios permitidos" });
    return;
  }
  const list = await db
    .select({
      id: allowedUsersTable.id,
      displayName: allowedUsersTable.displayName,
      isSupervisor: allowedUsersTable.isSupervisor,
      createdAt: allowedUsersTable.createdAt,
      defaultShift: userProfilesTable.defaultShift,
      registered: sql<boolean>`(${userProfilesTable.id} IS NOT NULL)`,
    })
    .from(allowedUsersTable)
    .leftJoin(
      userProfilesTable,
      sql`LOWER(${userProfilesTable.displayName}) = LOWER(${allowedUsersTable.displayName})`,
    )
    .orderBy(allowedUsersTable.displayName);
  res.json(list);
});

const AddBody = z.object({
  displayName: z.string().min(2).max(120),
  isSupervisor: z.boolean().optional().default(false),
});

router.post("/allowed-users", requireAuth, async (req: AppRequest, res: Response): Promise<void> => {
  const profile = await getExistingProfile(req);
  if (!profile || profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede agregar usuarios" });
    return;
  }
  const parsed = AddBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Nombre inválido" });
    return;
  }
  const [inserted] = await db
    .insert(allowedUsersTable)
    .values({ displayName: parsed.data.displayName.trim(), isSupervisor: parsed.data.isSupervisor })
    .returning();
  res.status(201).json(inserted);
});

router.delete("/allowed-users/:id", requireAuth, async (req: AppRequest, res: Response): Promise<void> => {
  const profile = await getExistingProfile(req);
  if (!profile || profile.role !== "supervisor") {
    res.status(403).json({ error: "Solo el supervisor puede eliminar usuarios" });
    return;
  }
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  const [deleted] = await db
    .delete(allowedUsersTable)
    .where(eq(allowedUsersTable.id, id))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }
  res.json({ ok: true });
});

export default router;
