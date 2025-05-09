import { Request, Response } from "express"
import Appointment from "../models/Appointment"
import { Op } from 'sequelize';
import Service from "../models/Services"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

const START_HOUR = 1;
const END_HOUR = 22; // 6 PM

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

    static getByDate = async (req: Request, res: Response) => {
        const { date } = req.params
        console.log(date)
        try {
            // Validar formato de fecha (ej. "2025-05-09")
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
                return
            }
            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const appointment = await Appointment.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user.id,
                    date: {
                        [Op.between]: [startOfDay, endOfDay],
                    }
                }
            })

            res.json(appointment)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static getAvailableHours = async (req: Request, res: Response) => {
        try {
            const { date } = req.params;

            const parsedDate = dayjs(date, 'YYYY-MM-DD', true);
            if (!parsedDate.isValid()) {
                res.status(400).json({ error: 'Invalid date format (expected YYYY-MM-DD)' });
                return
            }

            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            // Obtener todas las citas existentes para ese día
            const appointments = await Appointment.findAll({
                where: {
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                attributes: ['start_time'] // solo necesitamos esto
            });

            console.log(appointments)
            const reservedHours = appointments.map(a => dayjs(a.start_time, 'HH:mm:ss').hour());
            console.log(reservedHours)
            // Generar todas las horas posibles (7 AM a 6 PM)
            const allHours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (!reservedHours.includes(hour)) {
                    allHours.push(dayjs().hour(hour).minute(0).format('hh:00 A'));
                }
            }

            res.json(allHours);
            return
        } catch (error) {
            res.status(500).json({ error: 'Error getting available hours.' });
            return
        }
    };

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

    static updateById = async (req: Request, res: Response) => {
        try {
            await req.appointment.update(req.body)
            res.json('Cita actualizado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static deleteById = async (req: Request, res: Response) => {
        try {
            await req.appointment.destroy()
            res.json('Cata eliminada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}