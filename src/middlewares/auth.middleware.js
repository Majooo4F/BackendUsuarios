import jwt from "jsonwebtoken"

const SECRET = process.env.JWT_SECRET

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]

    if (!authHeader) {
      return res.status(403).json({
        message: "Token requerido"
      })
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Formato de token inválido"
      })
    }

    const token = authHeader.split(" ")[1]

    const decoded = jwt.verify(token, SECRET)

    req.user = decoded

    next()

  } catch (err) {
    return res.status(401).json({
      message: "Token inválido o expirado"
    })
  }
}