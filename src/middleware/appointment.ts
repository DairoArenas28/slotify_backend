import { Request, Response, NextFunction } from "express";
import { Op } from 'sequelize'
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
    const { date, start_time, end_time } = req.body;

    if (!date || !start_time || !end_time) {
        res.status(400).json({ error: 'Missing date, startTime or endTime.' });
        return
    }
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const conflictingAppointments = await Appointment.findOne({
            where: {
                userId: req.user.id,
                date: {
                    [Op.between]: [startOfDay, endOfDay],
                },
                [Op.or]: [
                    {
                        start_time: {
                            [Op.between]: [start_time, end_time]
                        }
                    },
                    {
                        end_time: {
                            [Op.between]: [start_time, end_time]
                        }
                    },
                    {
                        [Op.and]: [
                            { start_time: { [Op.lte]: start_time } },
                            { end_time: { [Op.gte]: end_time } }
                        ]
                    }
                ]
            }
        });
        //console.log(conflictingAppointments)
        if (conflictingAppointments) {
            res.status(409).json({ error: 'This time slot is already taken.' });
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