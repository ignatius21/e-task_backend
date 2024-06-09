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
      const tasks = await Task.findByIdAndUpdate(taskId, req.body, {new: true}).populate('project');
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
  
}
