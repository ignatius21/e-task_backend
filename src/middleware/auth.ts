import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';


export const auntenthicate = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization;

    if(!bearer) return res.status(401).json({message: 'No autorizado'});

    const token = bearer.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(typeof decoded === 'object' && decoded.id) {
            const user = await User.findById(decoded.id);
            
        }
    } catch (error) {
        res.status(500).json({message: 'Token no valido'});
    }
    next();
};