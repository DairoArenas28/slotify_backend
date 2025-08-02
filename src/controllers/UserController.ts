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

    static getPaginationAll = async (req: Request, res: Response) => {
        try {
            const limit = parseInt(req.query.limit as string) || 10
            const page = parseInt(req.query.page as string) || 1
            const offset = (page - 1) * limit

            /*let whereOptions = undefined
            if(req.user.role === "client"){
                whereOptions = { userId: req.user.id };
            }*/
            const user = await User.findAndCountAll({
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
            const users = await User.create(req.body)
            await users.save()
            res.status(201).json('usuario creado correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})       
        }
    }
} 
