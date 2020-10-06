const express = require('express');

const fs = require('fs');
const path = require('path');
const {
    verificaToken
} = require('../middlewares/auth');

const app = express();

app.get('/imagen/:tipo/:nombreArchivo', verificaToken, (req, res) => {
    const tipo = req.params.tipo;
    const nombreArchivo = req.params.nombreArchivo;

    // const pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);

    const pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${nombreArchivo}`);

    if (fs.existsSync(pathImage)) {
        return res.sendFile(pathImage);

    }

    const pathNoImage = path.resolve(__dirname, `../assets/no-image.jpg`);


    res.sendFile(pathNoImage);

});

module.exports = app;