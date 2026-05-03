"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const db_2 = require("../db");
const helpers_1 = require("../helpers");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
const SESSIONS_DATA = [
    { title: 'The Beginning', date: '21 March', speaker: 'Karthik Nagapuri', linkedin: 'https://www.linkedin.com/in/karthiknagpuri/', image: 'session1.jpg', tag: 'Introductions & Goals', description: 'Our journey started with introductions, goals, startup ideas, and the first spark of turning thoughts into real systems.' },
    { title: 'AI Foundations', date: '31 March', speaker: 'Meet Desai', linkedin: 'https://www.linkedin.com/in/meetdesai13?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session2.jpg', tag: 'AI & Emerging Tech', description: 'An interactive session where we explored the fundamentals of AI development and future technologies shaping the industry.' },
    { title: 'Design Thinking', date: '7 April', speaker: 'Sai Santhosh Madhari', linkedin: 'https://www.linkedin.com/in/saisantoshmadhari0711?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session3.jpg', tag: 'Design & Creativity', description: 'A session that helped us understand design, its types, and how good design makes ideas more meaningful.' },
    { title: 'Agentic AI & Tools', date: '8 April', speaker: 'Konrad Gnat', linkedin: 'https://www.linkedin.com/in/konrad-gnat?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session4.jpg', tag: 'Agentic AI', description: 'We explored Agentic AI, AI tools, and modern tech for web development.' },
    { title: 'Entrepreneurship Reality Check', date: '12 April', speaker: 'Deepak Rai', linkedin: 'https://www.linkedin.com/in/deepakrai9?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session5.jpg', tag: 'Startup Challenges', description: 'A practical session on entrepreneurship, challenges founders face, and how to overcome them.' },
    { title: 'Content Creation Mindset', date: '12 April', speaker: 'Shivam Rai Sir', linkedin: 'https://www.linkedin.com/in/1809shivamrai?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session6.jpg', tag: 'Brand & Content', description: 'A lively session on getting started with content creation, thinking uniquely, and building a strong personal brand.' },
    { title: 'Frontend, Backend & AI Tools', date: '24 April', speaker: 'Anand Reddy K S', linkedin: 'https://www.linkedin.com/in/anandreddyks?utm_source=share_via&utm_content=profile&utm_medium=member_android', image: 'session7.jpg', tag: 'Tech Implementation', description: 'We understood frontend, backend, SQL, NoSQL, AI tools, and how to build impactful projects by solving real user problems.' },
];
// GET /
router.get('/', async (req, res) => {
    const students = await (0, helpers_1.leaderboard)();
    const stats = await (0, db_1.query)("SELECT COUNT(*) c, COALESCE(SUM(points),0) p, COALESCE(SUM(revenue),0) r FROM users WHERE role='student'", [], true);
    const featured = await (0, db_1.query)('SELECT * FROM users WHERE featured=1 AND role=\'student\' LIMIT 1', [], true) || (students[0] || null);
    const win = await (0, db_1.query)('SELECT wins.*, users.name FROM wins LEFT JOIN users ON users.id=wins.user_id WHERE wins.featured=1 ORDER BY wins.id DESC LIMIT 1', [], true);
    res.render('home.html', { students, top5: students.slice(0, 5), stats, featured, win });
});
// GET /sessions
router.get('/sessions', (req, res) => {
    res.render('sessions.html', { sessions: SESSIONS_DATA });
});
// GET /leaderboard
router.get('/leaderboard', async (req, res) => {
    const students = await (0, helpers_1.leaderboard)();
    res.render('leaderboard.html', { students, top3: students.slice(0, 3) });
});
// GET /student/:id
router.get('/student/:user_id', async (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    const student = await (0, db_1.query)("SELECT * FROM users WHERE id=? AND role='student' AND is_public=1", [userId], true);
    if (!student) {
        req.flash('warning', 'Student profile is private or not found.');
        return res.redirect('/leaderboard');
    }
    const journey = await (0, db_1.query)('SELECT * FROM journey WHERE user_id=? ORDER BY created_at DESC', [userId]);
    const badges = await (0, db_1.query)('SELECT * FROM badges WHERE user_id=?', [userId]);
    res.render('profile.html', { student, journey, badges });
});
// GET /login  POST /login
router.get('/login', (req, res) => res.render('login.html'));
router.post('/login', async (req, res) => {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    const user = await (0, db_1.query)('SELECT * FROM users WHERE email=?', [email], true);
    if (user && (0, db_2.checkPassword)(password, user.password_hash)) {
        req.session.regenerate(async (err) => {
            req.session.user_id = user.id;
            req.session.role = user.role;
            req.session.name = user.name;
            await (0, helpers_1.recordDailyLogin)(user.id);
            req.flash('success', 'Logged in successfully.');
            res.redirect('/dashboard');
        });
    }
    else {
        req.flash('danger', 'Invalid email or password.');
        res.redirect('/login');
    }
});
// GET /logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});
// GET /dashboard
router.get('/dashboard', (0, middleware_1.loginRequired)(), (req, res) => {
    if (req.session.role === 'admin')
        return res.redirect('/admin');
    res.redirect('/student-dashboard');
});
exports.default = router;
