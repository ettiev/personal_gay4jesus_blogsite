module.exports = (req, res, next) => {
    if (!req.session.isLoggedIn || req.session.user.role != "admin") {
        return res.redirect("/login");
    }
    next();
}