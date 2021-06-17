const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const pool = require('./database');
const helpers = require('./helpers');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


//VALIDACIÓN DEL SIGNIN
passport.use('local.signin', new LocalStrategy({
    usernameField: 'txt_Email',
    passwordField: 'txt_Contrasenia',
    passReqToCallback: true
}, async (req, txt_Email, txt_Contrasenia, done) => {

    //VALIDACION DE CONTRASEÑA
    const rows = await pool.query('SELECT * FROM usuarios_login WHERE correo = ?', [txt_Email]);
    console.log(rows)
    //SE SACA EL USER DEL ARRAY
    if (rows.length > 0) {
        const user = rows[0];
        //VERIFICA SI LA CUENTA YA SE HA ACTIVADO
        //const verificado = await pool.query('SELECT verificado FROM usuarios_login WHERE correo = ?', [txt_Email]);
        if (user.verificado != 'SI') {
            return done(null, false, req.flash('error', 'La cuenta ingresada todavía no ha sido activada, revise su correo para más información'));
        } else {
            
            const validPassword = await helpers.matchPassword(txt_Contrasenia, user.contrasena);
            //TODO SALIO CORRECTO
            if (validPassword) {
                done(null, user, req.flash('success', 'Bienvenido ' + user.nom_usuario));
                console.log('user correcto');
            } else {
                done(null, false, req.flash('error', 'Contraseña Incorrecta'));
                req.flash('error', 'Contraseña Incorrecta');
                console.log('user incorrecto');
            }
        }
        console.log(user);
    //NO SE ENCONTRO EL USUARIO
    } else {
        console.log('user no existe');
        return done(null, false, req.flash('error', 'El correo ingresado no existe'));
    }

}));

//SIGNUP
passport.use('local.signup', new LocalStrategy({

    usernameField: 'correo', //Recibe desde signup el campo de username
    passwordField: 'contrasena',
    passReqToCallback: true

}, async (req, correo, contrasena, done) => {
    //CREAR NUEVO USUARIO
    const { nom_usuario } = req.body;
    const { tipo_usuario } = req.body;
    const { area_pertenencia } = req.body;
    const emailToken = '';
    const verificado = 'NO';
    const newUser = {
        correo,
        contrasena,
        nom_usuario,
        tipo_usuario,
        area_pertenencia,
        emailToken,
        verificado
    };
    //SE CIFRA PASSWORD
    newUser.contrasena = await helpers.encryptPassword(contrasena);

    //SE GUARDA EN LA BD
    const result = await pool.query('INSERT INTO usuarios_login SET ?', [newUser]);
    newUser.id = result.insertId;
    console.log(result);


    const token = jwt.sign({ nom_usuario, correo }, 'activate123', { expiresIn: '20min' });


    //ENVIO EMAIL DE CONFIRMACION
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


    //return done(null, newUser);
}));
/*
//GUARDAR ID
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//TOMANDO EL ID PARA OBTENER LOS DATOS
passport.deserializeUser(async (id, done) => {
    const rows = await pool.query('SELECT * FROM usuarios_login WHERE id = ?', [id]);
    done(null, rows[0]);
});*/

passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });