const express = require('express');
const app = express()
const dotenv = require('dotenv').config();
const DBconnect = require('./config/db');
const userRoutes = require('./routes/user.route')
const limiter = require('express-rate-limit');

const loginLimiter = limiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 create account requests per `window` (here, per 1 minute)
    message:
      'Too many accounts created from this IP, please try again after a minute',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  })

DBconnect()
port = process.env.PORT || 3000

app.set('view engine' , 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(loginLimiter)
app.use('/user',userRoutes)




app.get('/',(req,res)=>{
    res.render('index')
})


app.listen(port,()=>{ 
    console.log(`App running on Port No:${port}`)
})