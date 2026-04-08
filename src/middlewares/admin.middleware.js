import supabase from "../config/supabase.js"

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select("permiso_id")
      .eq("usuario_id", userId)

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    const permisos = data.map(p => p.permiso_id)

    const esAdmin =
      permisos.includes(6) &&
      permisos.includes(11) &&
      permisos.includes(18)

    if (!esAdmin) {
      return res.status(403).json({
        message: "Solo el admin puede hacer esto"
      })
    }

    next()

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}