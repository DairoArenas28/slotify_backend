import { transport } from "../config/nodemailer"
import dotenv from 'dotenv'
dotenv.config()

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'Slotify <admin@Slotify.com>',
            to: user.email,
            subject: '🚀 Confirma tu cuenta en Slotify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50;">Hola ${user.name}, 👋</h2>
                    <p>¡Gracias por registrarte en <strong>Slotify</strong>! Tu cuenta ha sido creada con éxito, pero necesitamos que confirmes tu dirección de correo electrónico para poder activarla.</p>
                    
                    <p style="margin-top: 20px;">Haz clic en el siguiente botón para confirmar tu cuenta:</p>

                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account" style="display: inline-block; padding: 12px 20px; margin: 10px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
                        Confirmar cuenta
                    </a>

                    <p>O si prefieres, puedes ingresar el siguiente código de confirmación directamente en la app:</p>
                    
                    <p style="font-size: 20px; font-weight: bold; color: #333; background-color: #f4f4f4; padding: 10px; border-radius: 4px; display: inline-block;">
                        ${user.token}
                    </p>

                    <p style="margin-top: 30px; font-size: 14px; color: #777;">Si no has creado esta cuenta, simplemente puedes ignorar este correo.</p>

                    <p style="margin-top: 40px;">Saludos,<br><strong>El equipo de Slotify</strong></p>
                </div>
            `
        });
        /*transport.verify((error, success) => {
            if (error) {
                console.error('Error al conectar con SMTP:', error);
            } else {
                console.log('Servidor listo para enviar correos');
            }
        });
        console.log('Mensaje enviado ', email.messageId)*/
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: '🔐 Restablece tu contraseña en Slotify',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2c3e50;">Hola ${user.name},</h2>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Slotify</strong>.</p>
                    
                    <p style="margin-top: 20px;">Puedes hacerlo haciendo clic en el siguiente botón:</p>

                    <a href="${process.env.FRONTEND_URL}/auth/new-password" style="display: inline-block; padding: 12px 20px; margin: 10px 0; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
                        Restablecer contraseña
                    </a>

                    <p>O si prefieres, puedes ingresar este código directamente en la app:</p>
                    
                    <p style="font-size: 20px; font-weight: bold; color: #333; background-color: #f4f4f4; padding: 10px; border-radius: 4px; display: inline-block;">
                        ${user.token}
                    </p>

                    <p style="margin-top: 30px; font-size: 14px; color: #777;">
                        Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña actual seguirá siendo válida.
                    </p>

                    <p style="margin-top: 40px;">Saludos,<br><strong>El equipo de Slotify</strong></p>
                </div>
            `
        });

        //console.log('Mensaje enviado ', email.messageId)
    }
}