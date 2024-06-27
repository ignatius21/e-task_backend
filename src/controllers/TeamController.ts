import  type { Request, Response } from 'express';
import User from '../models/User';

export class TeamMemberController {
    static findMemberByEmail = async (req:Request,res:Response) => {
        const { email } = req.body;
        // find the user with the email
        const user = await User.findOne({ email }).select('_id name email');
        if(!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    }
}