import { Router } from "express";
import { validateServiceExists, validateServiceId } from "../middleware/service";
import { AppointmentController } from "../controllers/AppointmentController";
import { authenticate } from "../middleware/auth";
import { validateAppointmentConflict, validateAppointmentDate, validateAppointmentExists, validateAppointmentId } from "../middleware/appointment";

const router = Router()

router.use(authenticate)
router.param('serviceId', validateServiceId)
router.param('serviceId', validateServiceExists)

router.param('appointmentId', validateAppointmentId)
router.param('appointmentId', validateAppointmentExists)

router.param('date', validateAppointmentDate)


//Enpoint para appointment

//
router.get('/',
    AppointmentController.getAll
)
//Obtener todos los appointment segun el usuario ingresado en el sistema
router.get('/user',
    AppointmentController.getUserAll
)

//Obtener un appointment con un estado
router.get('/calendar/:status', 
    AppointmentController.getByCalendar
)

//Obtener un appointment con un estado
router.get('/status/:status', 
    AppointmentController.getByStatus
)

//Obtener un appointment con el id
router.get('/id/:appointmentId', 
    AppointmentController.getById
)

//Obtener appointment segun la fecha
router.get('/date/:date',
    AppointmentController.getByDate
)

//Validar disponibilidad
router.get('/available-hours/:date', 
    AppointmentController.getAvailableHours
);

//Agendar una cita
router.post('/:serviceId', 
    validateAppointmentConflict,
    AppointmentController.create
)

//Editar una cita 
router.put('/:appointmentId/service/:serviceId', 
    validateAppointmentConflict,
    AppointmentController.updateById
)

//Eliminar una cita 
router.delete('/:appointmentId', 
    AppointmentController.deleteById
)


export default router