import supabase from "../config/supabase.js"
import bcrypt from "bcrypt"
import { sendResponse } from "../helpers/response.js"

// ================= GET USUARIOS ADMIN =================
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

    if (search) {
      query = query.or(
        `nombre_completo.ilike.%${search}%,username.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    const { data, error } = await query.order("id", { ascending: true })

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { total: data.length, usuarios: data }
    })

  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: error.message }
    })
  }
}

// ================= CREAR USUARIO ADMIN =================
export const createUserAdmin = async (req, res) => {
  try {
    const {
      nombre_completo, username, email,
      password, direccion, telefono,
      permisos = []
    } = req.body

    if (!nombre_completo || !username || !email || !password || !direccion || !telefono) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Todos los campos son obligatorios" }
      })
    }

    if (!/^[0-9]{10}$/.test(telefono)) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El teléfono debe tener 10 dígitos" }
      })
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo" }
      })
    }

    const { data: existingEmail } = await supabase
      .from("usuarios").select("id").eq("email", email).maybeSingle()

    if (existingEmail) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El correo ya está registrado" }
      })
    }

    const { data: existingUsername } = await supabase
      .from("usuarios").select("id").eq("username", username).maybeSingle()

    if (existingUsername) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El username ya existe" }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data: userData, error: insertError } = await supabase
      .from("usuarios")
      .insert([{ nombre_completo, username, email, password: hashedPassword, direccion, telefono }])
      .select()
      .single()

    if (insertError) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: insertError.message }
      })
    }

    const userSafe = { ...userData }
    delete userSafe.password

    if (permisos.length > 0) {
      const permisosData = permisos.map((permisoId) => ({
        usuario_id: userData.id,
        grupo_id: null,
        permiso_id: permisoId
      }))

      const { error: permisosError } = await supabase
        .from("grupo_usuario_permisos")
        .insert(permisosData)

      if (permisosError) {
        return sendResponse(res, {
          statusCode: 500,
          intOpCode: "SxUS500",
          data: { message: "Usuario creado pero falló asignar permisos: " + permisosError.message }
        })
      }
    }

    return sendResponse(res, {
      statusCode: 201,
      intOpCode: "SxUS201",
      data: { message: "Usuario creado por admin con permisos", user: userSafe }
    })

  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: error.message }
    })
  }
}

// ================= EDITAR USUARIO ADMIN =================
export const updateUserAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre_completo, username, email, direccion, telefono } = req.body

    if (!nombre_completo || !username || !email || !direccion || !telefono) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Todos los campos son obligatorios" }
      })
    }

    if (!/^[0-9]{10}$/.test(telefono)) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El teléfono debe tener 10 dígitos" }
      })
    }

    const { data: existingUsername } = await supabase
      .from("usuarios").select("id").eq("username", username).neq("id", id).maybeSingle()

    if (existingUsername) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El username ya está en uso" }
      })
    }

    const { data: existingEmail } = await supabase
      .from("usuarios").select("id").eq("email", email).neq("id", id).maybeSingle()

    if (existingEmail) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El correo ya está en uso" }
      })
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update({ nombre_completo, username, email, direccion, telefono })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { message: "Usuario actualizado correctamente", user: data }
    })

  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: error.message }
    })
  }
}

// ================= ELIMINAR USUARIO ADMIN =================
export const deleteUserAdmin = async (req, res) => {
  try {
    const { id } = req.params

    // 1. eliminar permisos del usuario
    const { error: errorPermisos } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("usuario_id", id)

    if (errorPermisos) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error al eliminar permisos: " + errorPermisos.message }
      })
    }

    // 2. eliminar membresías de grupos
    const { error: errorMiembros } = await supabase
      .from("grupo_miembros")
      .delete()
      .eq("usuario_id", id)

    if (errorMiembros) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error al eliminar membresías: " + errorMiembros.message }
      })
    }

    // 3. desvincular tickets donde es autor (poner autor_id en null)
    await supabase
      .from("tickets")
      .update({ autor_id: null })
      .eq("autor_id", id)

    // 4. desvincular tickets donde está asignado
    await supabase
      .from("tickets")
      .update({ asignado_id: null })
      .eq("asignado_id", id)

    // 5. eliminar usuario
    const { error } = await supabase
      .from("usuarios")
      .delete()
      .eq("id", id)

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { message: "Usuario eliminado correctamente" }
    })

  } catch (error) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: error.message }
    })
  }
}