const express = require('express');
const router = express.Router();
const passport = require('passport');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
//OBJETO PARA VERIFICAR SI ESTÁ LOGGED EL USER
const { isLoggedIn } = require('../../model/auth');
const pool = require('../../model/database');
const helpers = require('../../model/helpers');


//

router.get('/', (req, res) => {
    res.render('auth/signin')
})

router.get('/recuperacion', (req, res) => {
    res.render('recuperacion');
})

//RECUPERACION ENVIO DEL EMAIL
router.post('/send-email', async (req, res, next) => {
    const { txt_Email } = req.body;
    //CREACION DEL TOKEN DE SEGURIDAD
    const token = jwt.sign({ txt_Email }, 'activate123', { expiresIn: '20min' });

    content = `
    <h1> Correo de Recuperación de Contraseña</h1>
    <ul>
        <li>Acceda al siguiente enlace para cambiar su contraseña:https://omega-projects.herokuapp.com/restablecer/${token}</li>
    </ul>`;

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
        to: txt_Email,
        subject: 'Recuperación de Contraseña Omega Projects',
        text: 'Hola',
        html: content
    });

    console.log('Message sent', info.messageId);
    req.flash('success', 'Solicitud aprobada, revise su correo para más información');
    res.redirect('/signin');
});

//RESTABLECER CONTRASEÑA
router.get('/restablecer/:token', async (req, res) => {


    try {
        const { txt_Email } = jwt.verify(req.params.token, 'activate123');
        global.globalCorreo = txt_Email;
        console.log("TOKEN ENCONTRADO RESTABLECER");
        console.log(globalCorreo);
        res.render('restablecer2');

    } catch (error) {
        console.log('TOKEN ERROR RESTABLECER');
        res.redirect('/');
        req.flash('error', 'Enlace caducado, contacte con el administrador');

    }

});

//CAMBIAR CONTRASEÑA
router.post('/restablecer', async (req, res, next) => {

    const { txt_Contrasenia, txt_Contrasenia2 } = req.body;


    if (txt_Contrasenia)

        if (txt_Contrasenia == txt_Contrasenia2) {
            console.log("Contraseñas si coinciden");
            await pool.query('UPDATE usuarios_login SET contrasena = ? WHERE correo = ?', [await helpers.encryptPassword(txt_Contrasenia), globalCorreo]);
            globalCorreo = '';
            req.flash('success', 'Operación exitosa, se restableció su contraseña');
            res.redirect('/signin');
        } else {
            console.log("Contraseñas no coinciden");
            req.flash('error', 'Las contraseñas no coinciden');
            res.redirect('/restablecer');
        }

});

router.get('/inicio', isLoggedIn, async (req, res) => {

    const proyectos = await pool.query('SELECT * FROM PROYECTO');
    console.log(proyectos)
    res.render('inicio', { proyectos });
});

router.get('/registerProject', isLoggedIn, (req, res) => {
    res.render('registerProject');
});


//REGISTRAR PROYECTO
router.post('/registerProject', async (req, res) => {

    console.log('REGISTRO PROYECTO');


    const { COD_PROYECTO } = req.body;
    const { NOM_PROYECTO } = req.body;
    const { TIPO_PROYECTO } = req.body;
    const { FECHA_INICIO } = req.body
    const { TIEMPO_ESTIPULADO } = req.body



    //VERIFICA SI YA EXISTE ESTE PROYECTO EN LA BD REGISTRADO
    const rows = await pool.query('SELECT * FROM PROYECTO WHERE COD_PROYECTO = ?', [COD_PROYECTO]);

    if (rows.length > 0) {
        req.flash('error', 'Ya existe un proyecto registrado con el mismo código');

    } else {

        //SE GUARDA EN LA BD
        await pool.query('INSERT INTO PROYECTO(COD_PROYECTO, NOM_PROYECTO, FECHA_INICIO, TIPO_PROYECTO, AVANCE, TIEMPO_ESTIPULADO, TIEMPO_REAL) VALUES (?, ?, ?, ?, ?, ?, ?)', [COD_PROYECTO, NOM_PROYECTO, FECHA_INICIO, TIPO_PROYECTO, 0, TIEMPO_ESTIPULADO, '0']);
        req.flash('success', 'Proyecto registro de forma exitosa');
        //await pool.query('UPDATE usuarios_login SET verificado = ? WHERE correo = ?', ['NO', correo]);



    }

    res.redirect('/registerProject');


});

router.post('/detalles', isLoggedIn, async (req, res) => {

    const row = await pool.query('SELECT * FROM PROYECTO WHERE COD_PROYECTO = ?',[req.body.buscarProyecto]);
    if(row.length > 0){
        const proyecto = row[0];
        res.render('detalles', { proyecto });
    }else{
        const proyectos = await pool.query('SELECT * FROM PROYECTO');
        res.render('inicio', { proyectos });
    }

    
    
    
});



module.exports = router;