import type {Request,Response} from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import Token from '../models/Token';
import { generateToken } from '../utils/token';
import { AuthEmail } from '../emails/AuthEmail';
import { hashPassword } from '../utils/auth';
import { generateJWT } from '../utils/jwt';



export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { password, email } = req.body;
      //prevenir duplicados
      const userExists = await User.findOne({ email });
      if (userExists) {
        const error = new Error("El usuario ya esta registrado");
        return res.status(409).json({ error: error.message });
      }
      // crear usuario
      const user = new User(req.body);

      // encriptar contraseña
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user._id;

      // enviar email
      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // guardar usuario y token
      await Promise.allSettled([user.save(), token.save()]);
      res.send("Cuenta creada, revisa tu email para confirmarla");
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        return res.status(404).json({ error: "Token no encontrado" });
      }
      const user = await User.findById(tokenExists.user);
      user.confirmed = true;
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);
      res.send("Cuenta confirmada");
    } catch (error) {
      res.status(500).json({ error: "Error al confirmar la cuenta" });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      if (!user.confirmed) {
        const token = new Token();
        user.token = user.id;
        token.token = generateToken();
        await Promise.allSettled([user.save(), token.save()]);
        await AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });
        return res
          .status(401)
          .json({ error: "Debes confirmar tu cuenta antes de iniciar sesion" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Contraseña incorrecta" });
      }

      const token = generateJWT({ id: user.id });

      res.send(token);
    } catch (error) {
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  };
  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      //usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no esta registrado");
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed) {
        const error = new Error("El usuario ya esta confirmado");
        return res.status(403).json({ error: error.message });
      }

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      // enviar email
      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      // guardar usuario y token
      await Promise.allSettled([user.save(), token.save()]);
      res.send("Se ha enviado un nuevo token a tu cuenta de correo");
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      //usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        const error = new Error("El usuario no esta registrado");
        return res.status(404).json({ error: error.message });
      }

      // generar el token
      const token = new Token();
      token.token = generateToken();
      token.user = user.id;
      await token.save();

      // enviar email
      await AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      res.send(
        "Revisa tu email para instrucciones de recuperacion de password"
      );
    } catch (error) {
      res.status(500).json({ error: "Error al crear el usuario" });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        return res.status(404).json({ error: "Token no encontrado" });
      }

      res.send("Token valido, ingresa tu nuevo password");
    } catch (error) {
      res.status(500).json({ error: "Error al confirmar el token" });
    }
  };
  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const tokenExists = await Token.findOne({ token });
      if (!tokenExists) {
        return res.status(404).json({ error: "Token no encontrado" });
      }

      const user = await User.findById(tokenExists.user);
      user.password = await hashPassword(req.body.password);

      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("Password actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al confirmar el token" });
    }
  };
  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };
  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;
    const userExist = await User.findOne({ email });
    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error("E-mail ya registrado");
      return res.status(409).json({ error: error.message });
    }
    req.user.name = name;
    req.user.email = email;
    try {
      await req.user.save();
      res.send("Perfil actualizado correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el perfil" });
    }
  };

  static updatePassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const user = await User.findById(req.user.id);
    const validPassword = await bcrypt.compare(current_password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }
    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send("Contraseña actualizada correctamente");
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la contraseña" });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }
    res.send("Contraseña correcta");
  };
}