import { createDefaultAdmin } from "./controllers/user.controllers.js";
import { databaseReady } from "./config/db.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

try {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET debe estar configurado antes de iniciar el servidor");
  }

  await databaseReady;
  await createDefaultAdmin();

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
  });
} catch (error) {
  console.error("No se pudo iniciar el servidor:", error);
  process.exitCode = 1;
}
