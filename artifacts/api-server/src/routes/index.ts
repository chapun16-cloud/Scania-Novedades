import { Router, type IRouter } from "express";
import healthRouter from "./health";
import serviceReportsRouter from "./serviceReports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(serviceReportsRouter);

export default router;
