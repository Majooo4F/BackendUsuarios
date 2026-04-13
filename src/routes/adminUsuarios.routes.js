import express from "express"

import {
  createUserAdmin,
  updateUserAdmin,
  deleteUserAdmin,
  getUsuariosAdmin
} from "../controllers/adminUsuarios.controller.js"

const router = express.Router()

router.get("/", getUsuariosAdmin)
router.post("/", createUserAdmin)
router.put("/:id", updateUserAdmin)
router.delete("/:id", deleteUserAdmin)

export default router