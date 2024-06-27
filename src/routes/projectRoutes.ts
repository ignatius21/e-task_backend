import  {Router} from 'express';
import {body,param} from 'express-validator'
import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import Task from '../models/Task';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExists } from '../middleware/project';
import { auntenthicate } from '../middleware/auth';
import { TeamMemberController } from '../controllers/TeamController';

const router = Router();


router.use(auntenthicate);

router.post('/',
    body('projectName').notEmpty().withMessage('Project name is required'),
    body('clientName').notEmpty().withMessage('Client name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);

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

router.param('projectId', validateProjectExists);

router.post('/:projectId/tasks',
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    TaskController.createTask
);

// Route to get all tasks from a project
router.get('/:projectId/tasks',
    TaskController.getAllTasks
);


// Route to get a task by id
router.get('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    handleInputErrors,
    TaskController.getTaskById
);

// Route to update a task by id

router.put('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    body('name').notEmpty().withMessage('Task name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    handleInputErrors,
    TaskController.updateTask
);

// Route to delete a task by id

router.delete('/:projectId/tasks/:taskId',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    handleInputErrors,
    TaskController.deleteTask
);

// update status of a task
router.post('/:projectId/tasks/:taskId/status',
    param('taskId').isMongoId().withMessage('Invalid task id'),
    body('status').notEmpty().withMessage('Status is required'),
    handleInputErrors,
    TaskController.updateTaskStatus
);

// routes for teams

router.get('/:projectId/team',
    TeamMemberController.getProjectTeam
);

router.post('/:projectId/team/find',
    body('email').isEmail().withMessage('Invalid email').toLowerCase(),
    handleInputErrors,
    TeamMemberController.findMemberByEmail
);

router.post('/:projectId/team',
    body('id').isMongoId().withMessage('Id not valid'),
    handleInputErrors,
    TeamMemberController.addMemberById
);
router.delete('/:projectId/team',
    body('id').isMongoId().withMessage('Id not valid'),
    handleInputErrors,
    TeamMemberController.removeMemberById
);

export default router;