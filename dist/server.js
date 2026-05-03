"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./db");
const helpers_1 = require("./helpers");
const public_1 = __importDefault(require("./routes/public"));
const student_1 = __importDefault(require("./routes/student"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
const PORT = 5000;
// Body parsing
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// Static files
app.use('/static', express_1.default.static(path_1.default.join(__dirname, '..', 'static')));
// Session
app.use((0, express_session_1.default)({
    secret: process.env.SECRET_KEY || 'evolvex-dev-key-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 },
}));
// Flash messages
app.use((0, connect_flash_1.default)());
// Nunjucks templating
const env = nunjucks_1.default.configure(path_1.default.join(__dirname, '..', 'templates'), {
    autoescape: true,
    express: app,
    watch: true,
});
// Custom filters to match Jinja2 behaviour
env.addFilter('format', (fmt, val) => {
    if (fmt === '%.0f')
        return Math.round(val || 0).toString();
    return String(val);
});
env.addFilter('min', (arr) => Math.min(...arr));
env.addFilter('length', (val) => (Array.isArray(val) ? val.length : 0));
// Global context injected into every render (mirrors Flask context_processor)
app.use((req, res, next) => {
    const sess = req.session;
    // Inject template globals via res.locals
    res.locals.current_week = (0, helpers_1.currentWeek)();
    res.locals.stages = helpers_1.STAGES;
    res.locals.categories = helpers_1.CATEGORIES;
    res.locals.event_types = helpers_1.EVENT_TYPES;
    res.locals.today = new Date().toISOString().slice(0, 10);
    res.locals.currentUser = sess.user_id ? { id: sess.user_id, role: sess.role, name: sess.name } : null;
    res.locals.session = { user_id: sess.user_id, role: sess.role, name: sess.name };
    // Flash messages in Flask style: [{cat, msg}]
    const rawFlash = req.flash();
    const messages = [];
    for (const [cat, msgs] of Object.entries(rawFlash)) {
        for (const msg of msgs)
            messages.push({ cat, msg });
    }
    res.locals.messages = messages;
    next();
});
// Routes
app.use('/', public_1.default);
app.use('/', student_1.default);
app.use('/', admin_1.default);
// Init DB and start server
(0, db_1.initDb)().then(() => {
    app.listen(PORT, () => {
        console.log(` * Serving EvolveX (Node.js/TypeScript) on http://127.0.0.1:${PORT}`);
        console.log(' * Debug mode: on');
    });
}).catch(console.error);
exports.default = app;
