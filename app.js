const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const path = require('path')
const cookie = require('cookie-session');
const flash = require('connect-flash');
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const indexRouter = require('./v1/routes/index');
const usersRouter = require('./v1/routes/users');
const indexAdminRouter = require('./admin/routes/index');
const adminRouter = require('./admin/routes/admin');
const bookingRouter = require('./v1/routes/booking')
const TempleRouter = require('./admin/routes/temple')
const liveRouter = require('./v1/routes/Live');
const templeGuruRouter = require('./Guru/routes/Temples');
const pujaRouter = require('./Guru/routes/puja');
const GuruRouter = require('./Guru/routes/guru');
const videoRouter = require('./Guru/routes/video')
const ejs = require('ejs');
const app = express();
const bodyParser = require('body-parser')
const fs = require("fs")
const rithualRouter = require('./Guru/routes/rithual')
const LiveStreaming = require('./models/live.streaming.model');


app.use(flash());

app.use(
  cookie({
    // Cookie config, take a look at the docs...
    secret: 'I Love India...',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true
    },
  }),
);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());


//Database connection with mongodb
const mongoose = require('./config/database');
app.use('/uploads', express.static('uploads'));

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cors());
// CORS configuration
// const allowedOrigins = ['https://3.108.211.160', 'http://13.126.177.227', 'https://13.126.177.227' , 'http://localhost:8001']; // Add your allowed origins here

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));


app.post("/webhooks" , async (req , res) => {  
  try {

    const reqBody = req.body;
    console.log("reqBody....", reqBody.object.id);
     await LiveStreaming.findOneAndUpdate({ live_stream_id: reqBody.object.id },
        {
            $set: {
                status: reqBody.object.type,
                event_type: reqBody.type,
            }
        }, { new: true })

    }catch(err){
         console.log("err(webhooks)" , err.message)
    }
})


app.use('/v1/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/', indexAdminRouter);
app.use('/admin', adminRouter);
app.use('/v1/booking', bookingRouter)
app.use('/admin/temple', TempleRouter)
app.use('/LiveStream', liveRouter);
app.use('/guru/temple', templeGuruRouter);
app.use('/guru/puja', pujaRouter);
app.use('/temple/guru', GuruRouter);
app.use('/guru/video', videoRouter);
app.use('/rithual' , rithualRouter)



const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express Library API",
    },
    servers: [
      {
        url: "https://bhakti.alphainfy.com",
      },
    ],
  },

  apis: [
    "./v1/routes/*.js",
    "./Guru/routes/*.js",
    "./admin/routes/*.js"
  ]
};

const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use('/admin-panel', express.static('admin-panel'))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  console.log("Url not found:", req.url);
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log("err..........", err)
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;