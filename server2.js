
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const ejs = require('ejs');



const app = express();

app.use(bodyParser.json());


app.set('view engine', 'ejs');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'your_secret_key', 
  resave: false,
  saveUninitialized: true
}));

// MongoDB connection
mongoose.connect('mongodb+srv://vanshn122:vansh%401902@test.bya8lpf.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const userSchema = new mongoose.Schema({
  room_no: {
    type: Number,
    required: true
  },
  hostel: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, { collection: 'students' });

const laundryschema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin: {  // Add this field
        type: Boolean,
        default:true
      }
},{collection:"laundryperson"})

// Create MongoDB schema and model for Laundry Form Data
const laundryFormSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    hostel: {
      type: String,
      required: true
    },
    clothesData: {
      type: Object,
      required: true
    },
    submittedOn: {
      type: Date,
      default: Date.now
    }, status: {
      type: String,
      enum: ['pending', 'picked', 'washed'],
      default: 'pending'
    }
  }, { collection: 'laundryForms' });
const LaundryForm = mongoose.model('LaundryForm', laundryFormSchema);

const LaundryPerson = mongoose.model('laundryperson', laundryschema);
const User = mongoose.model('User', userSchema);
// Routes
app.get('/', (req, res) => {
    res.render('home'); 
  });
  app.get('/laundrylogin', (req, res) => {
    res.render('loginadmin'); 
  });
  app.get("/delete",(req,res)=>{
    res.render("delete");
  })
  app.post("/delete", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/studentlogin');
    }

    const userId = req.session.user._id;

    try {
        // Delete the user from the database
        await User.findByIdAndDelete(userId);
        
        // Optionally, delete related data (like laundry forms associated with that user)
        await LaundryForm.deleteMany({ user_id: userId });
        
        // Destroy the session
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                const message = 'Account Deleted Successfully!';
                res.render('login', { message }); // Render the delete page with the message
            }
        });
    } catch (err) {
        console.error('Error deleting account:', err);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/update-form-status', async (req, res) => {
  if (!req.session.user || !req.session.user.isAdmin) {
    return res.status(403).send('Forbidden');
  }

  const { formId, status } = req.body;

  try {
    const updatedForm = await LaundryForm.findByIdAndUpdate(
      new mongoose.Types.ObjectId(formId), // Use 'new' here
      { status },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ message: 'Form status updated successfully' });
  } catch (err) {
    console.error('Error updating form status:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
  app.post('/laundrylogin', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await LaundryPerson.findOne({ username, password });
    
      if (user) {
        console.log('User found:', user); // Check if user object is retrieved
        // Check if the user is an admin
        if (user.isAdmin) {
          req.session.user = user;
          console.log('User logged in:', req.session.user); // Check if user is logged in
          res.redirect('/admin');
        } else {
          res.render('loginadmin', { error: 'You do not have admin privileges.' });
        }
      } else {
        console.log('User not found.');
        res.render('loginadmin', { error: 'Invalid credentials. Please try again.' });
      }
    } catch (err) {
      console.error('Error logging in:', err);
      res.send('Error logging in.');
    }
  });
  
  
  app.get('/studentlogin', (req, res) => {
    const message = '';
    res.render('login', { message });
  });
  

app.get('/create-form', (req, res) => {
  res.render('form'); 
});

app.get('/signup', (req, res) => {
  res.render('signup'); 
});

app.get("/dashboard", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.user._id);
    const forms = await LaundryForm.find({ user_id: req.session.user._id });

    const parsedForms = forms.map(form => {
      if (typeof form.clothesData === 'string') {
        form.clothesData = JSON.parse(form.clothesData);
      }
      return form;
    });

    res.render("dashboard", { user, forms: parsedForms });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/admin", async (req, res) => {
    try {
      if (!req.session.user || !req.session.user.isAdmin) {
        return res.redirect('/laundrylogin');
      }
  
      // Get the query parameters for date and hostel
      const { date, hostel } = req.query;
      let filters = {};
  
      // Apply date filter if date is provided
      if (date) {
        const startDate = new Date(date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        filters.submittedOn = { $gte: startDate, $lt: endDate };
      }
  
      // Apply hostel filter if hostel is provided
      if (hostel) {
        filters.hostel = hostel; // Use the 'hostel' field directly
      }
  
      const forms = await LaundryForm.find(filters).populate('user_id');
      console.log('Retrieved forms:', forms);
      res.render("admin", { forms });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  

app.post('/signup', async (req, res) => {
    const { room_no, hostel, password } = req.body;
  
    try {
     
      const existingStudent = await User.findOne({ room_no, hostel });
  
      if (existingStudent) {
        res.send('Room number and hostel already exist. Please choose a different room number or hostel.');
      } else {
       
        const newStudent = new User({
          room_no,
          hostel,
          password,
          isAdmin: hostel === 'admin' 
        });
  
       
        await newStudent.save();
        res.redirect('/studentlogin'); 
      }
    } catch (err) {
      console.log(err);
      res.send('Error signing up.');
    }
  });

  app.post('/studentlogin', async (req, res) => {
    const { room_no, hostel, password } = req.body;
  
    try {
      const user = await User.findOne({ room_no, hostel, password });
  
      if (user) {
        req.session.user = user;
        res.redirect('/dashboard');
      } else {
        res.render('login', { error: 'Invalid credentials. Please try again.' });
      }
    } catch (err) {
      console.log(err);
      res.send('Error logging in.');
    }
  });
  

  app.post('/create-form', async (req, res) => {
    if (!req.session.user) {
      return res.redirect('/studentlogin');
    }
  
    const clothesData = req.body.clothesData;
  
    try {
      const clothesObject = JSON.parse(clothesData);
      const filteredClothesObject = Object.entries(clothesObject)
        .filter(([item, quantity]) => quantity !== 0)
        .reduce((obj, [item, quantity]) => {
          obj[item] = quantity;
          return obj;
        }, {});
  
      const hostelName = req.session.user.hostel; // Get the hostel name from the session
  
      const newForm = new LaundryForm({
        user_id: req.session.user._id,
        hostel: hostelName, // Include the hostel name
        clothesData: filteredClothesObject,
        submittedOn: new Date()
      });
  
      await newForm.save();
      res.redirect('/dashboard');
    } catch (err) {
      console.log(err);
      res.send('Error creating form.');
    }
  });


app.get('/logout', (req, res) => {
 
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.redirect('/studentlogin'); 
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});