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
}