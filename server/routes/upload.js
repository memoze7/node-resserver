const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const {
    verificaToken
} = require('../middlewares/auth');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', verificaToken, (req, res) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    if (!req.files)
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        })


    const tipos = ['producto', 'usuario'];
    if (tipos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tipos.join(', ')
            }
        })
    }

    let archivo = req.files.archivo;

    // Extensiones permitidas

    const extensiones = ['png', 'jpg', 'gif', 'jpeg'];
    const ext = archivo.name.split('.').pop();
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`; //.split('.').pop();

    if (extensiones.indexOf(ext) < 0)
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensiones.join(', ')
            }
        })


    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            })

        //
        switch (tipo) {
            case 'usuario':

                imagenUsuario(id, res, nombreArchivo);
                break;
            case 'producto':

                imagenProducto(id, res, nombreArchivo);
                break;

            default:
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Los tipos permitidos son ' + tipos.join(', ')
                    }
                })
                return

        }


    })
})

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findByIdAndUpdate(id, {
        img: nombreArchivo
    }, (err, usuario) => {
        if (err) {
            borrarArchivo('usuario', nombreArchivo)
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!usuario) {
            borrarArchivo('usuario', nombreArchivo)

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            })
        }

        borrarArchivo('usuario', usuario.img)

        res.json({
            ok: true,
            message: 'Archivo subido exitosamente'
        })

    })
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findByIdAndUpdate(id, {
        img: nombreArchivo
    }, (err, producto) => {
        if (err) {
            borrarArchivo('producto', nombreArchivo)
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!producto) {
            borrarArchivo('producto', nombreArchivo)

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }

        borrarArchivo('producto', producto.img)

        res.json({
            ok: true,
            message: 'Archivo subido exitosamente'
        })

    })
}

function borrarArchivo(tipo, nombreArchivo) {
    const pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);

    if (fs.existsSync(pathImage)) {
        fs.unlinkSync(pathImage);
    }

}

module.exports = app;