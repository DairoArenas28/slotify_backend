import { Request, Response } from "express"
import Customer from "../models/Customer"

export class CustomerController {

    static getAll = async (req: Request, res: Response) => {
        const customers = await Customer.findAll()
        res.status(201).json(customers)
    }

    static getPaginationAll = async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10
            const page = parseInt(req.query.page as string) || 1
            const offset = (page - 1) * limit

            /*let whereOptions = undefined
            if(req.user.role === "client"){
                whereOptions = { userId: req.user.id };
            }*/
            const user = await Customer.findAndCountAll({
                order: [
                    ['createdAt', 'DESC']
                ],
                //where: whereOptions,
                limit,
                offset
            })
            res.json({
                total: user.count,
                page,
                totalPages: Math.ceil(user.count / limit),
                data: user.rows
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static getById = async (req: Request, res: Response) => {
        try {
            const customer = await Customer.findByPk(req.customer.id)
            res.status(200).json(customer)
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }

    static create = async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const customer = await Customer.create(req.body)
            await customer.save()
            res.status(201).json('Cliente creado correctamente')
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(500).json({ error: "La cédula ya está registrada" });
            } else {
                res.status(500).json({ error: error });
            }

        }
    }

    static updateById = async (req: Request, res: Response) => {
        try {
            await req.customer.update(req.body)
            res.json('Cliente actualizado correctamente')

        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(500).json({ error: "La cédula ya está registrada" });
            } else {
                res.status(500).json({ error: error });
            }
        }
    }
}