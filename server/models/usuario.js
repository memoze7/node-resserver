const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');


const rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} no es un rol válido'
}

const Schema = mongoose.Schema;

let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario'],
    },
    password: {
        type: String,
        required: [true, 'El password es necesario']
    },
    img: {
        type: String,
        required: false
    }, // no es obligatoria
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    }, //default: 'USE_ROLE
    estado: {
        type: Boolean,
        default: true
    }, //boolean
    google: {
        type: Boolean,
        default: false
    }, //boolean
});

usuarioSchema.methods.toJSON = function () {

    const user = this;
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
}

usuarioSchema.plugin(uniqueValidator, {
    message: '{PATH} debe ser único'
});

module.exports = mongoose.model('Usuario', usuarioSchema);