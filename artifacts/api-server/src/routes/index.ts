import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import serviceReportsRouter from "./serviceReports";
import allowedUsersRouter, { seedAllowedUsersIfEmpty } from "./allowedUsers";
import mobileReportsRouter from "./mobileReports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(serviceReportsRouter);
router.use(allowedUsersRouter);
router.use(mobileReportsRouter);

seedAllowedUsersIfEmpty().catch((err) => {
  console.error("Failed to seed allowed users:", err);
});

export default router;
