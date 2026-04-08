import supabase from "../config/supabase.js"
import bcrypt from "bcrypt"

// 🔹 OBTENER TODOS LOS USUARIOS (ADMIN)
// 🔹 OBTENER USUARIOS (ADMIN) CON BÚSQUEDA
export const getUsuariosAdmin = async (req, res) => {

  try {

    const { search } = req.query

    let query = supabase
      .from("usuarios")
      .select(`
        id,
        nombre_completo,
        username,
        email,
        direccion,
        telefono,
        creado_en,
        last_login
      `)

    // 🔎 búsqueda
    if (search) {
      query = query.or(
        `nombre_completo.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error } = await query.order("id", { ascending: true })

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    res.json({
      total: data.length,
      usuarios: data
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}
// 🔹 CREAR USUARIO (ADMIN)
// 🔹 ADMIN CREA USUARIO CON PERMISOS
export const createUserAdmin = async (req, res) => {
  try {
    const {
      nombre_completo,
      username,
      email,
      password,
      direccion,
      telefono,
      permisos = [] // Array opcional de IDs de permisos
    } = req.body

    // 🔴 Validaciones básicas
    if (!nombre_completo || !username || !email || !password || !direccion || !telefono) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" })
    }

    // 🔴 Validar teléfono
    if (!/^[0-9]{10}$/.test(telefono)) {
      return res.status(400).json({ message: "El teléfono debe tener 10 dígitos" })
    }

    // 🔴 Validar contraseña segura
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo"
      })
    }

    // 🔴 Verificar email existente
    const { data: existingEmail } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle()
    if (existingEmail) return res.status(400).json({ message: "El correo ya está registrado" })

    // 🔴 Verificar username existente
    const { data: existingUsername } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .maybeSingle()
    if (existingUsername) return res.status(400).json({ message: "El username ya existe" })

    // 🔒 Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // 🔹 Insertar usuario
    const { data: userData, error: insertError } = await supabase
      .from("usuarios")
      .insert([{ nombre_completo, username, email, password: hashedPassword, direccion, telefono }])
      .select()
      .single()

    if (insertError) return res.status(500).json({ message: insertError.message })

    const { password: _, id: userId } = userData
    const userSafe = { ...userData }
    delete userSafe.password

    // 🔹 Asignar permisos si vienen en el body
    if (permisos.length > 0) {
      const permisosData = permisos.map((permisoId) => ({
        usuario_id: userId,
        grupo_id: null, // Si no es para grupo, ponemos null
        permiso_id: permisoId
      }))

      const { error: permisosError } = await supabase
        .from("grupo_usuario_permisos")
        .insert(permisosData)

      if (permisosError) {
        return res.status(500).json({ message: "Usuario creado pero falló asignar permisos: " + permisosError.message })
      }
    }

    res.status(201).json({
      message: "Usuario creado por admin con permisos",
      user: userSafe
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}



// 🔹 EDITAR USUARIO (ADMIN)
export const updateUserAdmin = async (req, res) => {

  try {

    const { id } = req.params

    const {
      nombre_completo,
      username,
      email,
      direccion,
      telefono
    } = req.body

    if (!nombre_completo || !username || !email || !direccion || !telefono) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios"
      })
    }

    // validar teléfono
    if (!/^[0-9]{10}$/.test(telefono)) {
      return res.status(400).json({
        message: "El teléfono debe tener 10 dígitos"
      })
    }

    // verificar username repetido
    const { data: existingUsername } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .neq("id", id)
      .maybeSingle()

    if (existingUsername) {
      return res.status(400).json({
        message: "El username ya está en uso"
      })
    }

    // verificar email repetido
    const { data: existingEmail } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .neq("id", id)
      .maybeSingle()

    if (existingEmail) {
      return res.status(400).json({
        message: "El correo ya está en uso"
      })
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        nombre_completo,
        username,
        email,
        direccion,
        telefono
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ message: error.message })
    }

    res.json({
      message: "Usuario actualizado correctamente",
      user: data
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}



// 🔹 ELIMINAR USUARIO (ADMIN)
export const deleteUserAdmin = async (req, res) => {

  try {

    const { id } = req.params

    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    res.json({
      message: "Usuario eliminado correctamente"
    })

  } catch (error) {

    res.status(500).json({
      message: error.message
    })

  }

}
