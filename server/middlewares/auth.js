const jwt = require('jsonwebtoken');

//===================
//Verificar token
//===================

const verificaToken = (req, res, next) => {

    const token = req.get('Authorization');

    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            })
        }


        req.usuario = decoded.usuario;

        next();
    })

    // res.json({
    //     token
    // })


}


//===================
//Verificar token
//===================

const verificaAdmin_Role = (req, res, next) => {
    const usuario = req.usuario;



    if (usuario.role !== 'ADMIN_ROLE') {
        return res.status(401).json({
            ok: false,
            err: {
                message: 'El usuario no es administrador '
            }
        })
    }


    next();
}



module.exports = {
    verificaToken,
    verificaAdmin_Role
}