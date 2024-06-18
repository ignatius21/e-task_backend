import {Router} from 'express';
import {body} from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputErrors } from '../middleware/validation';

const router = Router();

router.post('/create-account',
    body('name').isString().isLength({min:2}).notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail(),
    body('password').isString().notEmpty().isLength({min:6}).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('password_confirmation').custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }), 
    handleInputErrors,
    AuthController.createAccount
);

export default router;