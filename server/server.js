require('./config/config')

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())

// rutas
app.use(require('./routes/usuario'));

// conexión mongoose
// mongoose.connect('mongodb://localhost:27017/cafe', {
mongoose.connect(`${process.env.URLDB}/cafe`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, (err, res) => {
    if (err) throw err;

    console.log('Base de datos ONLINE');
});

app.listen(process.env.PORT, () => console.log('Escuchando el puerto 3000'));