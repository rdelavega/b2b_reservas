import { Router } from "express";
import { reservationsController } from "./reservations.controller";
import { requireAuth } from "../../middlewares/auth.middleware";

export const reservationsRouter = Router();

reservationsRouter.use(requireAuth);

reservationsRouter.post("/", reservationsController.create);
reservationsRouter.get("/", reservationsController.list);
reservationsRouter.get("/:id", reservationsController.getOne);
reservationsRouter.patch("/:id", reservationsController.update);
reservationsRouter.delete("/:id", reservationsController.cancel);
