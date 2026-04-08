import supabase from "../config/supabase.js"

// 🔹 Obtener grupos
export const getGrupos = async (req, res) => {
  const { data, error } = await supabase
    .from("grupos")
    .select("*")

  if (error) return res.status(500).json(error)

  res.json(data)
}

// 🔹 Crear grupo
export const createGrupo = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const creador_id = req.user.id; // viene del token

    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });

    const { data, error } = await supabase
      .from("grupos")
      .insert([{ nombre, descripcion, creador_id }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.status(201).json({ message: "Grupo creado", grupo: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};