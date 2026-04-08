import Ajv from "ajv"
import addFormats from "ajv-formats"

const ajv = new Ajv({ allErrors: true })

addFormats(ajv)

export const userSchema = {
  type: "object",
  properties: {

    nombre_completo: {
      type: "string",
      minLength: 3
    },

    username: {
      type: "string",
      minLength: 3
    },

    email: {
      type: "string",
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-z]{2,}$"
    },

    direccion: {
      type: "string",
      minLength: 5
    },

    telefono: {
      type: "string",
      pattern: "^[0-9]{10}$"
    },

    fechaNacimiento: {
      type: "string",
      format: "date"
    },

    password: {
      type: "string",
      pattern: "^(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    },

    confirmPassword: {
      type: "string"
    }

  },

  required: [
    "nombre_completo",
    "username",
    "email",
    "password",
    "confirmPassword",
    "direccion",
    "telefono",
    "fechaNacimiento"
  ],

  additionalProperties: false
}

export const validateUser = ajv.compile(userSchema)