const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const Book = require('./models/Book');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3000;

// --- MongoDB connect ---
mongoose.connect('mongodb://127.0.0.1:27017/libraryDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Middleware & view engine ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session (simple memory store; for production use connect-mongo or redis)
app.use(session({
  secret: 'library_secret_key_change_this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 3 } // 3 hours
}));

// expose session user to views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// --- Auth middleware ---
function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// --- Routes ---

// Home - show books
app.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.render('home', { data: books });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Register - form
app.get('/register', (req, res) => {
  res.render('register');
});

// Register - submit
app.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) return res.send('Username & password required');

    // check existing
    const exists = await User.findOne({ username });
    if (exists) return res.send('Username already taken');

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role: role || 'student' });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Login - form
app.get('/login', (req, res) => {
  res.render('login');
});

// Login - submit
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.send('Invalid credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.send('Invalid credentials');

    // set session (do not send password)
    req.session.user = { _id: user._id, username: user.username, role: user.role };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/login');
  });
});

// Add book (only logged in)
app.post('/books', ensureAuthenticated, async (req, res) => {
  try {
    const { bookName, bookAuthor, bookPages, bookPrice } = req.body;
    if (!bookName || !bookAuthor) return res.send('Name & author required');

    const book = new Book({
      bookName,
      bookAuthor,
      bookPages: Number(bookPages) || 0,
      bookPrice: Number(bookPrice) || 0
    });
    await book.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Issue book
app.post('/issue', ensureAuthenticated, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.send('Book not found');

    if (book.bookState === 'Issued') {
      return res.send('Book already issued');
    }

    book.bookState = 'Issued';
    await book.save();

    const txn = new Transaction({
      userId: req.session.user._id,
      bookId: book._id,
      type: 'Issued'
    });
    await txn.save();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Return book
app.post('/return', ensureAuthenticated, async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.send('Book not found');

    if (book.bookState === 'Available') {
      return res.send('Book already available');
    }

    book.bookState = 'Available';
    await book.save();

    const txn = new Transaction({
      userId: req.session.user._id,
      bookId: book._id,
      type: 'Returned'
    });
    await txn.save();

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Delete book (only teacher/admin)
app.post('/delete', ensureAuthenticated, async (req, res) => {
  try {
    // allow only teacher or admin to delete
    const role = req.session.user.role;
    if (role !== 'teacher' && role !== 'admin') return res.send('Not authorized to delete');

    const { bookId } = req.body;
    await Book.findByIdAndDelete(bookId);
    // optionally remove transactions for that book
    await Transaction.deleteMany({ bookId });
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Transactions (user specific)
app.get('/transactions', ensureAuthenticated, async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.session.user._id })
      .populate('bookId', 'bookName bookAuthor')
      .sort({ date: -1 });

    // Pass adminView as false for normal users
    res.render('transactions', { transactions: txns, adminView: false });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


// Admin view - all transactions (only admin)
app.get('/admin/transactions', ensureAuthenticated, async (req, res) => {
  try {
    if (req.session.user.role !== 'admin') return res.send('Not authorized');

    const txns = await Transaction.find()
      .populate('bookId', 'bookName')
      .populate('userId', 'username')
      .sort({ date: -1 });

    // Pass adminView as true for admin
    res.render('transactions', { transactions: txns, adminView: true });
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
