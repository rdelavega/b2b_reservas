import cors from "cors";
import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { branchesRouter } from "./modules/branches/branches.routes";
import { reservationsRouter } from "./modules/reservations/reservations.routes";

export const app = express();

// En producción, restringe CORS al frontend desplegado (FRONTEND_URL, coma-separado
// para más de un origen); sin configurar, permite cualquier origen (uso local/demo).
const origenesPermitidos = process.env.FRONTEND_URL?.split(",").map((o) => o.trim());
app.use(cors(origenesPermitidos ? { origin: origenesPermitidos } : {}));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/auth", authRouter);
app.use("/branches", branchesRouter);
app.use("/reservations", reservationsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});
