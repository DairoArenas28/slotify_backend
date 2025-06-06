import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { authenticate } from "../middleware/auth";

const router = Router()

router.use(authenticate)

router.get('/user',
    AdminController.getUserByClient
)

router.get('/appointment',
    AdminController.getAppointment
)

router.get('/calendar',
    AdminController.getAppointment
)

router.get('/finance', 
    AdminController.getFinanceData
);

export default router