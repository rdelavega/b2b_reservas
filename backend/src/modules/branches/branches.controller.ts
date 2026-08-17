import { Request, Response } from "express";
import { branchesService } from "./branches.service";
import {
  availabilityQuerySchema,
  createBranchSchema,
  createTableSchema,
  updateBranchSchema,
} from "./branches.schema";

export const branchesController = {
  async list(_req: Request, res: Response) {
    res.json(await branchesService.listBranches());
  },

  async getOne(req: Request, res: Response) {
    const sucursal = await branchesService.getBranch(req.params.id);
    if (!sucursal) return res.status(404).json({ error: "Sucursal no encontrada" });
    res.json(sucursal);
  },

  async availability(req: Request, res: Response) {
    const parsed = availabilityQuerySchema.safeParse(req.query);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    try {
      const disponibilidad = await branchesService.getAvailability(
        req.params.id,
        parsed.data.fecha,
        parsed.data.personas
      );
      res.json(disponibilidad);
    } catch (err) {
      res.status(404).json({ error: (err as Error).message });
    }
  },

  async create(req: Request, res: Response) {
    const parsed = createBranchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(await branchesService.createBranch(parsed.data));
  },

  async addTable(req: Request, res: Response) {
    const parsed = createTableSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.status(201).json(
      await branchesService.addTable(req.params.id, parsed.data.numero, parsed.data.capacidad)
    );
  },

  async update(req: Request, res: Response) {
    const parsed = updateBranchSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    res.json(await branchesService.updateBranch(req.params.id, parsed.data));
  },

  async remove(req: Request, res: Response) {
    await branchesService.deleteBranch(req.params.id);
    res.status(204).send();
  },

  async removeTable(req: Request, res: Response) {
    await branchesService.removeTable(req.params.mesaId);
    res.status(204).send();
  },
};
