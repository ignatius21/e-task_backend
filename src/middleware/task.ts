import { Request, Response, NextFunction } from 'express';


export function hasAutorization(req: Request, res: Response, next: NextFunction) {
    if (req.user.id.toString() !== req.project.manager.toString()) {
        const error = new Error('Accion no valida');
        return res.status(400).json({message: error.message});
    }
    next();
}