const isAdminAuthenticated = (req, res, next) => {
    if (req.session.isAdminAuthenticated) {
        return next();
    }
    res.redirect('/adminLogin');
};

const isSuperAdmin = (req, res, next) => {
    if (req.session.isAdminAuthenticated && req.session.isSuperAdmin) {
        return next();
    }
    res.redirect('/adminLogin');
};

module.exports = { isAdminAuthenticated, isSuperAdmin };