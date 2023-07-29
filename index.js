const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const EmployeeModel = require('./models/Emp');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
app.use(cors({
    origin:["http://127.0.0.1:5173"],
    methods: ['GET','POST'],
    credentials: true
}))
app.use(cookieParser());

mongoose.connect('mongodb+srv://shalinisai9195:bKJPD4tO8Sq6ETdS@cluster0.h2l6a3i.mongodb.net/')

const varifyUser = (req, res, next) =>{
   const token = req.cookies.token;
   if(!token) {
      return res.json("Token is missing")
   }else {
     
      jwt.verify(token, "jwt-secret-key", (err, decoded)=>{
          if(err){
           return res.json("Error with Token")
          }else{
              if(decoded.role === 'admin'){
                next()
              }else{
                return res.json("Not admin");
              }
          }
      })

   }

}

app.get('/dashboard', varifyUser, (req, res) =>{
    res.json("Success")
})

app.post('/login', (req, res) => {
    const {email, password} = req.body;
     EmployeeModel.findOne({email : email})
     .then(user =>{
        if(user){
            bcrypt.compare(password, user.password, (err, response) => {
                 if(response){
                    const token = jwt.sign({email: user.email, role: user.role},
                        "jwt-secret-key",{expiresIn:'1d'})
                        res.cookie('token', token)
                        return res.json({Status:'Success', role: user.role})
                 }else{
                   return res.json('password is incorrect')
                }
            })
            
        }else{
           return  res.json('No record exister')
        }
     })
})

app.post('/register', (req, res)=>{
  const {name, email, password} = req.body
    bcrypt.hash(password,10)
    .then( hash => {
        EmployeeModel.create({name, email, password: hash})
        .then(employees => res.json( "Success"))
        .catch(err => res.json(err))
    }).catch(err => res.json(err))
    
})

app.listen(3001, ()=>{
    console.log('Server is runnier')
})

app.post('/forgot-password', (req, res)=>{

  const {email} = req.body;
  EmployeeModel.findOne({email: email})
  .then(user => {
    if(!user){
      return res.send({Status: "User not existed"})
    }

    const token = jwt.sign({id: user._id}, "jwt-secret-key", {expiresIn:'1d'})

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shalinisai9195@gmail.com',
        pass: 'bboavoasnxwznzxi'
      }
    });
    
    var mailOptions = {
      from: 'shalinisai9195@gmail.com',
      to: 'balachanderp786@gmail.com',
      subject: 'Reset password Link',
      text: `http://127.0.0.1:5173/reset_password/${user._id}/${token}`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {

        return res.send({Status: "Success"})
        
      }
    });
  })

})

app.post('/reset_password/:id/:token', (req, res) =>{

  const {id, token} = req.params
  const {password} = req.body

  jwt.verify(token, "jwt-secret-key", (err, decoded) =>{

    if(err){
      return res.json({Status:"Error with Token"})
    }else {
       bcrypt.hash(password, 10)
       .then(hash => {
          EmployeeModel.findByIdAndUpdate({_id: id},{password: hash})
          .then(u => res.send({Status:"Success"}))
          .catch(err => res.send({Status: err}))
       })
       .catch(err => res.send({Status: err}))
    }

  })
})