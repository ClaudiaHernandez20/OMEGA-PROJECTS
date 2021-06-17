const express = require('express');
const router = express.Router();
const passport = require('passport');
const pool = require('../../model/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const helpers = require('../../model/helpers');
const nodemailer = require('nodemailer');
const password = require('secure-random-password');

//OBJETO PARA VERIFICAR SI ESTÁ LOGGED EL USER
const { isLoggedIn } = require('../../model/auth');
const { isNotLoggedIn } = require('../../model/auth');
const e = require('express');
dotenv.config();

router.get('/signup', (req, res) => {
    res.render('auth/signup')
});

//AL HACER UN SIGNUP VIAJA A PASSPORT.JS A PASSPORT
/*router.post('/signup', isNotLoggedIn, passport.authenticate('local.signup', {
    successRedirect: '/inicio',
    failureRedirect: '/singup',
    failureFlash: true
}));*/

router.post('/signup', isLoggedIn, async (req, res) => {
    //CREAR NUEVO USUARIO
    const { nom_usuario } = req.body;
    const { tipo_usuario } = req.body;
    const { area_pertenencia } = req.body;
    const { correo } = req.body
    const { TEL_USUARIO } = req.body
    const { HOR_USUARIO } = req.body
    const { contrasena } = '';
    const { emailToken } = '';
    const { verificado } = 'NO';
    const { ESTATUS } = "DISPONIBLE";
    const newUser = {
        correo,
        contrasena,
        nom_usuario,
        tipo_usuario,
        area_pertenencia,
        emailToken,
        verificado,
        TEL_USUARIO,
        HOR_USUARIO,
        ESTATUS
    };

    //VERIFICA SI YA EXISTE ESTE USUARIO EN LA BD REGISTRADO
    const rows = await pool.query('SELECT * FROM usuarios_login WHERE correo = ?', [correo]);

    if (rows.length > 0) {
        req.flash('error', 'Ya existe un usuario registrado con el mismo correo ingresado');

    } else {

        //SE GUARDA EN LA BD
        const result = await pool.query('INSERT INTO usuarios_login SET ?', [newUser]);
        newUser.id = result.insertId;
        console.log(result);
        console.log(newUser);
        //ENVIO EMAIL DE CONFIRMACION
        const token = jwt.sign({ nom_usuario, correo }, 'activate123', { expiresIn: '20min' });
        content = `
        <h1> Correo de Confirmación de Cuenta</h1>  
        <p>Acceda al siguiente enlace para activar su cuenta: https://omega-projects.herokuapp.com/emailActivate/${token}</p>
        `;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'omega.projects.adm@gmail.com',
                pass: 'admin14502'
            },
            tls: {
                rejectUnauthorized: false
            }
        })
        const info = await transporter.sendMail({
            from: "'Omega Projects' <omega.projects.adm@gmail.com>",
            to: correo,
            subject: 'Activación de tu cuenta de Omega Projects',
            text: 'Hola',
            html: content
        });

        await pool.query('UPDATE usuarios_login SET verificado = ? WHERE correo = ?', ['NO', correo]);
        await pool.query('UPDATE usuarios_login SET ESTATUS = ? WHERE correo = ?', ['DISPONIBLE', correo]);
        req.flash('success', 'Usuario registrado');
    }

    res.redirect('/signup');
})

router.get('/signin', isNotLoggedIn, (req, res) => {
    res.render('auth/signin');
});

//AL HACER UN SIGNIN VIAJA A PASSPORT.JS A PASSPORT
router.post('/signin', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local.signin', {
        //REDIRECCIONA SI FUE CORRECTO O NO
        successRedirect: '/inicio',
        failureRedirect: '/signin',
        failureFlash: true
    })(req, res, next);
});

//CERRAR SESIÓN
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/signin');
});


//ACTIVACION DE CUENTA POR CORREO
router.get('/emailActivate/:token', async (req, res) => {

    try {
        //ACTIVACION DE CUENTA
        const { nom_usuario, correo } = jwt.verify(req.params.token, 'activate123');
        console.log('TOKEN ENCONTRADO');
        //console.log(nom_usuario, correo);
        await pool.query('UPDATE usuarios_login SET verificado = ? WHERE correo = ?', ['SI', correo]);

        const contra = password.randomPassword({ characters: password.lower + password.upper + password.digits })
        await pool.query('UPDATE usuarios_login SET contrasena = ? WHERE correo = ?', [await helpers.encryptPassword(contra), correo]);

        //ENVIO EMAIL CUENTA YA ACTIVADA
        content = `
        <h1> Tu cuenta de Omega ya ha sido activada</h1>  
        <p>Felicidades se activó de manera correcta tu cuenta de Omega Projects: </p>
        <p>Puedes ingresar utilizando tu correo como usuario junto con la siguiente contraseña: <strong>${contra}</strong></p>
        `;
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'omega.projects.adm@gmail.com',
                pass: 'admin14502'
            },
            tls: {
                rejectUnauthorized: false
            }
        })
        const info = await transporter.sendMail({
            from: "'Omega Projects' <omega.projects.adm@gmail.com>",
            to: correo,
            subject: 'Tu cuenta de Omega Projects ha sido activada',
            text: 'Hola',
            html: content
        });

    } catch (error) {
        console.log('TOKEN ERROR');
    }
    res.redirect('/');
});

module.exports = router;