import supabase from "../config/supabase.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { validateUser } from "../schemas/user.schema.js"

const SECRET = process.env.JWT_SECRET


// ================= REGISTER =================

export const register = async (req, res) => {

  try {

    if (!validateUser(req.body)) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: validateUser.errors
      })
    }

    const {
      nombre_completo,
      username,
      email,
      password,
      confirmPassword,
      direccion,
      telefono,
      fechaNacimiento
    } = req.body

    if (!direccion || !telefono) {
  return res.status(400).json({
    message: "Dirección y teléfono son obligatorios"
  })
}


    // 🔹 Validar confirmación password
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Las contraseñas no coinciden"
      })
    }


    // 🔹 Validar edad mínima 18
    const nacimiento = new Date(fechaNacimiento)
    const hoy = new Date()

    let edad = hoy.getFullYear() - nacimiento.getFullYear()

    const mes = hoy.getMonth() - nacimiento.getMonth()

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--
    }

    if (edad < 18) {
      return res.status(400).json({
        message: "Debes ser mayor de 18 años para registrarte"
      })
    }


    // 🔹 Verificar si el correo ya existe
    const { data: existingEmail } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingEmail) {
      return res.status(400).json({
        message: "El correo ya está registrado"
      })
    }


    // 🔹 Verificar username repetido
    const { data: existingUser } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (existingUser) {
      return res.status(400).json({
        message: "El usuario ya existe"
      })
    }


    // 🔹 Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)


    // 🔹 Insertar usuario
    const { data, error } = await supabase
      .from("usuarios")
      .insert([{
        nombre_completo,
        username,
        email,
        password: hashedPassword,
        direccion,
        telefono
      }])
      .select()
      .single()


    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    const { password: _, ...userSafe } = data


    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: userSafe
    })

  } catch (err) {

    res.status(500).json({
      message: err.message
    })

  }

}



// ================= LOGIN =================

export const login = async (req, res) => {

  try {

    const { email, password } = req.body 

    if (!email || !password) {
  return res.status(400).json({
    message: "Email y password son obligatorios"
  })
}

    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single()

    if (error || !user) {
      return res.status(401).json({
        message: "Usuario no encontrado"
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({
        message: "Password incorrecto"
      })
    }

    await supabase
      .from("usuarios")
      .update({ last_login: new Date() })
      .eq("id", user.id)

   const token = jwt.sign(
  {
    id: user.id,
    email: user.email,
    username: user.username
  },
  SECRET,
  { expiresIn: "1h" }
)

    const { password: _, ...userSafe } = user

    res.json({
      message: "Login exitoso",
      token,
      user: userSafe
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}



// ================= GET USERS =================

export const getUsuarios = async (req, res) => {

  try {

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    const users = data.map(({ password, ...user }) => user)

    res.json(users)

  } catch (err) {
    res.status(500).json({ message: err.message })
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
      .from("usuarios")
      .update(updatedData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    const { password, ...userSafe } = data

    res.json({
      message: "Usuario actualizado",
      user: userSafe
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}



// ================= DELETE USER =================

export const deleteUser = async (req, res) => {

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
      message: "Usuario eliminado"
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}
// ================= GET PERFIL =================

export const getPerfil = async (req, res) => {

  try {

    const userId = req.user.id

    const { data, error } = await supabase
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
      .eq("id", userId)
      .single()

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    res.json({
      perfil: data
    })

  } catch (err) {

    res.status(500).json({
      message: err.message
    })

  }

}
// ================= UPDATE PERFIL =================

export const updatePerfil = async (req, res) => {

  try {

    const userId = req.user.id

    const {
      nombre_completo,
      username,
      email,
      direccion,
      telefono,
      password
    } = req.body

    let updatedData = {
      nombre_completo,
      username,
      email,
      direccion,
      telefono
    }

    // 🔒 si quiere cambiar password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updatedData.password = hashedPassword
    }

    // 🔎 verificar username repetido
    const { data: existingUsername } = await supabase
      .from("usuarios")
      .select("id")
      .eq("username", username)
      .neq("id", userId)
      .maybeSingle()

    if (existingUsername) {
      return res.status(400).json({
        message: "El username ya está en uso"
      })
    }

    // 🔎 verificar email repetido
    const { data: existingEmail } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .neq("id", userId)
      .maybeSingle()

    if (existingEmail) {
      return res.status(400).json({
        message: "El correo ya está en uso"
      })
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update(updatedData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    const { password: _, ...userSafe } = data

    res.json({
      message: "Perfil actualizado correctamente",
      perfil: userSafe
    })

  } catch (err) {

    res.status(500).json({
      message: err.message
    })

  }

}