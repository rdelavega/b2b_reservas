import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authRepository } from "./auth.repository";

const SALT_ROUNDS = 10;

export const authService = {
  async register(input: {
    nombre: string;
    email: string;
    password: string;
    rol: "ADMIN" | "HOST" | "CLIENTE";
    sucursalId?: string;
  }) {
    const existente = await authRepository.findByEmail(input.email);
    if (existente) throw new Error("El correo ya está registrado");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const usuario = await authRepository.create({
      nombre: input.nombre,
      email: input.email,
      passwordHash,
      rol: input.rol,
      sucursalId: input.sucursalId,
    });

    return { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  },

  async login(email: string, password: string) {
    const usuario = await authRepository.findByEmail(email);
    if (!usuario) throw new Error("Credenciales inválidas");

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) throw new Error("Credenciales inválidas");

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, sucursalId: usuario.sucursalId },
      process.env.JWT_SECRET as string,
      { expiresIn: (process.env.JWT_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"] }
    );

    return { token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } };
  },

  async changePassword(userId: string, passwordActual: string, passwordNueva: string) {
    const usuario = await authRepository.findById(userId);
    if (!usuario) throw new Error("Usuario no encontrado");

    const passwordValida = await bcrypt.compare(passwordActual, usuario.passwordHash);
    if (!passwordValida) throw new Error("Contraseña actual incorrecta");

    const nuevoHash = await bcrypt.hash(passwordNueva, SALT_ROUNDS);
    await authRepository.updatePassword(usuario.id, nuevoHash);
  },
};
