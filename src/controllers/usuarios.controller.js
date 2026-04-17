import supabase from "../config/supabase.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { validateUser } from "../schemas/user.schema.js"
import { sendResponse } from "../helpers/response.js"

const SECRET = process.env.JWT_SECRET

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    if (!validateUser(req.body)) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Datos inválidos", errors: validateUser.errors }
      })
    }

    const {
      nombre_completo, username, email,
      password, confirmPassword, direccion,
      telefono, fechaNacimiento
    } = req.body

    if (password !== confirmPassword) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Las contraseñas no coinciden" }
      })
    }

    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()
    let edad = hoy.getFullYear() - nacimiento.getFullYear()
    const mes = hoy.getMonth() - nacimiento.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--

    if (edad < 18) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Debes ser mayor de 18 años para registrarte" }
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

    const { data: existingUser } = await supabase
      .from("usuarios").select("id").eq("username", username).maybeSingle()

    if (existingUser) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El usuario ya existe" }
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { data, error } = await supabase
      .from("usuarios")
      .insert([{ nombre_completo, username, email, password: hashedPassword, direccion, telefono }])
      .select()
      .single()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    // ← asignar permisos básicos al nuevo usuario
    const permisosBasicos = [1, 4] // user:view, user:edit:profile
    await supabase
      .from("grupo_usuario_permisos")
      .insert(permisosBasicos.map(permiso_id => ({
        usuario_id: data.id,
        permiso_id,
        grupo_id: 9  // grupo Default
      })))

    const { password: _, ...userSafe } = data

    return sendResponse(res, {
      statusCode: 201,
      intOpCode: "SxUS201",
      data: { message: "Usuario registrado correctamente", user: userSafe }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Email y password son obligatorios" }
      })
    }

    const { data: user, error } = await supabase
      .from("usuarios").select("*").eq("email", email).single()

    if (error || !user) {
      return sendResponse(res, {
        statusCode: 401,
        intOpCode: "SxUS401",
        data: { message: "Usuario no encontrado" }
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return sendResponse(res, {
        statusCode: 401,
        intOpCode: "SxUS401",
        data: { message: "Password incorrecto" }
      })
    }

    await supabase
      .from("usuarios").update({ last_login: new Date() }).eq("id", user.id)

    const { data: miembros } = await supabase
      .from("grupo_miembros")
      .select("grupo_id, grupos(id, nombre)")
      .eq("usuario_id", user.id)

    const grupos = miembros?.map(m => ({
      id: m.grupo_id,
      nombre: m.grupos?.nombre
    })) || []

    const { data: permisoData } = await supabase
      .from("grupo_usuario_permisos")
      .select("permiso_id, permisos(nombre)")
      .eq("usuario_id", user.id)
      .eq("activo", true)

    const permisos = [
      ...new Set(permisoData?.map(p => p.permisos?.nombre).filter(Boolean) || [])
    ]

    // ✅ permisos incluidos en el JWT como requiere el documento
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        permissions: permisos  // ← LIST de permisos dentro del token
      },
      SECRET,
      { expiresIn: "1h" }
    )

    const { password: _, ...userSafe } = user

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { token, user: userSafe, grupos, permisos }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= GET USUARIOS =================
export const getUsuarios = async (req, res) => {
  try {
    const { data, error } = await supabase.from("usuarios").select("*")

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    const users = data.map(({ password, ...user }) => user)

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: users
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updatedData = { ...req.body }

    if (updatedData.password) {
      updatedData.password = await bcrypt.hash(updatedData.password, 10)
    }

    const { data, error } = await supabase
      .from("usuarios").update(updatedData).eq("id", id).select().single()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    const { password, ...userSafe } = data

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { message: "Usuario actualizado", user: userSafe }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= DELETE USER =================
// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // 1. Borrar permisos del usuario
    const { error: errorPermisos } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("usuario_id", id)

    if (errorPermisos) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error permisos: " + errorPermisos.message }
      })
    }

    // 2. Borrar membresías del usuario
    const { error: errorMiembros } = await supabase
      .from("grupo_miembros")
      .delete()
      .eq("usuario_id", id)

    if (errorMiembros) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error miembros: " + errorMiembros.message }
      })
    }

    // 3. Desasociar tickets donde es autor
    const { error: errorAutor } = await supabase
      .from("tickets")
      .update({ autor_id: null })
      .eq("autor_id", id)

    if (errorAutor) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error tickets autor: " + errorAutor.message }
      })
    }

    // 4. Desasociar tickets donde es asignado
    const { error: errorAsignado } = await supabase
      .from("tickets")
      .update({ asignado_id: null })
      .eq("asignado_id", id)

    if (errorAsignado) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error tickets asignado: " + errorAsignado.message }
      })
    }

    // 5. Desasociar grupos donde es creador
    const { error: errorGrupos } = await supabase
      .from("grupos")
      .update({ creador_id: null })
      .eq("creador_id", id)

    if (errorGrupos) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: "Error grupos: " + errorGrupos.message }
      })
    }

    // 6. Borrar el usuario
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

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= GET PERFIL =================
export const getPerfil = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]

    if (!userId) {
      return sendResponse(res, {
        statusCode: 401,
        intOpCode: "SxUS401",
        data: { message: "No autorizado" }
      })
    }

    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nombre_completo, username, email, direccion, telefono, creado_en, last_login")
      .eq("id", userId)
      .maybeSingle()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    if (!data) {
      return sendResponse(res, {
        statusCode: 404,
        intOpCode: "SxUS404",
        data: { message: "Usuario no encontrado" }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}

// ================= UPDATE PERFIL =================
export const updatePerfil = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]

    if (!userId) {
      return sendResponse(res, {
        statusCode: 401,
        intOpCode: "SxUS401",
        data: { message: "No autorizado" }
      })
    }

    const { nombre_completo, username, email, direccion, telefono, password } = req.body

    if (!nombre_completo || !username || !email || !direccion || !telefono) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "Todos los campos son obligatorios" }
      })
    }

    let updatedData = { nombre_completo, username, email, direccion, telefono }

    if (password) {
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
        return sendResponse(res, {
          statusCode: 400,
          intOpCode: "SxUS400",
          data: { message: "La contraseña debe tener mínimo 8 caracteres, una mayúscula, un número y un símbolo" }
        })
      }
      updatedData.password = await bcrypt.hash(password, 10)
    }

    const { data: existingUsername } = await supabase
      .from("usuarios").select("id").eq("username", username).neq("id", userId).maybeSingle()

    if (existingUsername) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El username ya está en uso" }
      })
    }

    const { data: existingEmail } = await supabase
      .from("usuarios").select("id").eq("email", email).neq("id", userId).maybeSingle()

    if (existingEmail) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxUS400",
        data: { message: "El correo ya está en uso" }
      })
    }

    const { data, error } = await supabase
      .from("usuarios").update(updatedData).eq("id", userId).select().single()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxUS500",
        data: { message: error.message }
      })
    }

    const { password: _, ...userSafe } = data

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxUS200",
      data: { message: "Perfil actualizado correctamente", perfil: userSafe }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxUS500",
      data: { message: err.message }
    })
  }
}
