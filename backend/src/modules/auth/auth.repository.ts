import { prisma } from "../../config/prisma";

export const authRepository = {
  findByEmail: (email: string) => prisma.usuario.findUnique({ where: { email } }),

  findById: (id: string) => prisma.usuario.findUnique({ where: { id } }),

  create: (data: {
    nombre: string;
    email: string;
    passwordHash: string;
    rol: "ADMIN" | "HOST" | "CLIENTE";
    sucursalId?: string;
  }) => prisma.usuario.create({ data }),

  updatePassword: (id: string, passwordHash: string) =>
    prisma.usuario.update({ where: { id }, data: { passwordHash } }),
};
