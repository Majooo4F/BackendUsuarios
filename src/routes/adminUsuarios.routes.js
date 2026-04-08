import express from "express"

import {
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  getUsuariosAdmin
} from "../controllers/adminUsuarios.controller.js"

import { verifyToken } from "../middlewares/auth.middleware.js"

const router = express.Router()

// 🔹 obtener usuarios
router.get("/", verifyToken, getUsuariosAdmin)

// 🔹 crear usuario
router.post("/", verifyToken, createUserAdmin)

// 🔹 editar usuario
router.put("/:id", verifyToken, updateUserAdmin)

// 🔹 eliminar usuario
router.delete("/:id", verifyToken, deleteUserAdmin)
router.get("/", verifyToken, getUsuariosAdmin)
export default router