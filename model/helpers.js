const helpers = {};
const bcrypt = require('bcryptjs');
const passport = require('passport');
helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash);
    return hash;
};

helpers.matchPassword = async (password, savedPassword) =>{
    //console.log(password);
    //console.log(savedPassword)
    return await bcrypt.compare(password, savedPassword);   
    
};

module.exports = helpers;