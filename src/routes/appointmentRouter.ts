import { Router } from "express";
import { validateServiceExists, validateServiceId } from "../middleware/service";
import { AppointmentController } from "../controllers/AppointmentController";
import { authenticate } from "../middleware/auth";
import { validateAppointmentExists, validateAppointmentId } from "../middleware/appointment";

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
router.get('/:appointmentId', 
    AppointmentController.getById
)


//Agendar una cita
router.post('/:serviceId', 
    AppointmentController.create
)



export default router