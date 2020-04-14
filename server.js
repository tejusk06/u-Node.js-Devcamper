const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const path = require('path');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
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

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
//? Sets the public folder as static, that means we need to go to 
//? http://localhost:5000/uploads/photo_5d725a1b7b292f5f8ceff788.jpg instead of 
//? http://localhost:5000/public/uploads/photo_5d725a1b7b292f5f8ceff788.jpg

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

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