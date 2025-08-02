import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { body } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { UserController } from "../controllers/UserController";

const router = Router()

router.use(authenticate)

router.get('/', 
    UserController.getAll
)
router.get('/paginationAll', 
    UserController.getPaginationAll
)
router.post('/', 
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    handleInputErrors,
    UserController.create
)

export default router