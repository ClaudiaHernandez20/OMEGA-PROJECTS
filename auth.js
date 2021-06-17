module.exports = {
    //VERIFICAR SI ESTA EN SESIÓN EL USER
    isLoggedIn(req,res,next) {
        if(req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/signin');
    },
    //VERIFICAR SI NO ESTA EN SESIÓN EL USER

    isNotLoggedIn(req,res,next){
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/inicio')
    }
}
