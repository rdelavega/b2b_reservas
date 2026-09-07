import { execSync } from "node:child_process";
import path from "node:path";

/**
 * Se ejecuta una vez antes de toda la suite E2E: reseeda la base de datos para
 * que las pruebas partan siempre de un estado conocido (las cuentas de
 * demostración quedan sin reservas). Requiere PostgreSQL disponible.
 */
export default function globalSetup() {
  const backend = path.resolve(__dirname, "../backend");
  execSync("npm run prisma:seed", { cwd: backend, stdio: "inherit" });
}
