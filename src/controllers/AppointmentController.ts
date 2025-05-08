import { Request, Response } from "express"
import Appointment from "../models/Appointment"
import Service from "../models/Services"

export class AppointmentController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const appointment = await Appointment.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user.id
                }
            })

            res.json(appointment)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }

    }

    static getById = async (req: Request, res: Response) => {
        const appointment = await Appointment.findByPk(req.appointment.id, {
            include: [Service]
        })
        res.json(appointment)

    }

    static create = async (req: Request, res: Response) => {
        const { serviceId } = req.params
        const { date, start_time, end_time } = req.body;
        const { id: userId } = req.user
        try {
            const appointment = await Appointment.create({
                serviceId: parseInt(serviceId),
                userId,
                date,
                start_time,
                end_time,
                status: 'reservado'
            });

            res.status(201).json('Agenda creada correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error al agendar la cita', error });
        }
    }
}