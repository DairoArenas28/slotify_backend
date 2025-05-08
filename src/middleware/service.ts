import { Request, Response, NextFunction } from "express";
import Service from "../models/Services";
import { param, validationResult } from "express-validator";

declare global {
    namespace Express {
        interface Request {
            service: Service
        }
    }
}

export const validateServiceId = async (req: Request, res: Response, next: NextFunction) => {
    await param('serviceId').isInt().withMessage('ID no válido').bail()
        .custom(value => value > 0).withMessage('ID no válido').bail().run(req)
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

//validar si un servicio existe al momento de pasar el parametro a la API
export const validateServiceExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { serviceId } = req.params
        const service = await Service.findByPk(serviceId)
        if(!service) {
            const error = new Error('Servicio no encontrado')
            res.status(404).json({ error: error.message })
            return
        }
        req.service = service
        next()
    } catch (error) {
        res.status(500).json({ error: 'Hubo un error' })
        return
    }
}