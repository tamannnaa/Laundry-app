const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');

const app = express();
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

mongoose.connect("your-connection-url");

const userSchema = new mongoose.Schema({
  room_no: { type: Number, required: true },
  hostel: { type: String, required: true },
  password: { type: String, required: true }
}, { collection: 'students' });

const laundryschema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true }
}, { collection: "laundryperson" })

const laundryFormSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hostel: { type: String, required: true },
  clothesData: { type: Object, required: true },
  submittedOn: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'picked', 'washed'], default: 'pending' }
}, { collection: 'laundryForms' });

const LaundryForm = mongoose.model('LaundryForm', laundryFormSchema);
const LaundryPerson = mongoose.model('laundryperson', laundryschema);
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => res.render('home'));
app.get('/laundrylogin', (req, res) => res.render('loginadmin'));
app.get("/delete", (req, res) => res.render("delete"));
app.post("/delete", async (req, res) => {
  if (!req.session.user) return res.redirect('/studentlogin');
  const userId = req.session.user._id;
  await User.findByIdAndDelete(userId);
  await LaundryForm.deleteMany({ user_id: userId });
  req.session.destroy();
  res.render('login', { message: 'Account Deleted Successfully!' });
});

app.post('/update-form-status', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) return res.status(403).send('Forbidden');
  const { formId, status } = req.body;
  const updatedForm = await LaundryForm.findByIdAndUpdate(
    new mongoose.Types.ObjectId(formId),
    { status },
    { new: true }
  );
  if (!updatedForm) return res.status(404).json({ error: 'Form not found' });
  res.json({ message: 'Form status updated successfully' });
});

app.post('/laundrylogin', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Laundry login attempt: ${username} ${password}`);
  try {
    const user = await LaundryPerson.findOne({ username, password });
    if (user && user.isAdmin) {
      req.session.user = user;
      console.log(`Laundry login successful: ${username}`);
      res.redirect('/admin');
    } else {
      console.log(`Laundry login failed: ${username}`);
      res.render('loginadmin', { error: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error(`Laundry login error: ${err}`);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/studentlogin', (req, res) => res.render('login', { message: '' }));
app.get('/create-form', (req, res) => res.render('form'));
app.get('/signup', (req, res) => res.render('signup'));

app.get("/dashboard", async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const user = await User.findById(req.session.user._id);
  const forms = await LaundryForm.find({ user_id: req.session.user._id });
  const parsedForms = forms.map(form => {
    if (typeof form.clothesData === 'string') form.clothesData = JSON.parse(form.clothesData);
    return form;
  });
  res.render("dashboard", { user, forms: parsedForms });
});

app.get("/admin", async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) return res.redirect('/laundrylogin');
  const { date, hostel } = req.query;
  let filters = {};
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    filters.submittedOn = { $gte: startDate, $lt: endDate };
  }
  if (hostel) filters.hostel = hostel;
  
  let forms = await LaundryForm.find(filters).populate('user_id');

  // Sort forms based on room_no if the hostel is selected
  if (hostel) {
    forms = forms.sort((a, b) => a.user_id.room_no - b.user_id.room_no);
  } else {
    forms = forms.sort((a, b) => a._id - b._id); // Default sorting by form ID
  }
  
  res.render("admin", { forms, message: '' });
});




app.post('/signup', async (req, res) => {
  const { room_no, hostel, password } = req.body;
  const existingStudent = await User.findOne({ room_no, hostel });
  if (existingStudent) return res.send('Room number and hostel already exist.');
  const newStudent = new User({ room_no, hostel, password, isAdmin: hostel === 'admin' });
  await newStudent.save();
  res.redirect('/studentlogin');
});

app.post('/studentlogin', async (req, res) => {
  const { room_no, hostel, password } = req.body;
  const user = await User.findOne({ room_no, hostel, password });
  if (user) {
    req.session.user = user;
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid credentials.', message: '' }); // Pass message variable
  }
});

app.post('/create-form', async (req, res) => {
  if (!req.session.user) return res.redirect('/studentlogin');
  const clothesData = req.body.clothesData;
  const clothesObject = JSON.parse(clothesData);
  const filteredClothesObject = Object.entries(clothesObject)
    .filter(([item, quantity]) => quantity !== 0)
    .reduce((obj, [item, quantity]) => {
      obj[item] = quantity;
      return obj;
    }, {});
  const hostelName = req.session.user.hostel;
  const newForm = new LaundryForm({
    user_id: req.session.user._id,
    hostel: hostelName,
    clothesData: filteredClothesObject,
    submittedOn: new Date()
  });
  await newForm.save();
  res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/studentlogin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT,'0.0.0.0', () => console.log("Server running on port ${3000}"));
