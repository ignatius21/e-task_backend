import {Router} from 'express';
import {body, param} from 'express-validator';
import { AuthController } from '../controllers/AuthController';
import { handleInputErrors } from '../middleware/validation';
import { auntenthicate } from '../middleware/auth';


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
router.post('/update-password/:token',
    param('token').isNumeric().withMessage('Token no valido'),
    body('password').isString().notEmpty().isLength({min:6}).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('password_confirmation').custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }
    ),
    handleInputErrors,
    AuthController.updatePasswordWithToken
);

router.get('/user',
    auntenthicate,
    AuthController.user
)

// Profile

router.put('/profile',
    auntenthicate,
    body('name').isString().isLength({min:2}).notEmpty().withMessage('El nombre es requerido'),
    body('email').isEmail(),
    handleInputErrors,
    AuthController.updateProfile
);

router.post('/update-password',
    auntenthicate,
    body('current_password').isString().notEmpty().withMessage('La contraseña actual es requerida').isLength({min:6}),
    body('password').isString().notEmpty().withMessage('La nueva contraseña es requerida').isLength({min:6}),
    body('password_confirmation').custom((value,{req}) => {
        if(value !== req.body.password){
            throw new Error('Las contraseñas no coinciden');
        }
        return true;
    }
    ),
    handleInputErrors,
    AuthController.updatePassword
);

router.post('/check-password',
    auntenthicate,
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    handleInputErrors,
    AuthController.checkPassword
)

export default router;