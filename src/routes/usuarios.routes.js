import { Router } from "express";
import {
  register, login, getUsuarios,
  updateUser, deleteUser, getPerfil, updatePerfil
} from "../controllers/usuarios.controller.js";

const router = Router();

// Públicas
router.post("/register", register);
router.post("/login", login);

// ⚠️ Perfil PRIMERO, antes que /:id
router.get("/perfil", getPerfil);
router.put("/perfil", updatePerfil);

// Generales
router.get("/", getUsuarios);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;