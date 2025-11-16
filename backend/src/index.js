import { createDefaultAdmin } from "./controllers/user.controllers.js";
import app from "./app.js";

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Crear admin si no existe
createDefaultAdmin();
