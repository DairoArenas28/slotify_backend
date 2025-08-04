import { Request, Response } from "express"
import Customer from "../models/Customer"

export class CustomerController {

    static getAll = (req: Request, res: Response) => {

    }

    static create = async (req: Request, res: Response) => {
        try {
            const customer = await Customer.create(req.body)
            res.status(201).json('Cliente creado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'}) 
        }
    }
}