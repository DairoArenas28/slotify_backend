import { Request, Response } from "express"
import Service from "../models/Services"

export class ServiceController {

    //Obtener todos los servicios
    static getAll = async (req: Request, res: Response) => {
        try {
            const services = await Service.findAll()
            res.status(200).json(services)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})  
        }
    }

    //Obtener todos los servicios
    static getById = async (req: Request, res: Response) => {
        try {
            const services = await Service.findByPk(req.service.id)
            res.status(200).json(services)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})  
        }
    }

    //Crear un servicio
    static create = async (req: Request, res: Response) => {
        try {
            const service = await Service.create(req.body)
            await service.save()
            res.status(201).json('Servicio creado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})       
        }
    }

    //Actualizar un servicio
    static updateById = async (req: Request, res: Response) => {
        try {
            await req.service.update(req.body)
            res.json('Servicio actualizado correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})    
        }
    }

    //Eliminar un servicio
    static deleteById = async (req: Request, res: Response) => {
        try {
            await req.service.destroy()
            res.json('Servicio eliminado correctamente')

        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})    
        }
    }
}