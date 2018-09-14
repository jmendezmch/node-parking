const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const _ = require('underscore');

const User = require('../models/user');
const { verificaToken, verificaAdminRol } = require('../middlewares/autenticacion');

app.post('/register', (req, res) => {
    let body = req.body;
    // let password = 
    if (!body.name || !body.email || !body.password) {
        return res.status(500).send({
            ok: false,
            err: {
                message: 'Campos necesarios'
            }
        });
    }
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10)
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }
        // userDB.password = null;
        return res.json({
            ok: true,
            user: userDB
        });
    });
});

app.post('/user-admin', [verificaToken, verificaAdminRol], (req, res) => {
    let body = req.body;
    // let password = 
    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    user.save((err, userDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }
        // userDB.password = null;
        return res.json({
            ok: true,
            user: userDB
        });
    });
});

app.put('/user/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'active']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }
        if (!userDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'No existe el usuario'
                }
            });
        }
        return res.json({
            ok: true,
            user: userDB
        });

    });
});

app.get('/user', verificaToken, (req, res) => {
    let desde = Number(req.query.desde) || 0;
    desde = Number(desde);
    let limite = Number(req.query.limite) || 5;
    limite = Number(limite);

    User.find({ active: true }, 'name email google img')
        .skip(desde)
        .limit(limite)
        .exec((err, users) => {
            if (err) {
                return res.status(500).send({
                    ok: false,
                    err
                });
            }
            User.count({ active: true }, (err, count) => {
                return res.json({
                    ok: true,
                    total: count,
                    users
                });
            });

        });
});

app.delete('/user/:id', [verificaToken, verificaAdminRol], (req, res) => {
    let id = req.params.id;

    User.findByIdAndUpdate(id, { active: false }, { new: true, runValidators: true }, (err, userDB) => {
        if (err) {
            return res.status(500).send({
                ok: false,
                err
            });
        }
        if (!userDB) {
            return res.status(400).send({
                ok: false,
                err: {
                    message: 'No existe el usuario'
                }
            });
        }
        return res.json({
            ok: true,
            user: userDB
        });

    });
});

module.exports = app;