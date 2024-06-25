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

router.post('/confirm-account',
    body('token').isString().notEmpty().withMessage('El token es requerido'),
    handleInputErrors,
    AuthController.confirmAccount
);

// endpoint para el loggig

router.post('/login',
    body('email').isEmail(),
    body('password').isString().notEmpty().withMessage('La contraseña es requerida').isLength({min:6}),
    handleInputErrors,
    AuthController.login
);
router.post('/request-code',
    body('email').isEmail(),
    handleInputErrors,
    AuthController.requestConfirmationCode
);
router.post('/forgot-password',
    body('email').isEmail(),
    handleInputErrors,
    AuthController.forgotPassword
);

router.post('/validate-token',
    body('token')
    .notEmpty()
    .withMessage('El token no puede ir vacio'),
    handleInputErrors,
    AuthController.validateToken
);

export default router;