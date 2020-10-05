const express = require('express');
const Producto = require('../models/producto');
const _ = require('underscore');

const {
    verificaToken
} = require('../middlewares/auth');

const app = express();



//=========================================
// Obtener producto
//=========================================
app.get('/producto', verificaToken, (req, res) => {
    //trae todos los productos
    // populate usuario y categoría 
    //paginado
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    Producto.find({
            disponible: true
        })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('categoria')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments({
                disponible: true
            }, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    total,
                    producto
                });
            })
        })

})

//=========================================
// Obtener producto por id
//=========================================

app.get('/producto/:id', verificaToken, (req, res) => {
    // populate usuario y categoría 
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    const id = req.params.id;
    Producto.findById(id, (err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto
            })
        }).skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria')
})


//=========================================
// Buscar product
//=========================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    const termino = req.params.termino;
    const regex = new RegExp(termino, 'i')

    Producto.find({
            nombre: regex
        })
        .populate('categoria', 'nombre descripcion')
        .exec((err, producto) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            Producto.countDocuments({
                disponible: true
            }, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    total,
                    producto
                });
            })
        })


});

//=========================================
// Crear un nuevo producto
//=========================================

app.post('/producto', verificaToken, (req, res) => {
    // grabar el usuario
    // grabar la categoría del listado
    const {
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria
    } = req.body;

    let producto = new Producto({
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria,
        usuario: req.usuario._id
    })

    producto.save((err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto
        })
    })
})

// //=========================================
// // Actualizar un producto
// //=========================================

app.put('/producto/:id', verificaToken, (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria'])

    Producto.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            producto
        })

    })
});

// //=========================================
// // Borrar un producto
// //=========================================

app.delete('/producto/:id', verificaToken, (req, res) => {
    // desactivar el disponible
    const id = req.params.id;
    Producto.findByIdAndUpdate(id, {
        disponible: false
    }, {
        new: true
    }, (err, producto) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!producto) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto
        })
    })

});

module.exports = app;