import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profilesRouter from "./profiles";
import serviceReportsRouter from "./serviceReports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profilesRouter);
router.use(serviceReportsRouter);

export default router;
