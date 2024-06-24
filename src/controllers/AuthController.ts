import type {Request,Response} from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';



export class AuthController {
    static createAccount = async (req: Request, res: Response) => {
        try {
            const { password, email } = req.body;
            //prevenir duplicados
            const userExists = await User.findOne({ email });
            if (userExists) {
                const error = new Error('El usuario ya esta registrado');
                return res.status(409).json({ error: error.message });
            }
            // crear usuario
            const user = new User(req.body);
            
            // encriptar contraseña
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            // generar el token
            const token = new Token()
            token.token = generateToken();
            token.user = user._id;

            // enviar email
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            

            // guardar usuario y token
            await Promise.allSettled([user.save(),token.save()]);
            res.send('Cuenta creada, revisa tu email para confirmarla');

        } catch (error) {
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const tokenExists = await Token.findOne({ token }).populate('user');
            if (!tokenExists) {
                return res.status(404).json({ error: 'Token no encontrado' });
            }
            const user = await User.findById(tokenExists.user._id);
            user.confirmed = true;
            await Promise.allSettled([user.save(), Token.deleteOne({ _id: tokenExists._id })]);
            res.send('Cuenta confirmada');
        } catch (error) {
            res.status(500).json({ error: 'Error al confirmar la cuenta' });
        }
    }

    static login = async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            if (!user.confirmed) {
                const token = new Token();
                user.token = user._id;
                token.token = generateToken();
                await Promise.allSettled([user.save(), token.save()]);
                await AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                });
                return res.status(401).json({ error: 'Debes confirmar tu cuenta antes de iniciar sesion' });
            }
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Contraseña incorrecta' });
            }
            return res.status(200).json({ message: 'Autenticando...' });
        } catch (error) {
            res.status(500).json({ error: 'Error al iniciar sesión' });
        }
    }
    static requestConfirmationCode = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            //usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no esta registrado');
                return res.status(404).json({ error: error.message });
            }

            if(user.confirmed){
                const error = new Error('El usuario ya esta confirmado');
                return res.status(403).json({ error: error.message });
            }
            

            // generar el token
            const token = new Token()
            token.token = generateToken();
            token.user = user._id;

            // enviar email
            await AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            });
            

            // guardar usuario y token
            await Promise.allSettled([user.save(),token.save()]);
            res.send('Se ha enviado un nuevo token a tu cuenta de correo');

        } catch (error) {
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    }

    static forgotPassword = async (req: Request, res: Response) => {
        try {
            const { email } = req.body;
            //usuario existe
            const user = await User.findOne({ email });
            if (!user) {
                const error = new Error('El usuario no esta registrado');
                return res.status(404).json({ error: error.message });
            }
            

            // generar el token
            const token = new Token()
            token.token = generateToken();
            token.user = user._id;
            await token.save();

            // enviar email
            await AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            });

            res.send('Revisa tu email para instrucciones de recuperacion de password');

        } catch (error) {
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    }
}