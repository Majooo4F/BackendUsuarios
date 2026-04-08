import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import usuariosRoutes from "./routes/usuarios.routes.js"
import gruposRoutes from "./routes/grupos.routes.js"
import grupoMiembrosRoutes from "./routes/grupoMiembros.routes.js"
import adminUsuariosRoutes from "./routes/adminUsuarios.routes.js"
import permisosRoutes from "./routes/Permisos.routes.js"; // 🔹 Importa tu router de permisos
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/usuarios", usuariosRoutes)
app.use("/grupos", gruposRoutes) 
app.use("/grupo-miembros", grupoMiembrosRoutes)
app.use("/admin/usuarios", adminUsuariosRoutes)
app.use("/permisos", permisosRoutes)
app.get("/", (req, res) => {
  res.json({ mensaje: "Backend ERP funcionando 🚀" })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)
})