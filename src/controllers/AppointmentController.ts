import { Request, Response } from "express"
import Appointment from "../models/Appointment"
import { Op } from 'sequelize';
import Service from "../models/Services"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import User from "../models/User";
dayjs.extend(customParseFormat);

const START_HOUR = 1
const END_HOUR = 22

type CalendarEvent = {
    title: string;
    start: string;
    end: string;
};

export class AppointmentController {

    static getAll = async (req: Request, res: Response) => {
        try {
            const appointment = await Appointment.findAll({
                order: [
                    ['createdAt', 'DESC']
                ]
            })

            res.json(appointment)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }

    }

    static getUserAll = async (req: Request, res: Response) => {
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

    static getByCalendar = async (req: Request, res: Response) => {

        try {
            const appointments: Appointment[] = await Appointment.findAll({
                order: [['createdAt', 'DESC']],
                where: {
                    userId: req.user.id,
                    status: 'reservado'
                },
                include: [User]
            });

            const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
                const dateStr = appointment.date.toISOString().split('T')[0]; // "YYYY-MM-DD"

                return {
                    title: appointment.user.name,
                    start: `${dateStr}T${appointment.start_time}`, // Ej: "2025-05-13T14:00:00"
                    end: `${dateStr}T${appointment.end_time}`
                };
            });

            res.json(calendarEvents);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    static getByStatus = async (req: Request, res: Response) => {
        const { status } = req.params
        try {
            const appointment = await Appointment.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    userId: req.user.id,
                    status: status
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
                return;
            }

            const startOfDay = new Date(date);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Obtener todas las citas existentes para ese día, incluyendo start_time y end_time
            const appointments = await Appointment.findAll({
                where: {
                    date: {
                        [Op.between]: [startOfDay, endOfDay]
                    }
                },
                attributes: ['start_time', 'end_time'] // Obtener ambos campos
            });

            const occupiedHours = [];
            // Iterar sobre las citas para obtener los rangos de tiempo ocupados
            appointments.forEach(a => {
                const startHour = dayjs(a.start_time, 'HH:mm:ss').hour();
                const endHour = dayjs(a.end_time, 'HH:mm:ss').hour();

                // Marcar las horas entre startHour y endHour como ocupadas
                for (let hour = startHour; hour < endHour; hour++) {
                    occupiedHours.push(hour);
                }
            });

            // Generar todas las horas posibles (7 AM a 6 PM)
            const allHours = [];
            for (let hour = START_HOUR; hour < END_HOUR; hour++) {
                if (!occupiedHours.includes(hour)) {
                    allHours.push(dayjs().hour(hour).minute(0).format('hh:00 A'));
                }
            }

            res.json(allHours);
            return;
        } catch (error) {
            res.status(500).json({ error: 'Error getting available hours.' });
            return;
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