import { Router } from "express";
import { validateServiceExists, validateServiceId } from "../middleware/service";
import { AppointmentController } from "../controllers/AppointmentController";
import { authenticate } from "../middleware/auth";
import { validateAppointmentConflict, validateAppointmentExists, validateAppointmentId } from "../middleware/appointment";
import { param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";

const router = Router()

router.use(authenticate)
router.param('serviceId', validateServiceId)
router.param('serviceId', validateServiceExists)

router.param('appointmentId', validateAppointmentId)
router.param('appointmentId', validateAppointmentExists)


//Enpoint para appointment

//Obtener todos los appointment segun el usuario ingresado en el sistema
router.get('/',
    AppointmentController.getAll
)

//Obtener un appointment con el id
router.get('/id/:appointmentId', 
    AppointmentController.getById
)

//Obtener appointment segun la fecha
router.get('/date/:date',
    param('date').isDate().withMessage('Fecha no válida'),
    handleInputErrors,
    AppointmentController.getByDate
)

router.get('/available-hours/:date', 
    param('date').isDate().withMessage('Fecha no válida'),
    AppointmentController.getAvailableHours
);

//Agendar una cita
router.post('/:serviceId', 
    validateAppointmentConflict,
    AppointmentController.create
)

//Editar una cita 
router.put('/:appointmentId', 
    AppointmentController.updateById
)

//Eliminar una cita 
router.delete('/:appointmentId', 
    AppointmentController.deleteById
)


export default router