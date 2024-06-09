import  {Router} from 'express';
import {body,param} from 'express-validator'
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import Task from '../models/Task';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';

const router = Router();

router.post('/',
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
);
router.get('/',ProjectController.getAllProjects);

// OBTENER PROYECTO POR ID
router.get('/:id',
    param('id').isMongoId().withMessage('Invalid project id'),
    handleInputErrors,
    ProjectController.getProjectById
);

// ACTUALIZAR PROYECTO POR ID
router.put('/:id',
    param('id').isMongoId().withMessage('Invalid project id'),
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.updateProject
);

// ELIMINAR UN PROYECTO POR ID
router.delete('/:id',
    param('id').isMongoId().withMessage('Invalid project id'),
    handleInputErrors,
    ProjectController.deleteProject
);

// Route to add a task to a project
router.post('/:projectId/tasks',
    validateProjectExists,
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    TaskController.createTask
);


export default router;