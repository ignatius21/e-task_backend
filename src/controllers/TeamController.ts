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
    static addMemberById = async (req:Request,res:Response) => {
        const {id} = req.body;
        // find the user with the email
        const user = await User.findById(id).select('_id');
        if(!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        if(req.project.team.some(team => team.toString() === user.id.toString())) {
            return res.status(409).json({ message: 'El usuario ya pertenece al equipo' });
        }
        req.project.team.push(user.id);
        await req.project.save();
        res.send('Usuario agregado correctamente');
        
    }
    static removeMemberById = async (req:Request,res:Response) => {
        const {id} = req.body;
        if(!req.project.team.some(team => team.toString() === id)) {
            return res.status(409).json({ message: 'El usuario no existe en el proyecto' });
        }
        req.project.team = req.project.team.filter(teamMember => teamMember.toString() !== id);
        await req.project.save();
        res.send('Usuario eliminado correctamente');
        
    }
}