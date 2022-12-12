/**
 * This file test the email confirmation functionality.
 * It was creating as a prove of concept.
 * 
 * Source: https://github.com/nodemailer/nodemailer
 * 
 * Insert and email in the variable myEmail and run the file.
 * The email often comes as a spam so look for it there. 
 * */
const nodemailer = require("nodemailer"); 
require('dotenv').config({path: "../.env" })

var myEmail = "<Add an email here>"

var bookingRequest = {
    email: process.env.MY_EMAIL || myEmail,
    name: "Peter",
    date: "2022-12-01",
    time: "09:00-09:30"
}

// Nodemailer function for sending email
function sendMail(bookingRequest) {
  
  nodemailer.createTestAccount((err) => {
      if (err) return err;

      // Login to email
      let transporter = nodemailer.createTransport(
      {
        service:process.env.SERVICE,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
      }
    );
      // Create email content
      let emailContent = {
        from: process.env.EMAIL,
        to: bookingRequest.email,
        subject: "Appointment confirmation",
        html: `
                <h3>Hello ${bookingRequest.name}!</h3>
                <h4>Here is your booking information: </h4>
                    <p>Date: ${bookingRequest.date}</p>
                    <p>Time: ${bookingRequest.time}</p>   
                    `,
      };

      // Send email confirmation
      transporter.sendMail(emailContent, (err) => {
        if(err){
         transporter.close();
         return err
       }
     });
   });
};
