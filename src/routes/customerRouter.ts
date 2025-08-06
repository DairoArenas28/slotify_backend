import { Router } from "express"
import { handleInputErrors } from "../middleware/validation"
import { CustomerController } from "../controllers/CustomerController"
import { body } from "express-validator"
import { authenticate } from "../middleware/auth"
import { validateCustomerExists, validateCustomerId } from "../middleware/customer"


const router = Router()

router.use(authenticate)
router.param('customerId', validateCustomerId)
router.param('customerId', validateCustomerExists)

router.get('/', 
    handleInputErrors,
    CustomerController.getAll
)

router.get('/paginationAll', 
    CustomerController.getPaginationAll
)

//Obtener un servicios
router.get('/:customerId', 
    CustomerController.getById
)

router.post('/', 
    body('first_name').notEmpty().withMessage('El nombre no puede ir vacio'),
    handleInputErrors,
    CustomerController.create
)

router.put('/:customerId', 
    CustomerController.updateById
)

export default router