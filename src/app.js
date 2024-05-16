const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv').config({path:"./.env"});
const routes = require("./routes/index");   
const morgan = require("morgan");
const app = express();
const cookieParser = require("cookie-parser");
const swaggerUI = require('swagger-ui-express');
const swaggerOutput = require('../docs/swaggerOutput.json');
const PROJECT_NAME = process.env.PROJECT_NAME;
const mongoose = require('mongoose')

app.disable('etag');

//middlewares
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser());

//routes
app.use(`/${PROJECT_NAME}`, routes);

//mongoose validation handler
app.use((err, req, res, next) => {
  console.log(err)
    if (err instanceof mongoose.Error.ValidationError) {
      const validationErrors = {};
      // Extract validation error messages for each field
      for (const field in err.errors) {
        validationErrors[field] = err.errors[field].message;
      }
      return res.status(400).json({ errors: validationErrors });
    }
    //duplication error, as it isn't mongoose type error
    if(err.code==11000)
      return res.status(400).json({ message:err.message,stack:err.stack  });
    next(err);
  });

//default error handler
app.use((err,req,res,next)=>
{
  console.log(err)
    const status = err.statusCode || 500;
    const message = err.message||'Internal server error';

    return res.status(status).json({message,stack:err.stack});
});

//docs routes
app.use(`/${PROJECT_NAME}/docs`,swaggerUI.serve,swaggerUI.setup(swaggerOutput))

module.exports= {
    app
}
