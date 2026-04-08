import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
  createPermiso,
  editarPermiso,
  eliminarPermiso,
  asignarPermisoAUsuario,
  quitarPermisoAUsuario,
  listarPermisosDeUsuario
} from "../controllers/AdminPermisosController.js";

const router = express.Router();

// 🔹 CRUD PERMISOS
router.post("/", verifyToken, createPermiso);
router.put("/:permisoId", verifyToken, editarPermiso);
router.delete("/:permisoId", verifyToken, eliminarPermiso);

// 🔹 USUARIO-PERMISOS
router.post("/:usuarioId/permisos", verifyToken, asignarPermisoAUsuario);
router.delete("/:usuarioId/permisos/:permisoId", verifyToken, quitarPermisoAUsuario);
router.get("/:usuarioId/permisos", verifyToken, listarPermisosDeUsuario);

export default router;