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
      const tasks = await Task.find({ project: req.project.id }).populate('project')
      res.json(tasks)
    } catch (error) {
      console.log(error);
    }
  };
  static getTaskById = async (req: Request, res: Response) => {
    const { taskId} = req.params
    try {
      const tasks = await Task.findById(taskId).populate('project');
      if (!tasks) {
        return res.status(404).send("Task not found");
      }
      if(tasks.project.id.toString() !== req.project.id){
        return res.status(404).send("Task not found");
      }
      res.json(tasks);
    } catch (error) {
      console.log(error);
    }
  };
  static updateTask = async (req: Request, res: Response) => {
    const { taskId} = req.params
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send("Task not found");
      }
      task.name = req.body.name;
      task.description = req.body.description;
      await task.save();
      res.json(task);
    } catch (error) {
      console.log(error);
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    const { taskId} = req.params
    try {
      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).send("Task not found");
      };

      req.project.tasks = req.project.tasks.filter(task => task.toString() !== taskId)
      await Promise.allSettled([task.deleteOne(),req.project.save()])
      res.json('Task deleted');

    } catch (error) {
      console.log(error);
    }
  };

  static updateTaskStatus = async (req: Request, res: Response) => {
    const { taskId} = req.params
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).send("Task not found");
      }
      task.status = req.body.status;
      await task.save();
      res.json('Task status updated');
    } catch (error) {
      console.log(error)
    }
  };
}
