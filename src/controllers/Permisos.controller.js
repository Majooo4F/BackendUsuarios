// import supabase from "../config/supabase.js";

// // 🔹 GET todos los permisos
// export const getPermisos = async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("permisos")
//       .select("*")
//       .order("id", { ascending: true });

//     if (error) return res.status(500).json({ message: error.message });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // 🔹 INSERTAR permisos iniciales
// export const seedPermisos = async (req, res) => {
//   try {
//     const permisos = [
//       // USERS
//       { nombre: "user:view", descripcion: "Ver usuarios" },
//       { nombre: "user:add", descripcion: "Agregar usuarios" },
//       { nombre: "user:edit", descripcion: "Editar usuarios" },
//       { nombre: "user:edit:profile", descripcion: "Editar perfil" },
//       { nombre: "user:delete", descripcion: "Eliminar usuarios" },
//       { nombre: "user:manage", descripcion: "Administrar usuarios" },

//       // GROUPS
//       { nombre: "group:view", descripcion: "Ver grupos" },
//       { nombre: "group:add", descripcion: "Agregar grupos" },
//       { nombre: "group:edit", descripcion: "Editar grupos" },
//       { nombre: "group:delete", descripcion: "Eliminar grupos" },
//       { nombre: "group:manage", descripcion: "Administrar grupos" },

//       // TICKETS
//       { nombre: "ticket:view", descripcion: "Ver tickets" },
//       { nombre: "ticket:add", descripcion: "Agregar tickets" },
//       { nombre: "ticket:edit", descripcion: "Editar tickets" },
//       { nombre: "ticket:delete", descripcion: "Eliminar tickets" },
//       { nombre: "ticket:edit:state", descripcion: "Editar estado de ticket" },
//       { nombre: "ticket:edit:comment", descripcion: "Editar comentarios de ticket" },
//       { nombre: "ticket:manage", descripcion: "Administrar tickets" }
//     ];

//     const { data, error } = await supabase
//       .from("permisos")
//       .insert(permisos)
//       .select();

//     if (error) return res.status(500).json({ message: error.message });

//     res.status(201).json({ message: "Permisos iniciales insertados", permisos: data });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };