const express = require('express');
const Categoria = require('../models/categoria');
const _ = require('underscore');
const {
    verificaToken,
    verificaAdmin_Role
} = require('../middlewares/auth');


const app = express();
//verifica token

//=================
//Mostrar todas las categorías
//=================

app.get('/categoria', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    Categoria.find({})
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, total) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                res.json({
                    ok: true,
                    total,
                    categoria
                });
            })
        });



});

//=================
//Mostrar categorías por ID
//=================

app.get('/categoria/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    Categoria.findById(id, (err, categoria) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                categoria
            })
        }).sort('nombre')
        .populate('usuario', 'nombre email')
});

//=================
//Crear una nueva categoría
//=================

app.post('/categoria', verificaToken, (req, res) => {
    //regresa la nueva categoría
    // req.usuario._id
    const {
        nombre
    } = req.body;

    let categoria = new Categoria({
        nombre,
        usuario: req.usuario._id
    });

    categoria.save((err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            categoria
        })
    })
});

//====================================
//Actualizar una categoría
//====================================

app.put('/categoria/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    const body = _.pick(req.body, ['nombre']);
    // body.usuario = req.usuario._id

    Categoria.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });

});

//=================
//borra una categoría
//=================

app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {

    const id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoria) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria
        });
    })

});


module.exports = app;