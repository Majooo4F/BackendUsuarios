import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import usuariosRoutes from "./routes/usuarios.routes.js";
import adminUsuariosRoutes from "./routes/adminUsuarios.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ⚡ Prefijo /users para coincidir con el gateway
app.use("/users", usuariosRoutes);
app.use("/users/admin", adminUsuariosRoutes); // ← cambia de /admin/usuarios a /users/admin

app.get("/", (req, res) => {
  res.json({ mensaje: "User Service funcionando 🚀" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`User Service corriendo en puerto ${PORT}`);
});