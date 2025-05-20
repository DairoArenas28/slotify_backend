import { Request, Response } from "express"
import { Op } from 'sequelize';
import User from "../models/User"
import Appointment from "../models/Appointment"
import Service from "../models/Services"

type CalendarEvent = {
    title: string;
    start: string;
    end: string;
};

export class AdminController {
    //Obtener todos los usuarios
    static getUserByClient = async (req: Request, res: Response) => {
        try {
            const users = await User.findAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                where: {
                    role: 'client'
                }
            })
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    //Obtener todos los appointment
    static getAppointment = async (req: Request, res: Response) => {
        try {
            const users = await Appointment.findAll({
                include: [{
                    model: Service,
                    attributes: ['id', 'name']
                }],
                order: [
                    ['createdAt', 'DESC']
                ]
            })
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static getByCalendar = async (req: Request, res: Response) => {

        try {
            const appointments: Appointment[] = await Appointment.findAll({
                order: [['createdAt', 'DESC']],
                where: {
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

    // 
    static getFinanceData = async (req: Request, res: Response) => {
        const { type, date } = req.query;

        if (!type || !date) {
            res.status(400).json({ message: 'type and date required' });
            return
        }

        let startDate: Date;
        let endDate: Date;

        if (type === 'day') {
            startDate = new Date(date as string);
            endDate = new Date(date as string);
            endDate.setDate(endDate.getDate() + 1);
        } else if (type === 'month') {
            const [year, month] = (date as string).split('-').map(Number);
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            endDate.setDate(endDate.getDate() + 1);
        } else {
            res.status(400).json({ message: 'Invalid type' });
            return
        }

        try {
            console.log(startDate, endDate)
            // Traer citas completadas en el rango
            const appointments = await Appointment.findAll({
                where: {
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    },
                    status: 'completado'
                },
                include: [Service],
                raw: true,
                nest: true
            });

            const completedAppointments = appointments.length;

            // Calcular total ganancias
            const totalEarnings = appointments.reduce((sum, appt) => sum + Number(appt.service?.price || 0), 0);

            // Agrupar servicios para top servicio
            const serviceCount: Record<string, { name: string, count: number }> = {};
            for (const appt of appointments) {
                const id = appt.serviceId;
                const name = appt.service?.name || 'Otro';
                if (!serviceCount[id]) serviceCount[id] = { name, count: 0 };
                serviceCount[id].count++;
            }

            const topService = Object.values(serviceCount).sort((a, b) => b.count - a.count)[0];

            // Agrupar para gráfico
            const chartData: { [label: string]: number } = {};
            const formatter = new Intl.DateTimeFormat('es-CO', {
                timeZone: 'America/Bogota',
                day: 'numeric'
            });

            for (const appt of appointments) {
                const label = formatter.format(new Date(appt.date));
                chartData[label] = (chartData[label] || 0) + Number(appt.service?.price || 0);
            }

            const chartArray = Object.entries(chartData).map(([label, amount]) => ({ label, amount }));

            res.json({
                totalEarnings,
                completedAppointments,
                topService,
                chartData: chartArray
            });
        } catch (error) {
            res.status(500).json({ message: 'Dashboard fetch error', error });
        }
    };
}