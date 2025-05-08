import { Request, Response ,NextFunction } from "express";
import Appointment from "../models/Appointment";
import { param, validationResult } from "express-validator";

declare global {
    namespace Express {
        interface Request {
            appointment: Appointment
        }
    }
}

export const validateAppointmentId = async (req: Request, res: Response, next: NextFunction) => {
    await param('appointmentId').isInt().withMessage('ID no válido').bail()
        .custom(value => value > 0).withMessage('ID no válido').bail().run(req)
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

//validar si un servicio existe al momento de pasar el parametro a la API
export const validateAppointmentExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { appointmentId } = req.params
        const appointment = await Appointment.findByPk(appointmentId)
        if(!appointment) {
            const error = new Error('Cita no encontrada')
            res.status(404).json({ error: error.message })
            return
        }
        req.appointment = appointment
        next()
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error' })
        return
    }
}