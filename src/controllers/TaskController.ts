import { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
        const task = new Task(req.body)
        task.project = req.project.id
        req.project.tasks.push(task.id)
        await Promise.allSettled([task.save(),req.project.save()])
        res.send('Task created')
    } catch (error) {
      console.log(error);
    }
  };
  static getAllTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id });
      res.json(tasks)
    } catch (error) {
      console.log(error);
    }
    res.send("Todos los proyectos");
  };
}
