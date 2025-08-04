import { Router } from "express"
import { handleInputErrors } from "../middleware/validation"
import { CustomerController } from "../controllers/CustomerController"
import { body } from "express-validator"


const router = Router()

router.post('/', 
    body('first_name').notEmpty().withMessage('El nombre no puede ir vacio'),
    handleInputErrors,
    CustomerController.create
)

export default router