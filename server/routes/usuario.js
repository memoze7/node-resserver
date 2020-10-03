const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const usuario = require('../models/usuario');

const app = express();


app.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 0;
    limite = Number(limite);

    Usuario.find({
            estado: true
        }, 'nombre email img role estado google')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Usuario.countDocuments({
                estado: true
            }, (err, total) => {

                res.json({
                    ok: true,
                    total,
                    usuarios
                });

            });
        })

});

app.post('/usuario', function (req, res) {
    const body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        delete usuario.password;

        res.json({
            ok: true,
            usuario
        })
    })

});

app.put('/usuario/:id', function (req, res) {
    const id = req.params.id;
    const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario
        })
    })

});

app.delete('/usuario/:id', function (req, res) {

    const id = req.params.id;

    Usuario.findByIdAndUpdate(id, {
        estado: false
    }, {
        new: true,
        runValidators: true,
        context: 'query'
    }, (err, usuario) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario
        })
    });

    // Usuario.findByIdAndRemove(id, (err, usuario) => {
    //     if (err) {
    //         return res.status(400).json({
    //             ok: false,
    //             err
    //         });
    //     }

    //     if (!usuario) {
    //         return res.status(400).json({
    //             ok: false,
    //             err: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         });
    //     }

    //     res.json({
    //         ok: true,
    //         usuario
    //     });
    // })

});

module.exports = app;