import { Request, Response } from "express"
import Appointment from "../models/Appointment"
import { Op } from 'sequelize';
import Service from "../models/Services"
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import User from "../models/User";
import { addMinutes } from "../utils/date";
dayjs.extend(customParseFormat);

const START_HOUR = 6
const END_HOUR = 24

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
        const { status } = req.params
        try {
            const appointments: Appointment[] = await Appointment.findAll({
                order: [['createdAt', 'DESC']],
                where: {
                    userId: req.user.id,
                    status: status
                },
                include: [User, Service]
            });

            const calendarEvents: CalendarEvent[] = appointments.map(appointment => {
                const dateStr = appointment.date.toISOString().split('T')[0]; // "YYYY-MM-DD"

                return {
                    id: appointment.id,
                    title: `${appointment.user?.name ?? 'Sin usuario'} \n ${appointment.service?.name ?? 'Sin servicio'} \n ${+appointment.service?.price}`,
                    start: `${dateStr}T${appointment.start_time}`, // Ej: "2025-05-13T14:00:00"
                    end: `${dateStr}T${appointment.end_time}`,
                    status: appointment.status
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
        //console.log(date)
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
            const [year, month, day] = date.split('-').map(Number)
            const parsedDate = dayjs(date, 'YYYY-MM-DD', true);

            if (!parsedDate.isValid()) {
                res.status(400).json({ error: 'Invalid date format (expected YYYY-MM-DD)' });
                return;
            }

            // 👇 Esto crea la fecha a medianoche LOCAL
            const localDate = new Date(year, month - 1, day);

            const start = new Date(localDate);
            start.setHours(0, 0, 0, 0);

            const end = new Date(localDate);
            end.setHours(23, 59, 59, 999);

            // Obtener todas las citas existentes para ese día, incluyendo start_time y end_time
            const appointments = await Appointment.findAll({
                where: {
                    date: {
                        [Op.between]: [start, end]
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
        const { id: serviceId, name, duration_minutes } = req.service
        const { date, start_time } = req.body;
        const { id: userId } = req.user
        const end_time = addMinutes(start_time, duration_minutes)
        try {

            const appointment = await Appointment.create({
                serviceId: parseInt(serviceId),
                userId,
                date,
                start_time,
                end_time,
                status: 'reservado'
            });
            await appointment.save()
            res.status(201).json('Agenda creada correctamente')
        } catch (error) {
            res.status(500).json({ message: 'Error al agendar la cita', error });
        }
    }

    static updateById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { start_time, } = req.body;
            const { serviceId } = req.body

            // Calcula la hora de finalización
            const service = await Service.findByPk(serviceId)
            const end_time = addMinutes(start_time, service.duration_minutes);
            console.log('service id: ',serviceId)
            // Actualiza la cita
            await req.appointment.update(
                { ...req.body, end_time },
                { where: { id } }
            );

            res.json('Cita actualizada correctamente');
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Hubo un error al actualizar la cita' });
        }
    };

    static deleteById = async (req: Request, res: Response) => {
        try {
            await req.appointment.destroy()
            res.json('Cita eliminada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}