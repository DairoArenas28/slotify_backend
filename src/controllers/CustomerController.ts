import { Request, Response } from "express"
import Customer from "../models/Customer"

export class CustomerController {

    static getAll = async (req: Request, res: Response) => {
        const customers = await Customer.findAll()
        res.status(201).json(customers)
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