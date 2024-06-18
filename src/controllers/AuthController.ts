import type {Request,Response} from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';



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
            // guardar usuario
            await user.save();
            res.send('Cuenta creada, revisa tu email para confirmarla');
        } catch (error) {
            res.status(500).json({ error: 'Error al crear el usuario' });
        }
    }
}