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










module.exports = router;