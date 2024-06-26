import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    // manager
    project.manager = req.user.id;
    try {
      await project.save();
      res.send("project created");
    } catch (error) {
      console.log(error);
    }
  };
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [{ manager: {$in: req.user.id} }],
      });
      res.json(projects);
    } catch (error) {
      console.log(error);
    }
  };
  static getProjectById = async (req: Request, res: Response) => {
    try {
      const project = await Project.findById(req.params.id).populate("tasks");
      if (!project) {
        return res.status(404).send("Project not found");
      }
      if (project.manager.toString() !== req.user.id.toString()) {
        const error = new Error('accion no valida');
        return res.status(404).json({error: error.message})
      }
      res.json(project);
    } catch (error) {
      console.log(error);
    }
  };
  static updateProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).send("Project not found");
      }
      project.clientName = req.body.clientName;
      project.projectName = req.body.projectName;
      project.description = req.body.description;
      await project.save();
      res.send("Project updated");
    } catch (error) {
      console.log(error);
    }
  };
  static deleteProject = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return res.status(404).send("Project not found");
        }
        res.send("Project deleted");
    } catch (error) {
      console.log(error);
    }
  };
}


