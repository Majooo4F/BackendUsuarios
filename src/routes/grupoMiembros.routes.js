import { Router } from "express"
import { addUsuarioGrupo, getMiembrosGrupo } from "../controllers/grupoMiembros.controller.js"

const router = Router()

router.post("/", addUsuarioGrupo)
router.get("/:grupo_id", getMiembrosGrupo)

export default router