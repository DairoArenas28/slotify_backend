import { Request, Response } from "express"
import User from "../models/User"

export  class UserController {
    
    static getAll = async (req: Request, res: Response) => {
        try {
            const users = await User.findAll()
            res.status(200).json(users)
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})  
        }
    }
    
    static create = async (req: Request, res: Response) => {
        try {
            const users = await User.create(req.body)
            await users.save()
            res.status(201).json('usuario creado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})       
        }
    }
} 
