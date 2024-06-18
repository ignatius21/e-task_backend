import type {Request,Response} from 'express';
import User from '../models/User';



export class AuthController {
    static createAccount = async (req:Request,res:Response) => {
        try {
            const user = await User.create(req.body);
            await user.save();
            res.status(201).send('Cuenta creada, revisa tu correo para activarla');
        } catch (error) {
            res.status(500).send('Error en el servidor');
        }
    }
}