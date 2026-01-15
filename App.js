const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const website = express();
const multer = require('multer')
const path = require('path');
const fs = require('fs');     // VIdeo
const userModel = require('./models/user.model')
const Admin = require('./models/admin');
const OTP = require('./models/otp');
const { sendOTPEmail } = require('./utils/emailService');
const { isSuperAdmin } = require('./utils/authMiddleware');
const { render } = require('ejs');
require('./models/config/db');

const Razorpay = require('razorpay');

require('dotenv').config();

// Set up the view engine
website.set('view engine', 'ejs');


// Set the views folder path
website.set('views', path.join(__dirname, 'views'));

// Static files middleware
website.use(express.static('public'));

// Body parser middleware
website.use(express.json()); // Parse JSON bodies
website.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
website.use(cookieParser());



// mongoose.connect("mongodb://localhost:27017/Education");

const MongoStore = require('connect-mongo');

 // Session configuration
website.use(session({
    secret: process.env.SESSION_SECRET || 'session-secret-key',
    resave: false,  // Important: should be false
    saveUninitialized: false,  // Important: should be false
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://Raj:Rajaryan@cluster0.crfzpz6.mongodb.net/education?retryWrites=true&w=majority&appName=Cluster0",
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60, // 14 days
        autoRemove: 'interval',
        autoRemoveInterval: 60, // Remove expired sessions every 60 minutes
        touchAfter: 24 * 3600 // Time period in seconds
        
    }),
    cookie: {
        secure: false, // Set to false in development, true in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        // sameSite: 'lax' // Use 'none' in production with secure: true
    }
}));


const isAdminAuthenticated = async (req, res, next) => {

    if (req.session.isAdminAuthenticated) return next();
    res.redirect('/adminLogin');
};


website.get('/check', async (req, res) => {
    console.log(req.session);

});


// adminlogin and session

website.get('/adminLogin', async (req, res) => {


    res.render('auth/login');
})



website.post('/createAdmin', async (req, res) => {
    try {
        const newAdmin = new Admin({
            name: 'John Smith',
            email: 'rajpatil484950@gmail.com',
            password: 'TestPass123!', // Will be hashed by pre-save hook
            isSuperAdmin: false
        });

        await newAdmin.save();

        console.log('Admin created successfully');
        return res.status(201).send('Admin created');
    } catch (err) {
        console.error('Error creating admin:', err);
        return res.status(500).send('Error creating admin');
    }
});


website.get("/my-ip", async (req, res) => {
  try {
    const response = await fetch("https://ifconfig.me/ip");
    const ip = await response.text();
    res.send(`Your Render egress IP: ${ip}`);
  } catch (err) {
    res.status(500).send(`Error fetching IP: ${err}`);
  }
});

website.post('/admin/send-otp', async (req, res) => {


    const email = req.body.email.trim().toLowerCase();
    console.log("Looking for admin with email:", email);




    try {
        const admin = await Admin.findOne({ email });


        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'No admin found with this email'
            });
        }

        const otp = admin.generateOTP();
        await admin.save();

        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to send OTP email'
            });
        }

        res.render('auth/otp', {
            title: 'Enter OTP',
            email: email,
            hideHeader: true,
            hideFooter: true
        });

    } catch (error) {
        console.error('Error in send-otp:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


// Resend OTP
// Resend OTP - Updated Version
website.post('/admin/resend-otp', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'No admin found with this email'
            });
        }

        // Generate new OTP (this will automatically clear any existing OTP)
        const otp = admin.generateOTP();
        await admin.save();

        // Send new OTP via email
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP email'
            });
        }

        // Return the same response format as send-otp
        res.render('auth/otp', {
            title: 'Enter OTP',
            email: email,
            hideHeader: true,
            hideFooter: true,
            message: 'New OTP has been sent to your email'
        });

    } catch (error) {
        console.error('Error in resend-otp:', error);
        res.status(500).render('auth/otp', {
            title: 'Error',
            email: email,
            hideHeader: true,
            hideFooter: true,
            error: 'Internal server error'
        });
    }
});

website.post('/admin/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const admin = await Admin.findOne({ email });
        if (!admin) {
            req.flash('error', 'No admin found with this email');
            return res.redirect('/adminLogin');
        }

        const isValidOTP = admin.verifyOTP(otp);
        if (!isValidOTP) {
            await admin.save();
            req.flash('error', 'Invalid or expired OTP');
            return res.redirect('/adminLogin');
        }

        admin.lastLogin = new Date();
        await admin.save();

        // Set session values
        req.session.isAdminAuthenticated = true;
        req.session.adminId = admin._id;
        req.session.adminEmail = admin.email;
        req.session.adminName = admin.name;
        req.session.isSuperAdmin = admin.isSuperAdmin;

        // Save session
        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) {
                    console.error('❌ Session save error:', err);
                    return reject(err);
                }
                console.log('✅ Session saved successfully. Session ID:', req.sessionID);
                resolve();
            });
        });

        // ✅ Instead of checking DB, log from session directly
        console.log('✅ Session contents:', req.session);

        return res.redirect('/igcse-ib-enquiries');
    } catch (error) {
        console.error('❌ Error in verify-otp:', error);
        return res.redirect('/adminLogin');
    }
});




website.use((req, res, next) => {
    console.log('Current session ID:', req.sessionID);
    console.log('Session data:', req.session); // Already populated

    // No need to access MongoDB directly
    next();
});


// Admin logout
website.get('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            req.flash('error', 'Failed to logout');
            return res.redirect('/admin/dashboard');
        }
        res.redirect('/adminLogin');
    });
});




// Handle the route for "/home"
website.get('/', (req, res) => {
    res.render('Home');  // Render the "Home" view
});

// Handle the route for "/home"
website.get('/courses', (req, res) => {
    res.render('Courses');  // Render the "Home" view
});


const authLogin = (req, res, next) => {

    const token = req.cookies.token;
    if (!token) {
        res.redirect('/auth/login');
    }
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();

}

website.get('/igcse&ibt', (req, res) => {
    res.render('IGCSE&IBTutoring');   // This will render views/admission.ejs
});

website.get('/upcomingbooking', (req, res) => {
    res.render('UpcomingBatches');
})

// Handle the route for "Admin desboard",
website.get('/myadmin', (req, res) => {
    res.render('panel/aaru');  // Render the "Home" view
});

// Handle the route for "Contact&About Us",

website.get('/contact&about', (req, res) => {
    res.render('Contact&About');
})

//  5.  IGCSE&IBTutoring.............

// Define the IGCSE&IBTutoring schema
// models/IGCSEIBTutoring.js

// Define the schema for IGCSE & IB Tutoring Enquiry
const igcseIBTutoringSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    program: { type: String, required: true },
    mode: { type: String, required: true }, // Mode of study (online, offline, etc.)
    city: { type: String, required: true },
    authorize: { type: Boolean, required: true }, // Whether the enquiry is authorized or not
    createdAt: { type: Date, default: Date.now } // Add createdAt field
});

// Create the model
const IGCSEIBTutoring = mongoose.model('IGCSEIBTutoring', igcseIBTutoringSchema);

// Export the model
module.exports = IGCSEIBTutoring;


// Route to display the form for IGCSE & IB Tutoring
website.get('/igcse-ib-tutoring', (req, res) => {
    res.render('IGCSE&IBTutoring'); // Render the form page
});


// Handle the form submission for IGCSE & IB Tutoring
website.post('/submit-igcse-ib-tutoring', async (req, res) => {
    try {
        // Log the form data
        console.log('Form data received:', req.body);

        // Extract form data from the request body
        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await IGCSEIBTutoring.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new enquiry object
        const newIGCSEIBTutoringEnquiry = new IGCSEIBTutoring({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on' // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newIGCSEIBTutoringEnquiry.save();
        console.log('IGCSE & IB Tutoring enquiry saved successfully:', newIGCSEIBTutoringEnquiry);

        // Send a success message to the client with an alert and redirect
        res.send(`
            <script>
                alert('IGCSE & IB Tutoring enquiry submitted successfully!');
                window.location.href = '/igcse-ib-tutoring'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving IGCSE & IB Tutoring enquiry:', error.message);
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});


// Route to fetch all IGCSE & IB Tutoring enquiries and render them in the view.
// Route to fetch all IGCSE & IB Tutoring enquiries (protected)
website.get('/igcse-ib-enquiries', isAdminAuthenticated, async (req, res) => {
    try {

        // Fetch all IGCSE & IB Tutoring enquiries from the database
        const igcseIBEnquiries = await IGCSEIBTutoring.find();

        // Render the admin panel template and pass the enquiries data
        res.render('panel/IGCSE&IBTutoring_Ad', { igcseIBEnquiries: igcseIBEnquiries });
    } catch (error) {
        console.error('Error fetching IGCSE & IB Tutoring enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});


// Route to delete an IGCSE & IB Tutoring enquiry by ID
website.post('/delete-igcse-ib-enquiry/:id', isAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await IGCSEIBTutoring.findByIdAndDelete(enquiryId);

        // Redirect back to the IGCSE & IB Tutoring enquiries page
        res.redirect('/igcse-ib-enquiries');
    } catch (error) {
        console.error('Error deleting IGCSE & IB Tutoring enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

//  Booking System............
// Define the Booking schema
// Define the schema for Booking
const bookingSchema = new mongoose.Schema({
    batchType: { type: String, required: true },
    course: { type: String, required: true },
    sessionDate: { type: Date, required: true },
    sessionDays: { type: String, required: true },
    sessionTime: { type: String, required: true },
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    center: { type: String, required: true },
    authorize: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now } // Add createdAt field
});

// Create the model
const Booking = mongoose.model('Booking', bookingSchema);

// Export the model
module.exports = Booking;

// Route to display the booking form
website.get('/booking', (req, res) => {
    res.render('UpcomingBatches'); // Render the form page
});
// Handle the form submission for Booking
website.post('/submit-booking', async (req, res) => {
    try {
        // Log the form data
        console.log('Form data received:', req.body);

        // Extract form data from the request body
        const { batchType, course, sessionDate, sessionDays, sessionTime, phone, firstName, lastName, email, address, state, city, center, authorize } = req.body;

        // Check if the email or phone already exists in the database
        const existingBooking = await Booking.findOne({ $or: [{ email }, { phone }] });
        if (existingBooking) {
            return res.status(400).send('A booking with this email or phone already exists.');
        }

        // Create a new booking object
        const newBooking = new Booking({
            batchType,
            course,
            sessionDate,
            sessionDays,
            sessionTime,
            phone,
            firstName,
            lastName,
            email,
            address,
            state,
            city,
            center,
            authorize: authorize === 'on' // Convert checkbox value to boolean
        });

        // Save the new booking to the database
        await newBooking.save();
        console.log('Booking saved successfully:', newBooking);

        // Send a success message to the client with an alert and redirect
        res.send(`
            <script>
                alert('Booking submitted successfully!');
                window.location.href = '/booking'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving booking:', error.message);
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});


website.get('/upcoming-bookings', isAdminAuthenticated, async (req, res) => {
    // Ensure session save is done before proceeding
    req.session.save(async (err) => {
        if (err) {
            console.error('Session save error:', err);
            return res.redirect('/adminLogin'); // Handle session save error by redirecting
        }

        console.log('Session confirmed saved:', req.session);

        try {
            // Fetch all bookings from the database
            const bookings = await Booking.find();

            // Render the admin panel template and pass the bookings data
            res.render('panel/Upcoming_Booking_Ad', {
                bookings: bookings,
                admin: {
                    name: req.session.adminName,
                    email: req.session.adminEmail,
                    isSuperAdmin: req.session.isSuperAdmin
                }
            });

        } catch (error) {
            console.error('Error fetching bookings:', error);
            // Render an error page or redirect with flash message
            res.redirect('/admin/dashboard?error=failed_to_fetch_bookings');
        }
    });
});


// Route to delete a booking entry
website.post('/delete-booking/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const bookingId = req.params.id; // Get the booking ID from the URL

        // Find the booking by ID and delete it
        await Booking.findByIdAndDelete(bookingId);

        console.log(`Booking with ID ${bookingId} deleted successfully`); // Log success
        res.redirect('/upcoming-bookings'); // Redirect back to the bookings page
    } catch (error) {
        console.error('Error deleting booking:', error); // Log the error
        res.status(500).send('An error occurred while deleting the booking.');
    }
});

//  Test Series...... Gre
website.get('/greOption', (req, res) => {
    res.render("testPre/Gre/Gre.ejs");
});

website.get('/grePractice', (req, res) => {
    res.render("testPre/Gre/GrePractice.ejs");
});

website.get('/greOnline', (req, res) => {
    res.render("testPre/Gre/GreOnline.ejs");
});

website.get('/greOverView', (req, res) => {
    res.render("testPre/Gre/GreOverview.ejs");
});

website.get('/greWord', (req, res) => {
    res.render("testPre/Gre/greWord.ejs");
});

website.get('/greSyllabus', (req, res) => {
    res.render("testPre/Gre/GreSyllabus.ejs");
});
website.get('/greEligibity', (req, res) => {
    res.render("testPre/Gre/GreEligibity.ejs");
});
website.get('/greTest', (req, res) => {
    res.render("testPre/Gre/GreTest");
});


//  GMAT....

website.get('/gmatOption', (req, res) => {
    res.render("testPre/Gmat/Gmat");
});


website.get('/gmatBook', (req, res) => {
    res.render("testPre/Gmat/gmatBooks");
});


website.get('/gmatCalculator', (req, res) => {
    res.render("testPre/Gmat/gmatCalculator");
});


website.get('/gmatEligibity', (req, res) => {
    res.render("testPre/Gmat/gmatEligibity");
});

website.get('/gmatExam', (req, res) => {
    res.render("testPre/Gmat/gmatExams");
});


website.get('/gmatOnlines', (req, res) => {
    res.render("testPre/Gmat/gmatOnline");
});

website.get('/gmatPractice', (req, res) => {
    res.render("testPre/Gmat/gmatPractice");
});

website.get('/GmatSyllabus', (req, res) => {
    res.render("testPre/Gmat/GmatSyllabus");
});


//  SAT

website.get('/satPre', (req, res) => {
    res.render("testPre/SAT/satPre");
});

website.get('/satPractice', (req, res) => {
    res.render("testPre/SAT/satPractice");
});

website.get('/satOnline', (req, res) => {
    res.render("testPre/SAT/satOnline");
});

website.get('/satRegistration', (req, res) => {
    res.render("testPre/SAT/satRegistration");
});

website.get('/satPattern', (req, res) => {
    res.render("testPre/SAT/satPattern");
});


website.get('/satSyllabus', (req, res) => {
    res.render("testPre/SAT/satSyllabus");
});

website.get('/satEligibility', (req, res) => {
    res.render("testPre/SAT/satEligibility");
});


website.get('/satDates', (req, res) => {
    res.render("testPre/SAT/satDates");
});


// Act
website.get('/actpre', (req, res) => {
    res.render("testPre/ACT/ActPre");
});


website.get('/actexam', (req, res) => {
    res.render("testPre/ACT/ACTExam");
});


website.get('/satvsact', (req, res) => {
    res.render("testPre/ACT/SatVsAct");
});

// IELTS...

website.get('/ieltspre', (req, res) => {
    res.render("testPre/IELTS/IELTSPre");
});

website.get('/ieltsOnline', (req, res) => {
    res.render("testPre/IELTS/IELTSOnline");
});

website.get('/ieltsExam', (req, res) => {
    res.render("testPre/IELTS/IELTSExam");
});


website.get('/ieltsPattern', (req, res) => {
    res.render("testPre/IELTS/IELTSPattern");
});


website.get('/ieltsBook', (req, res) => {
    res.render("testPre/IELTS/IELTSBook");
});


website.get('/ieltsPraTest', (req, res) => {
    res.render("testPre/IELTS/IELTSPracTest");
});


website.get('/ieltsSyllabus', (req, res) => {
    res.render("testPre/IELTS/IELTSSyllabus");
});


website.get('/ieltsEligibility', (req, res) => {
    res.render("testPre/IELTS/IELTSEligibility");
});

// TOEFL


website.get('/toeflPre', (req, res) => {
    res.render("testPre/TOEFL/TOEFLPre");
});

website.get('/toeflPrep', (req, res) => {
    res.render("testPre/TOEFL/TOEFLPrep");
});

website.get('/toeflSyllabus', (req, res) => {
    res.render("testPre/TOEFL/TOEFLSyllabus");
});

website.get('/toeflEligibility', (req, res) => {
    res.render("testPre/TOEFL/TOEFLEligibility");
});

website.get('/toeflPattern', (req, res) => {
    res.render("testPre/TOEFL/TOEFLPattern");
});

website.get('/toeflTestPre', (req, res) => {
    res.render("testPre/TOEFL/TOEFLTestPrep");
});


// AP

website.get('/apPre', (req, res) => {
    res.render("testPre/AP/APPre");
});

website.get('/apExam', (req, res) => {
    res.render("testPre/AP/APExam");
});

// PTE

website.get('/ptePre', (req, res) => {
    res.render("testPre/PTE/PTEPre");
});

website.get('/pteSyllabus', (req, res) => {
    res.render("testPre/PTE/PTESyllabus");
});


website.get('/pteEligibility', (req, res) => {
    res.render("testPre/PTE/PTEEligibility");
});

//  CBSE

website.get('/10th', (req, res) => {
    res.render("testPre/CBSE/10th");
});


website.get('/11th', (req, res) => {
    res.render("testPre/CBSE/11th");
});


website.get('/12th', (req, res) => {
    res.render("testPre/CBSE/12th");
});


//  Working On TestPreAdmin(All pages like.................)
// Gre Admin.....

// 1.Gre Schema and Model

// Define the GreTest schema
const greTestSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String,
    mode: String,
    city: String,
    authorize: Boolean,
});

// Create and export the GreTest model
const GreTest = mongoose.model('GreTest', greTestSchema);
module.exports = GreTest;
// Render the GRE form page

// Route to display the form for GRE Test
website.get('/greOption', (req, res) => {
    res.render('panel/testPre/Gre/Gre.ejs'); // Render the form page
});


// Route to handle the form submission for GRE Test
website.post('/submit-greTest', async (req, res) => {
    try {
        console.log('Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await GreTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new GreTest enquiry object
        const newGreTest = new GreTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newGreTest.save();

        console.log('GreTest enquiry saved successfully'); // Log success

        // Send a success message to the client
        res.send(`
            <script>
                alert('Form submitted successfully!');
                window.location.href = '/greOption'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving GreTest enquiry:', error); // Log the full error
        res.status(500).send('An error occurred while submitting the form.');
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all GreTest enquiries (protected)
website.get('/greTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const greTestEnquiries = await GreTest.find(); // Fetch all GreTest enquiries
        res.render('panel/testpreAdmin/greAdmin', { greTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching GreTest enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;


// Route to delete a GreTest enquiry by ID
website.post('/delete-greTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await GreTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/greTest-enquiries');
    } catch (error) {
        console.error('Error deleting GreTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

// 2. GMAT  Schema and Model


// Define the GMAT schema
const gmatTestSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String,
    mode: String,
    city: String,
    authorize: Boolean,
});

// Create and export the GMAT model
const GmatTest = mongoose.model('GmatTest', gmatTestSchema);
module.exports = GmatTest;

// Route to display the form for GMAT Test
website.get('/gmatOption', (req, res) => {
    res.render('panel/testPre/Gmat/Gmat.ejs'); // Render the form page
});

// Route to handle the form submission for GMAT Test
website.post('/submit-gmatTest', async (req, res) => {
    try {
        console.log('Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await GmatTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new GMAT enquiry object
        const newGmatTest = new GmatTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newGmatTest.save();

        console.log('GMAT enquiry saved successfully'); // Log success

        // Send a success message to the client
        res.send(`
            <script>
                alert('Form submitted successfully!');
                window.location.href = '/gmatOption'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving GMAT enquiry:', error); // Log the full error
        res.status(500).send('An error occurred while submitting the form.');
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}


// Route to fetch all GMAT enquiries (protected)
website.get('/gmatTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const gmatTestEnquiries = await GmatTest.find(); // Fetch all GMAT enquiries
        res.render('panel/testpreAdmin/gmatAdmin', { gmatTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching GMAT enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;


// Route to delete a GreTest enquiry by ID
website.post('/delete-gmatTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await GmatTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/gmatTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});


// 3. SAT  Schema and Model

// Define the GMAT schema
const satTestSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String,
    mode: String,
    city: String,
    authorize: Boolean,
});

// Create and export the GMAT model
const satTest = mongoose.model('satTest', satTestSchema);
module.exports = satTest;

// Route to display the form for GMAT Test
website.get('/satPractice', (req, res) => {
    res.render('panel/testPre/SAT/satPractice.ejs'); // Render the form page
});

// Route to handle the form submission for GMAT Test
website.post('/submit-satTest', async (req, res) => {
    try {
        console.log('Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await satTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new GMAT enquiry object
        const newSatTest = new satTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newSatTest.save();

        console.log('Sat enquiry saved successfully'); // Log success

        // Send a success message to the client
        res.send(`
            <script>
                alert('Form submitted successfully!');
                window.location.href = '/satPractice'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving GMAT enquiry:', error); // Log the full error
        res.status(500).send('An error occurred while submitting the form.');
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all GMAT enquiries (protected)
website.get('/satTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const satTestEnquiries = await satTest.find(); // Fetch all GMAT enquiries
        res.render('panel/testpreAdmin/SatAdmin', { satTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching GMAT enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;


// Route to delete a SATTest enquiry by ID
website.post('/delete-satTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await satTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/satTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});


// 4. ACT Schema and Model...

// Define the ACT schema
const actTestSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String,
    mode: String,
    city: String,
    authorize: Boolean,
});

// Create and export the ACT model
const ActTest = mongoose.model('ActTest', actTestSchema);
module.exports = ActTest;


// Route to display the form for ACT Test
website.get('/actexam', (req, res) => {
    res.render('panel/testPre/Act/ACTExam.ejs'); // Render the form page
});

// Route to handle the form submission for ACT Test
website.post('/submit-actTest', async (req, res) => {
    try {
        console.log('Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await ActTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new ACT enquiry object
        const newActTest = new ActTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newActTest.save();
        console.log('ACT enquiry saved successfully:', newActTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('Form submitted successfully!');
                window.location.href = '/actExam'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving ACT enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all ACT enquiries (protected)
website.get('/actTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const actTestEnquiries = await ActTest.find(); // Fetch all ACT enquiries
        res.render('panel/testpreAdmin/actAdmin', { actTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching ACT enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;


// Route to delete a SATTest enquiry by ID
website.post('/delete-actTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await ActTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/actTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

// 5. IELTS schema & modal...

// Define the IELTS schema
const ieltsTestSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String, // e.g., Academic or General Training
    mode: String, // e.g., Online or Offline
    city: String,
    authorize: Boolean, // Checkbox for authorization
});

// Create and export the IELTS model
const IeltsTest = mongoose.model('ieits_test', ieltsTestSchema);
module.exports = IeltsTest;


// Route to display the form for IELTS Test
website.get('/ieltspre', (req, res) => {
    res.render('panel/testPre/Ielts/IELTSPre.ejs'); // Render the IELTS form page
});

// Route to handle the form submission for IELTS Test
website.post('/submit-ieltsTest', async (req, res) => {
    try {
        console.log('IELTS Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await IeltsTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new IELTS enquiry object
        const newIeltsTest = new IeltsTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newIeltsTest.save();
        console.log('IELTS enquiry saved successfully:', newIeltsTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('IELTS Form submitted successfully!');
                window.location.href = '/ieltspre'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving IELTS enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}


// Route to fetch all IELTS enquiries (protected)
website.get('/ieltsTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const ieltsTestEnquiries = await IeltsTest.find(); // Fetch all IELTS enquiries
        res.render('panel/testpreAdmin/ieltsAdmin', { ieltsTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching IELTS enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;

// Route to delete a SATTest enquiry by ID
website.post('/delete-ieltsTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await IeltsTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/ieltsTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

// 6. TOEFL schema & modal...


// Define the TOEFL schema
const toeflSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String, // e.g., Academic or General Training
    mode: String, // e.g., Online or Offline
    city: String,
    authorize: Boolean, // Checkbox for authorization
});

// Create the TOEFL model
const ToeflTest = mongoose.model('toefl_test', toeflSchema);
module.exports = ToeflTest;


// Route to display the form for TOEFL Test
website.get('/toeflPre', (req, res) => {
    res.render('panel/testPre/Toefl/TOEFLPre.ejs'); // Render the TOEFL form page
});

// Route to handle the form submission for TOEFL Test
website.post('/submit-toeflTest', async (req, res) => {
    try {
        console.log('TOEFL Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await ToeflTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new TOEFL enquiry object
        const newToeflTest = new ToeflTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newToeflTest.save();
        console.log('TOEFL enquiry saved successfully:', newToeflTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('TOEFL Form submitted successfully!');
                window.location.href = '/TOEFLPre'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving TOEFL enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all TOEFL enquiries (protected)
website.get('/toeflTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const toeflTestEnquiries = await ToeflTest.find(); // Fetch all TOEFL enquiries
        res.render('panel/testpreAdmin/toeflAdmin', { toeflTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching TOEFL enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;



// Route to delete a SATTest enquiry by ID
website.post('/delete-toeflTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await ToeflTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/toeflTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});


// 7. AP Schema & Modal


// Import mongoose for MongoDB interactions

// Define the ACT schema
const apSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String, // e.g., Academic or General Training
    mode: String, // e.g., Online or Offline
    city: String,
    authorize: Boolean, // Checkbox for authorization
});

// Create the ACT model
const ApTest = mongoose.model('ap_Test', apSchema);
module.exports = ApTest;


// Route to display the form for ACT Test
website.get('/apPre', (req, res) => {
    res.render('panel/testPre/AP/APPre.ejs'); // Render the ACT form page
});

// Route to handle the form submission for ACT Test
website.post('/submit-apTest', async (req, res) => {
    try {
        console.log('Ap Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await ApTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new ACT enquiry object
        const newApTest = new ApTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newApTest.save();
        console.log('Ap enquiry saved successfully:', newApTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('Ap Form submitted successfully!');
                window.location.href = '/apPre'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving Ap enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all ACT enquiries (protected)
website.get('/apTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const apTestEnquiries = await ApTest.find(); // Fetch all ACT enquiries
        res.render('panel/testpreAdmin/apAdmin', { apTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching Ap enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;


// Route to delete a SATTest enquiry by ID
website.post('/delete-apTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await ApTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/apTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

// CBSE SCHEMA & MODAL.........

// Define the CBSE schema
const cbseSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String, // e.g., Academic or General Training
    mode: String, // e.g., Online or Offline
    city: String,
    authorize: Boolean, // Checkbox for authorization
});

// Create the CBSE model
const CbseTest = mongoose.model('cbse_Test', cbseSchema);
// Export the CBSE model
module.exports = CbseTest;


// Route to display the form for CBSE Test
website.get('/11th', (req, res) => {
    res.render('panel/testPre/Cbse/11th.ejs'); // Render the CBSE form page
});

// Route to handle the form submission for CBSE Test
website.post('/submit-cbseTest', async (req, res) => {
    try {
        console.log('CBSE Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await CbseTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new CBSE enquiry object
        const newCbseTest = new CbseTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newCbseTest.save();
        console.log('CBSE enquiry saved successfully:', newCbseTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('CBSE Form submitted successfully!');
                window.location.href = '/10th'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving CBSE enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all CBSE enquiries (protected)
website.get('/cbseTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const cbseTestEnquiries = await CbseTest.find(); // Fetch all CBSE enquiries
        res.render('panel/testpreAdmin/cbseAdmin', { cbseTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching CBSE enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});

module.exports = website;



// Route to delete a SATTest enquiry by ID
website.post('/delete-cbseTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await CbseTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/cbseTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

// 8. PTE Schema & Modal

// Import mongoose for MongoDB interaction

// Define the PTE schema
const pteSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    program: String, // e.g., Academic or General Training
    mode: String, // e.g., Online or Offline
    city: String,
    authorize: Boolean, // Checkbox for authorization
});

// Create the PTE model
const PteTest = mongoose.model('PteTest', pteSchema);

// Export the PTE model
module.exports = PteTest;


// Route to display the form for PTE Test
website.get('/pteexam', (req, res) => {
    res.render('panel/testPre/PTE/PTEPre.ejs'); // Render the PTE form page
});

// Route to handle the form submission for PTE Test
website.post('/submit-pteTest', async (req, res) => {
    try {
        console.log('PTE Form data received:', req.body); // Log the form data

        const { firstName, lastName, email, mobile, program, mode, city, authorize } = req.body;

        // Check if the email or mobile already exists in the database
        const existingEnquiry = await PteTest.findOne({ $or: [{ email }, { mobile }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or mobile already exists.');
        }

        // Create a new PTE enquiry object
        const newPteTest = new PteTest({
            firstName,
            lastName,
            email,
            mobile,
            program,
            mode,
            city,
            authorize: authorize === 'on', // Convert checkbox value to boolean
        });

        // Save the new enquiry to the database
        await newPteTest.save();
        console.log('PTE enquiry saved successfully:', newPteTest); // Log the saved data

        // Send a success message to the client
        res.send(`
            <script>
                alert('PTE Form submitted successfully!');
                window.location.href = '/PTEPre'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving PTE enquiry:', error.message); // Log the error message
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});

// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}

// Route to fetch all PTE enquiries (protected)
website.get('/pteTest-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        const pteTestEnquiries = await PteTest.find(); // Fetch all PTE enquiries
        res.render('panel/testpreAdmin/pteAdmin', { pteTestEnquiries }); // Pass the data to EJS
    } catch (error) {
        console.error('Error fetching PTE enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the enquiries', details: error.message });
    }
});



// Route to delete a SATTest enquiry by ID
website.post('/delete-pteTest/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await PteTest.findByIdAndDelete(enquiryId);

        // Redirect back to the GreTest enquiries page
        res.redirect('/pteTest-enquiries');
    } catch (error) {
        console.error('Error deleting GmatTest enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});

module.exports = website;

//  Free demo Video Upload....


// FOR Contact & about form... modal shema



// Define the CourseEnquiry schema
const courseEnquirySchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    courseInterest: { type: String, required: true },
    preferredMode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create the CourseEnquiry model
const CourseEnquiry = mongoose.model('CourseEnquiry', courseEnquirySchema);

module.exports = CourseEnquiry; // Export the model correctly



website.post('/submit-course-enquiry', async (req, res) => {
    try {
        // Log the form data
        console.log('Form data received:', req.body);

        // Extract form data from the request body
        const { fullName, email, phone, courseInterest, preferredMode } = req.body;

        // Check if the email or phone already exists in the database
        const existingEnquiry = await CourseEnquiry.findOne({ $or: [{ email }, { phone }] });
        if (existingEnquiry) {
            return res.status(400).send('An enquiry with this email or phone already exists.');
        }

        // Create a new enquiry object
        const newCourseEnquiry = new CourseEnquiry({
            fullName,
            email,
            phone,
            courseInterest,
            preferredMode
        });

        // Save the new enquiry to the database
        await newCourseEnquiry.save();
        console.log('Course enquiry saved successfully:', newCourseEnquiry);

        // Send a success message to the client
        res.send(`
            <script>
                alert('Course enquiry submitted successfully!');
                window.location.href = '/contact&about'; // Redirect to the form page
            </script>
        `);
    } catch (error) {
        console.error('Error saving course enquiry:', error.message);
        res.status(500).send(`An error occurred while submitting the form: ${error.message}`);
    }
});


// Middleware to check if the user is authorized
function isAuthenticated(req, res, next) {
    // Example: Check if the user is logged in (you can use sessions, tokens, etc.)
    const isLoggedIn = true; // Replace with your actual authentication logic

    if (isLoggedIn) {
        next(); // User is authorized, proceed to the next middleware/route
    } else {
        res.status(403).send('Unauthorized access. Please log in.'); // User is not authorized
    }
}


// Route to fetch all course enquiries (protected)
website.get('/course-enquiries', isAdminAuthenticated, async (req, res) => {
    try {
        // Fetch all course enquiries from the database
        const courseEnquiries = await CourseEnquiry.find();

        // Render the admin panel template and pass the course enquiries data
        res.render('panel/CourseAdmin', { courseEnquiries });
    } catch (error) {
        console.error('Error fetching course enquiries:', error);
        res.status(500).json({ error: 'An error occurred while fetching the course enquiries', details: error.message });
    }
});


// Route to delete a CourseEnquiry by ID
website.post('/delete-course-enquiry/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const enquiryId = req.params.id; // Get the ID from the URL

        // Find the enquiry by ID and delete it
        await CourseEnquiry.findByIdAndDelete(enquiryId);

        // Redirect back to the course enquiries page
        res.redirect('/course-enquiries');
    } catch (error) {
        console.error('Error deleting course enquiry:', error);
        res.status(500).send('An error occurred while deleting the enquiry.');
    }
});


// Define Video Schema and Model
const VideoSchema = new mongoose.Schema({
    examType: { type: String, required: true },
    description: { type: String, required: true },
    videoPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
});

const Video = mongoose.model('freedemo_video', VideoSchema);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi']; // Add more MIME types if needed
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter });

// Serve static files
website.use(express.static('public'));

// Set up EJS as the view engine
website.set('view engine', 'ejs');
website.set('views', path.join(__dirname, 'views'));

// Admin Panel: Upload Page
// website.get('/freeDemoAdmin', (req, res) => {
//     res.render('panel/freeDemoAdmin');
// });

// Handle Video Upload
website.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('<script>alert("❌ Please upload a video file."); window.location="/freeDemoAdmin";</script>');
        }

        const { examType, description } = req.body;
        const videoPath = `/uploads/${req.file.filename}`;

        const newVideo = new Video({ examType, description, videoPath });
        await newVideo.save();

        res.send('<script>alert("✅ Video uploaded successfully!"); window.location="/freeDemoAdmin";</script>');
    } catch (err) {
        console.error('❌ Error saving video to database:', err);

        // Handle Multer errors
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('<script>alert("❌ File size exceeds the 100MB limit."); window.location="/freeDemoAdmin";</script>');
        }
        if (err.message === 'Invalid file type. Only video files are allowed.') {
            return res.status(400).send('<script>alert("❌ Invalid file type. Only video files are allowed."); window.location="/freeDemoAdmin";</script>');
        }

        res.status(500).send(`❌ Internal Server Error: ${err.message}`);
    }
});

// Display Videos in Free Demo Page
website.get('/freeDemo', async (req, res) => {
    try {
        // Fetch all videos from the database
        const videos = await Video.find();

        // Render the freeDemo template and pass the videos data
        res.render('freeDemo', { videos });
    } catch (err) {
        console.error('❌ Error fetching videos:', err);
        res.status(500).send("❌ Internal Server Error: Could not fetch videos");
    }
});

// Display Videos in Free Demo Page Admin

website.get('/freeDemoAdmin', isAdminAuthenticated, async (req, res) => {
    try {
        const videos = await Video.find();
        console.log('✅ Videos fetched for admin panel:', videos); // Debugging

        if (videos.length === 0) {
            console.log('⚠️ No videos found in the database.');
        }

        res.render('panel/freeDemoAdmin', { videos });
    } catch (err) {
        console.error('❌ Error fetching videos:', err);
        res.status(500).send("❌ Internal Server Error: Could not fetch videos");
    }
});

// Route to delete a video by ID
website.post('/delete-video/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const videoId = req.params.id; // Get the video ID from the URL

        // Find the video by ID and delete it
        const deletedVideo = await Video.findByIdAndDelete(videoId);

        if (!deletedVideo) {
            return res.status(404).send('Video not found.');
        }

        // Optionally, delete the video file from the server
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(__dirname, 'public', deletedVideo.videoPath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('❌ Error deleting video file:', err);
            }
        });

        // Redirect back to the admin panel
        res.redirect('/freeDemoAdmin');
    } catch (error) {
        console.error('❌ Error deleting video:', error);
        res.status(500).send('An error occurred while deleting the video.');
    }
});


// For Delete Free Deme Clases from 


// Routes
website.get('/login', (req, res) => {
    res.redirect('/auth/login');
});

website.get('/auth/register', (req, res) => {
    res.render('auth/register', { errorMessage: null });
});
website.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (user) {
        res.send('already exist');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newuser = await userModel.create({
        name,
        email,
        password: hashedPassword
    })
    const token = jwt.sign({ email }, 'secret');
    res.cookie('token', token);
    res.redirect('/auth/login');
})



website.get('/auth/login', (req, res) => {
    res.render('auth/login', { errorMessage: null });
});

website.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return ({
                errorMessage: 'Please provide both email and password'
            });
        }

        // Find user (case insensitive);
        const user = await userModel.findOne({ email });

        // console.log(user, "Hello");

        if (!user) {
            return ({
                errorMessage: 'Invalid credentials'
            });
        }
        const isMatch = bcrypt.compare(password, user.password);
        if (isMatch) {
            res.redirect('/profile');
        }
        if (user.password != password) {
            return res.send(`<script>
                    alert('Invalid credentials');
                    window.location.href = '/auth/login';
                </script>
            `);
        }

        return res.send(`<script>
                alert('Login successful!');
                // window.location.href = '/dashboard';
            </script>
        `);

    } catch (err) {
        console.error('Login error:', err);
        return ({
            errorMessage: 'An error occurred. Please try again.'
        });
    }
});

website.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.send(`
        <h1>Welcome, ${req.session.user.email}</h1>
        <a href="/logout">Logout</a>
    `);
});

website.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

// Create test user (remove in production)
website.get('/create-test-user', async (req, res) => {
    try {

        const testEmail = 'rajpatil484950@gmail.com';
        const testPassword = 'rajaryan@123';

        // Delete if exists
        await User.deleteOne({ email: testEmail });

        // Create new user (password will be auto-hashed)
        const user = new User({
            email: testEmail,
            password: testPassword
        });

        await user.save();

        res.send(`
            <h1>Test User Created</h1>
            <p>Email: ${testEmail}</p>
            <p>Password: ${testPassword}</p>
            <a href="/auth/login">Go to Login</a>
        `);
    } catch (err) {
        console.error('Error creating test user:', err);
        res.status(500).send('Error creating test user');
    }
});


//  Razorpay Gateway


// Payment Schema
const paymentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    course: String,
    amount: Number,
    currency: String,
    razorpay_payment_id: String,
    razorpay_order_id: String,
    createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: 'rzp_test_CUrnOL4cJ4cUpK',
    key_secret: 'HSjX6dBSfLTIhSHrXtcymK9T'
});

// Routes
website.get('/paymentgateway_index', (req, res) => {
    res.render('paymentgateway/index', {
        razorpayKey: 'rzp_test_CUrnOL4cJ4cUpK' // Pass Razorpay key to the view
    });
});

website.post('/create-order', async (req, res) => {
    try {

        const { amount, course, name, email, phone } = req.body;

        const options = {
            amount: amount * 100, // Convert to paise
            currency: 'INR',
            receipt: 'order_' + Math.random().toString(36).substr(2, 9)
        };

        const order = await razorpay.orders.create(options);

        // Create a temporary payment record
        const payment = new Payment({
            name,
            email,
            phone,
            course,
            amount,
            currency: 'INR',
            razorpay_order_id: order.id
        });
        await payment.save();

        res.json({
            id: order.id,
            amount: order.amount,
            orderId: payment._id
        });
    } catch (error) {
        console.error('Razorpay error:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

website.get('/payment-success', async (req, res) => {
    try {
        const { payment_id, order_id } = req.query;
        // Update payment record
        console.log(req.query)
        const payment = await Payment.findOneAndUpdate({ razorpay_order_id: order_id }, {
            razorpay_payment_id: payment_id,
            status: 'completed'
        }, { new: true });
        if (!payment) {
            return res.status(404).send('Payment record not found');
        }
        console.log(payment)
        res.render('paymentgateway/payment-success', {
            name: payment.name,
            email: payment.email,
            phone: payment.phone,
            course: payment.course,
            amount: payment.amount,
            currency: payment.currency,
            razorpay_payment_id: payment.razorpay_payment_id,
            razorpay_order_id: payment.razorpay_order_id
        });
    } catch (error) {
        console.error('Error saving payment:', error);
        res.status(500).send('Error processing payment');
    }
});


//  Payment Detailes display in the Back-end


website.get('/paymentShow', isAdminAuthenticated, async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.render('panel/paymentDetailesAd.ejs', {
            paymentDetails: payments // Match this with EJS
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).send('Error loading payment details');
    }
});


// Route to delete a payment by ID
website.post('/delete-payment/:id', isAdminAuthenticated, async (req, res) => {
    try {
        const paymentId = req.params.id;

        // Delete the payment from the database
        await Payment.findByIdAndDelete(paymentId);

        // Redirect back to the payment details page
        res.redirect('/paymentShow');
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).send('An error occurred while deleting the payment.');
    }
});

// Start the server on port 3000
const PORT = process.env.PORT || 4000;
website.listen(PORT, () => console.log(`Server running on port ${PORT}`));
