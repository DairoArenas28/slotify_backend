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

    static create = async (req: Request, res: Response) => {
        try {
            console.log(req.body)
            const customer = await Customer.create(req.body)
            await customer.save()
            res.status(201).json('Cliente creado correctamente')
        } catch (error) {
            res.status(500).json({error: error.message}) 
        }
    }
}