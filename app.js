const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');

const Post = require('./models/Post');

const app = express();

mongoose.connect('mongodb+srv://thisisbyale_db:ale115@cluster0.ajryb9e.mongodb.net/cyclecareblog?appName=Cluster0');

// ─── Multer — Image Upload ────────────────────────────────────────────────────
const upload = multer({ storage: multer.memoryStorage() });

// ─── App Settings ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'cyclecareblogsecret',
  resave: false,
  saveUninitialized: false
}));

// ─── Admin Credentials ──────────────────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// ─── Posts available to nav in every view ───────────────────────────────────
app.use((req, res, next) => {
  res.locals.loggedIn = req.session.loggedIn || false;
  Post.find({}).sort({ createdAt: -1 }).then((posts) => {
    res.locals.navPosts = posts;
    next();
  }).catch((err) => {
    res.locals.navPosts = [];
    next();
  });
});

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  Post.find({}).sort({ createdAt: -1 }).then((posts) => {
    res.render('home', { posts: posts });
  }).catch((err) => {
    console.log('Error loading posts', err);
    res.render('home', { posts: [] });
  });
});

// Single post page — load by slug
app.get('/post/:slug', (req, res) => {
  Post.findOne({ slug: req.params.slug }).then((post) => {
    if (!post) return res.redirect('/');
    res.render('post', { post: post });
  }).catch((err) => {
    console.log('Error loading post', err);
    res.redirect('/');
  });
});

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

app.get('/admin/login', (req, res) => {
  res.render('admin/login', { error: undefined });
});

app.post('/admin/login', (req, res) => {
  const { uname, pass } = req.body;
  if (uname === ADMIN_USER && pass === ADMIN_PASS) {
    req.session.loggedIn = true;
    res.redirect('/admin/dashboard');
  } else {
    res.render('admin/login', { error: 'Username or password incorrect.' });
  }
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

app.get('/admin/dashboard', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');
  Post.find({}).sort({ createdAt: -1 }).then((posts) => {
    res.render('admin/dashboard', { posts: posts });
  }).catch((err) => {
    console.log('Dashboard error', err);
    res.render('admin/dashboard', { posts: [] });
  });
});

// ─── ADMIN CREATE POST ────────────────────────────────────────────────────────

app.get('/admin/new', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');
  res.render('admin/new-post', { error: undefined });
});

app.post('/admin/new', upload.single('image'), (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');

  var title   = req.body.title;
  var slug    = req.body.slug;
  var content = req.body.content;
  var image   = req.file
    ? 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64')
    : '';

  if (!title || !slug) {
    return res.render('admin/new-post', { error: 'Title and slug are required.' });
  }

  var newPost = new Post({
    title:   title,
    slug:    slug,
    image:   image,
    content: content
  });

  newPost.save().then(() => {
    res.redirect('/admin/dashboard');
  }).catch((err) => {
    console.log('Save error', err);
    res.render('admin/new-post', { error: 'Slug already in use or save failed.' });
  });
});

// ─── ADMIN EDIT POST ──────────────────────────────────────────────────────────

app.get('/admin/edit/:id', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');
  Post.findById(req.params.id).then((post) => {
    if (!post) return res.redirect('/admin/dashboard');
    res.render('admin/edit-post', { post: post, error: undefined });
  }).catch((err) => {
    console.log('Edit load error', err);
    res.redirect('/admin/dashboard');
  });
});

app.post('/admin/edit/:id', upload.single('image'), (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');

  var title   = req.body.title;
  var slug    = req.body.slug;
  var content = req.body.content;

  if (!title || !slug) {
    return Post.findById(req.params.id).then((post) => {
      res.render('admin/edit-post', { post: post, error: 'Title and slug are required.' });
    });
  }

  Post.findById(req.params.id).then((post) => {
    post.title   = title;
    post.slug    = slug;
    post.content = content;
    if (req.file) {
      post.image = 'data:' + req.file.mimetype + ';base64,' + req.file.buffer.toString('base64');
    }
    return post.save();
  }).then(() => {
    res.redirect('/admin/dashboard');
  }).catch((err) => {
    console.log('Update error', err);
    res.redirect('/admin/dashboard');
  });
});

// ─── ADMIN DELETE POST ────────────────────────────────────────────────────────

app.get('/admin/delete/:id', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/admin/login');
  Post.findByIdAndDelete(req.params.id).then(() => {
    res.redirect('/admin/dashboard');
  }).catch((err) => {
    console.log('Delete error', err);
    res.redirect('/admin/dashboard');
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(3000, () => {
  console.log('Cycle Care Blog running on http://localhost:3000');
});