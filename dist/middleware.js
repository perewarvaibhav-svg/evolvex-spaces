"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRequired = loginRequired;
function loginRequired(role) {
    return (req, res, next) => {
        if (!req.session.user_id) {
            req.flash('warning', 'Please log in.');
            res.redirect('/login');
            return;
        }
        if (role && req.session.role !== role) {
            req.flash('danger', 'Invalid access.');
            res.redirect('/dashboard');
            return;
        }
        next();
    };
}
