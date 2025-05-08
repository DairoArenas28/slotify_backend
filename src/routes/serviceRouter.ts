import { Router } from "express";
import { body } from "express-validator";
import { ServiceController } from "../controllers/ServiceController";
import { handleInputErrors } from "../middleware/validation";

const router = Router()

//Enpoint para servicios
//Obtener todos los servicios
router.get('/', 
    ServiceController.getAll
)

//Obtener un servicios
router.get('/:serviceId', 
    ServiceController.getById
)

//Crear un servicio
//Se debe enviar los datos del servicio para agregar y validar esos datos express-validation
router.post('/', 
    body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
    handleInputErrors,
    ServiceController.create
)

//Actualizar un servicio
router.put('/:serviceId', 
    ServiceController.updateById
)

//Eliminar un servicio
router.delete('/:serviceId', 
    ServiceController.deleteById
)

export default router
