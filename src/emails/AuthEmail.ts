import { transporter } from "../config/nodemailer";

interface IEmail {
    email: string;
    name: string;
    token: string;
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: IEmail) => {
       const info = await transporter.sendMail({
            from: 'e-task <admin@etask.com>',
            to: user.email,
            subject: 'Confirma tu cuenta',
            html: `<p>${user.name} confirma tu cuenta</p>
                    <p>Visita el siguiente enlace:</p>
                    <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar cuenta</a>
                    <p>Ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
            
            `
        });
        console.log('Mensaje enviado', info.messageId)
    }
    static sendPasswordResetToken = async (user: IEmail) => {
       const info = await transporter.sendMail({
            from: 'e-task <admin@etask.com>',
            to: user.email,
            subject: 'Restablecer contraseña',
            html: `<p>${user.name} has solicitado el restablecimiento de tu password</p>
                    <p>Visita el siguiente enlace:</p>
                    <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer password</a>
                    <p>Ingresa el codigo: <b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
            
            `
        });
        console.log('Mensaje enviado', info.messageId)
    }
}