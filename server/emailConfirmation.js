const nodemailer = require('nodemailer');
const { send } = require('process');
require('dotenv').config()

// Nodemailer function for sending email
exports.sendEmail = async function (bookingRequest) {
  
  nodemailer.createTestAccount((err) => {
      if (err) return err;

      // Login to email
      let transporter = nodemailer.createTransport(
      {
        service: process.env.SERVICE,
        auth:{
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
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
          <p>Time: ${bookingRequest.time}</p> `,
    };
  
    // Send email confirmation
    transporter.sendMail(emailContent, (err) => {
      if(err){
        console.log("has error", err)
        return err
      }else{
          console.log("Email has been send")
      }
    });
  });
};

