import supabase from "../config/supabase.js";

// ================= CREAR PERMISO =================
export const createPermiso = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) return res.status(400).json({ message: "El nombre del permiso es obligatorio" });

    const { data, error } = await supabase
      .from("permisos")
      .insert([{ nombre, descripcion }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.status(201).json({ message: "Permiso creado", permiso: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= EDITAR PERMISO =================
export const editarPermiso = async (req, res) => {
  try {
    const { permisoId } = req.params;
    const { nombre, descripcion } = req.body;

    const { data, error } = await supabase
      .from("permisos")
      .update({ nombre, descripcion })
      .eq("id", permisoId)
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: "Permiso actualizado", permiso: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ELIMINAR PERMISO =================
export const eliminarPermiso = async (req, res) => {
  try {
    const { permisoId } = req.params;

    const { error } = await supabase
      .from("permisos")
      .delete()
      .eq("id", permisoId);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: "Permiso eliminado" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= ASIGNAR PERMISO A USUARIO =================
export const asignarPermisoAUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { grupoId = null, permisoId } = req.body;

    if (!permisoId) return res.status(400).json({ message: "permisoId es obligatorio" });

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .insert([{ grupo_id: grupoId, usuario_id: usuarioId, permiso_id: permisoId }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: "Permiso asignado al usuario", relacion: data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= QUITAR PERMISO A USUARIO =================
export const quitarPermisoAUsuario = async (req, res) => {
  try {
    const { usuarioId, permisoId } = req.params;
    const { grupoId = null } = req.body;

    const { error } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("usuario_id", usuarioId)
      .eq("permiso_id", permisoId)
      .eq("grupo_id", grupoId);

    if (error) return res.status(500).json({ message: error.message });

    res.json({ message: "Permiso quitado del usuario" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= LISTAR PERMISOS DE USUARIO =================
export const listarPermisosDeUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select("permiso_id, grupo_id, permisos(*)")
      .eq("usuario_id", usuarioId);

    if (error) return res.status(500).json({ message: error.message });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};