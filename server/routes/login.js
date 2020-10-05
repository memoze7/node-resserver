const express = require('express');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


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

async function verify(ID) {
    const ticket = await client.verifyIdToken({
        idToken: ID,
        audience: process.env.CLIENT_ID
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}
verify().catch(console.error);

app.post('/google', async (req, res) => {
    const ID = req.body.idtoken;

    const googleUser = await verify(ID)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            })
        })

    Usuario.findOne({
        email: googleUser.email
    }, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        };

        if (usuario) {
            if (!usuario.google) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autenticación normal'
                    }
                });
            } else {
                const token = jwt.sign({
                    usuario: usuario
                }, process.env.SEED, {
                    expiresIn: process.env.CADUCIDAD_TOKEN
                });

                return res.json({
                    ok: true,
                    usuario,
                    token
                })
            }
        }
        // si el usuario no existe en nuestra base de datos
        const usuarioDB = new Usuario();
        usuarioDB.nombre = googleUser.nombre;
        usuarioDB.email = googleUser.email;
        usuarioDB.img = googleUser.img;
        usuarioDB.google = true;
        usuarioDB.password = ':)';
        usuarioDB.save((err, usuario) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            };

            const token = jwt.sign({
                usuario: usuario
            }, process.env.SEED, {
                expiresIn: process.env.CADUCIDAD_TOKEN
            });

            return res.json({
                ok: true,
                usuario,
                token
            })

        })

    })

})

module.exports = app;