// import supabase from "../config/supabase.js";

// // ================= ASIGNAR PERMISO A GRUPO =================
// export const asignarPermisoAGrupo = async (req, res) => {
//   try {
//     const { grupoId } = req.params;
//     const { usuarioId, permisoId } = req.body;

//     if (!usuarioId || !permisoId) return res.status(400).json({ message: "usuarioId y permisoId son obligatorios" });

//     const { data, error } = await supabase
//       .from("grupo_usuario_permisos")
//       .insert([{ grupo_id: grupoId, usuario_id: usuarioId, permiso_id: permisoId }])
//       .select()
//       .single();

//     if (error) return res.status(500).json({ message: error.message });

//     res.json({ message: "Permiso asignado al grupo", relacion: data });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= QUITAR PERMISO DE GRUPO =================
// export const quitarPermisoDeGrupo = async (req, res) => {
//   try {
//     const { grupoId, permisoId } = req.params;
//     const { usuarioId } = req.body;

//     if (!usuarioId) return res.status(400).json({ message: "usuarioId es obligatorio" });

//     const { error } = await supabase
//       .from("grupo_usuario_permisos")
//       .delete()
//       .eq("grupo_id", grupoId)
//       .eq("usuario_id", usuarioId)
//       .eq("permiso_id", permisoId);

//     if (error) return res.status(500).json({ message: error.message });

//     res.json({ message: "Permiso quitado del grupo" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ================= LISTAR PERMISOS DE GRUPO =================
// export const listarPermisosDeGrupo = async (req, res) => {
//   try {
//     const { grupoId } = req.params;

//     const { data, error } = await supabase
//       .from("grupo_usuario_permisos")
//       .select("permiso_id, usuario_id, permisos(*)")
//       .eq("grupo_id", grupoId);

//     if (error) return res.status(500).json({ message: error.message });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };