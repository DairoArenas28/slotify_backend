import { Request, Response, NextFunction } from "express";
import Customer from "../models/Customer"
import { param, validationResult } from "express-validator";

declare global {
    namespace Express {
        interface Request {
            customer: Customer
        }
    }
}

export const validateCustomerId = async (req: Request, res: Response, next: NextFunction) => {
    await param('customerId').isInt().withMessage('ID no válido').bail()
        .custom(value => value > 0).withMessage('ID no válido').bail().run(req)
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

//validar si un servicio existe al momento de pasar el parametro a la API
export const validateCustomerExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerId } = req.params
        const customer = await Customer.findByPk(customerId)
        if(!customer) {
            const error = new Error('Servicio no encontrado')
            res.status(404).json({ error: error.message })
            return
        }
        req.customer = customer
        next()
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error' })
        return
    }
}