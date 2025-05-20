import { Request, Response, NextFunction } from "express";
import { Op } from 'sequelize'
import Appointment from "../models/Appointment";
import { param, validationResult } from "express-validator";
import { addMinutes, subMinutes } from "../utils/date";

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

//Validar el parametro fecha al recibir una peticion
export const validateAppointmentDate = async (req: Request, res: Response, next: NextFunction) => {
    await param('date').isDate().withMessage('Fecha no válida').bail().run(req)
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
        if (!appointment) {
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


//Validar que al momento de crear una cita, no se cruce con ningun horario
//Debo sumarle un minuto al start_time y restarle un minuto al end_time
export const validateAppointmentConflict = async (req: Request, res: Response, next: NextFunction) => {
    const { id: serviceId, name, duration_minutes } = req.service
    const { date, start_time, service } = req.body;
    const [year, month, day] = date.split('-').map(Number)
    const end_time = addMinutes(start_time,duration_minutes)

    if (!date || !start_time) {
        res.status(400).json({ error: 'Missing date, startTime or endTime.' });
        return
    }
    // 👇 Esto crea la fecha a medianoche LOCAL
    const localDate = new Date(year, month - 1, day);

    const start = new Date(localDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(localDate);
    end.setHours(23, 59, 59, 999);

    
    const adjustedStartTime = addMinutes(start_time, 1) 
    const adjustedEndTime = subMinutes(end_time, 1)

    try {
        const conflictingAppointments = await Appointment.findOne({
            where: {
                userId: req.user.id,
                date: {
                    [Op.between]: [start, end],
                },
                [Op.or]: [
                    {
                        start_time: {
                            [Op.between]: [adjustedStartTime, adjustedEndTime]
                        }
                    },
                    {
                        end_time: {
                            [Op.between]: [adjustedStartTime, adjustedEndTime]
                        }
                    },
                    {
                        [Op.and]: [
                            { start_time: { [Op.lte]: adjustedStartTime } },
                            { end_time: { [Op.gte]: adjustedEndTime } }
                        ]
                    }
                ]
            }
        });
        //console.log(conflictingAppointments)
        if (conflictingAppointments) {
            res.status(409).json({ error: 'Este horario ya está ocupado.' });
            return;
        }

        next();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
/*
,
        [Op.and]: [
          {
            start_time: {
              [Op.lt]: end_time
            },
            end_time: {
              [Op.gt]: start_time
            }
          }
        ]
*/