import { Router } from "express"
import { register, login, getUsuarios, updateUser, deleteUser, getPerfil, updatePerfil   } from "../controllers/usuarios.controller.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/", getUsuarios)
router.put("/:id", verifyToken, updateUser)
router.delete("/:id", verifyToken, deleteUser)
router.get("/perfil", verifyToken, getPerfil)
router.put("/perfil", verifyToken, updatePerfil)
// 🔒 protegida


export default router