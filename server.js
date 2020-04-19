const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')
const xss = require('xss-clean')
const hpp = require('hpp')
const cors = require('cors')
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/db');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Connect to database - has to be below dotenv.config since it uses config variables 
connectDB();

// Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// Body parser 
app.use(express.json())

// Cookie Parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File uploading 
//? Enables express-fileupload
app.use(fileupload());

// Sanitize data 
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks 
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // 100 requests per 10 mins
});

app.use(limiter)

// Prevent http param pollution
app.use(hpp());

// Enable cors 
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
//? Sets the public folder as static, that means we need to go to 
//? http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg instead of 
//? http://localhost:5000/public/uploads/photo_5d725a1b7b292f5f8ceff788.jpg

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler); //? Has to be after routes are mounted so that it catches the errors from those routes

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
})