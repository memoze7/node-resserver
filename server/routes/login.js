const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

app.post('/login', function (req, res) {

    const {
        email,
        password
    } = req.body;


    Usuario.findOne({
        email
    }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuario || !bcrypt.compareSync(password, usuario.password)) {

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrecta'
                }
            });

        }

        const token = jwt.sign({
            usuario: usuario
        }, process.env.SEED, {
            expiresIn: process.env.CADUCIDAD_TOKEN
        })

        res.json({
            ok: true,
            usuario,
            token
        })
    })

});

module.exports = app;