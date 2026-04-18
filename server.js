require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const path = require('path');
const methodOverride = require('method-override');
// Rate limit login/signup to prevent spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 attempts per IP
  message: 'Too many attempts, try again later'
});
const bcrypt = require('bcryptjs'); // <-- move to top, only once

//debug
console.log('MongoStore =', MongoStore);
console.log('typeof MongoStore.create =', typeof MongoStore.create);

const app = express();

// 1. Middleware - only once each
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Session - only once, with MongoStore
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// 3. Import models
const User = require('./models/User');
const taskController = require('./controllers/TaskController');

// 4. Auth middleware
function isLoggedIn(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// 5. Routes
app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/login', authLimiter,
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).render('login', { error: 'Invalid email or password' });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).render('login', { error: 'Invalid credentials' });
    }
    req.session.userId = user._id;
    res.redirect('/dashboard');
  });

app.post('/signup', authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('signup', { error: 'Name required, valid email, 6+ char password' });
    }

    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).render('signup', { error: 'Email already in use' });
      }
      const user = new User({ name, email, password });
      await user.save();
      res.redirect('/login');
    } catch (err) {
      console.error('Signup error:', err);
      res.status(400).render('signup', { error: 'Error creating user' });
    }
  }); app.post('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) console.log(err);
      res.redirect('/login');
    });
  });
// <-- route ends here, nothing after this

app.get('/dashboard', isLoggedIn, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('dashboard', { user }); // pass user to EJS
});

app.get('/test', (req, res) => res.send('Test route works!'));

// Task routes - add isLoggedIn middleware
app.get('/tasks', isLoggedIn, taskController.getTasks);
app.post('/tasks', isLoggedIn, taskController.createTask);
app.delete('/tasks/:id', isLoggedIn, taskController.deleteTask);
app.put('/tasks/:id', isLoggedIn, taskController.updateTask);
app.post('/tasks/:id/toggle', isLoggedIn, taskController.toggleTask); // toggle complete
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });  //
});

// Error handler 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 6. Connect DB + Start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  .catch (err => console.log('MongoDB error:', err));