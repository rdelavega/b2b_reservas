import { Router } from "express";
import { branchesController } from "./branches.controller";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/role.middleware";

export const branchesRouter = Router();

branchesRouter.get("/", branchesController.list);
branchesRouter.get("/:id", branchesController.getOne);
branchesRouter.get("/:id/availability", branchesController.availability);

branchesRouter.post("/", requireAuth, requireRole("ADMIN"), branchesController.create);
branchesRouter.post("/:id/mesas", requireAuth, requireRole("ADMIN"), branchesController.addTable);
branchesRouter.patch("/:id", requireAuth, requireRole("ADMIN"), branchesController.update);
branchesRouter.delete("/:id", requireAuth, requireRole("ADMIN"), branchesController.remove);
branchesRouter.delete("/:id/mesas/:mesaId", requireAuth, requireRole("ADMIN"), branchesController.removeTable);
