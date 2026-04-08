import supabase from "../config/supabase.js"

// 🔹 agregar usuario a grupo
export const addUsuarioGrupo = async (req, res) => {
  const { grupo_id, usuario_id } = req.body

  const { data, error } = await supabase
    .from("grupo_miembros")
    .insert([{ grupo_id, usuario_id }])

  if (error) return res.status(500).json(error)

  res.json(data)
}

// 🔹 ver miembros de un grupo
export const getMiembrosGrupo = async (req, res) => {
  const { grupo_id } = req.params

  const { data, error } = await supabase
    .from("grupo_miembros")
    .select(`
      id,
      usuarios(nombre_completo, username, email)
    `)
    .eq("grupo_id", grupo_id)

  if (error) return res.status(500).json(error)

  res.json(data)
}