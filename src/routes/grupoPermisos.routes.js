// import express from "express";
// import { verifyToken } from "../middlewares/auth.middleware.js";
// import {
//   asignarPermisoAGrupo,
//   quitarPermisoDeGrupo,
//   listarPermisosDeGrupo
// } from "../controllers/GrupoPermisosController.js";

// const router = express.Router();

// // 🔹 GRUPO-PERMISOS
// router.post("/:grupoId/permisos", verifyToken, asignarPermisoAGrupo);
// router.delete("/:grupoId/permisos/:permisoId", verifyToken, quitarPermisoDeGrupo);
// router.get("/:grupoId/permisos", verifyToken, listarPermisosDeGrupo);

// export default router;