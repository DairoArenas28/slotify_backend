import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        const { email, password } = req.body

        //Prevenir duplicado
        const userExisted = await User.findOne({ where: { email } })

        if (userExisted) {
            const error = new Error('Un usuario con ese email ya esta resgistrado')
            res.status(409).json({ error: error.message })
            return
        }

        try {
            const user =  await User.create(req.body)
            user.password = await hashPassword(password)
            const token = generateToken()

            if(process.env.NODE_ENV !== 'production'){
                globalThis.cashTrackrConfirmationToken = token
            }

            user.token = token;
            await user.save()

            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })

            res.status(201).json('Cuenta creada correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json(`${error} error al enviar el correo`)
            //res.status(500).json({ error: error.message })
        }

    }

    static confirmAccount = async (req: Request, res: Response) => {

        const { token } = req.body

        const user = await User.findOne({ where: { token } })

        if (!user) {
            const error = new Error('Token no válido')
            res.status(401).json({ error: error.message })
            return
        }
        user.confirmed = true
        user.token = null
        await user.save()
        res.json('Cuenta confirmada correctamente')
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        //Encontrar usuario
        const user = await User.findOne({ where: { email } })

        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }

        if (!user.confirmed) {
            const error = new Error('La cuenta no ha sido confirmada')
            res.status(403).json({ error: error.message })
            return
        }

        const isPasswordCorrect = await checkPassword(password, user.password)

        if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            res.status(401).json({ error: error.message })
            return
        }

        const token = generateJWT(user.id, user.role)

        res.json(token)
    }

    static forgotPassword = async (req: Request, res: Response) => {
        const { email, password } = req.body

        //Encontrar usuario
        const user = await User.findOne({ where: { email } })

        if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
        }

        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })

        res.json('Revisa tu email para instrucciones')
    }

    static validateToken = async (req: Request, res: Response) => {
        const { token } = req.body

        const tokenExists = await User.findOne({ where: { token } })
        if (!tokenExists) {
            const error = new Error('Token no válido')
            res.status(404).json({ error: error.message })
            return
        }

        res.json('Token válido, asigna un nuevo password')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const { token } = req.params
        const { password } = req.body

        const user = await User.findOne({ where: { token } })
        if (!user) {
            const error = new Error('Token no válido')
            res.status(404).json({ error: error.message })
            return
        }

        //asignar nuevo  password
        user.password = await hashPassword(password)
        user.token = null
        await user.save()

        res.json('El password se modificó correctamente')
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {

        const { current_password, password } = req.body;
        const { id } = req.user;

        const user = await User.findByPk(id);

        const isPasswordCorrect = await checkPassword(current_password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ error: 'El password actual es incorrecto' });
            return
        }

        user.password = await hashPassword(password);
        await user.save();

        res.json('El password se modificó correctamente');

    };

    static checkPassword = async (req: Request, res: Response) => {

        const { password } = req.body;
        const { id } = req.user;

        const user = await User.findByPk(id);

        const isPasswordCorrect = await checkPassword(password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({ error: 'El password actual es incorrecto' });
            return
        }

        res.json('Password correcto');

    };

    static updateProfileUser = async (req: Request, res: Response) => {
        const {name, email} = req.body
        const { id } = req.user

        try {
            //Prevenir duplicado
            const userExisted = await User.findOne({ where: { email } })

            if (userExisted && userExisted.id !== req.user.id) {
                const error = new Error('Un usuario con ese email ya esta resgistrado')
                res.status(409).json({ error: error.message })
                return
            }

            await User.update({name,email}, {
                where: {id: id}
            })

            res.json('Perfil actualizado correctamente')
        } catch (error) {
            res.status(500).json('Hubo un error')
        }
    }
}