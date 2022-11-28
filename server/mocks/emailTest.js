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

var myEmail = "<Add an email here>"

var bookingRequest = {
    email: myEmail,
    name: "Nicole",
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
        service: "hotmail",
        auth:{
            user:"dentistimo-team11@outlook.com",
            pass:"dsTeam11"
        }
      }
    );
      // Create email content
      let emailContent = {
        from: "dentistimo-team11@outlook.com",
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
            console.log("has error", err)
        }else{
            console.log("email has been send")
        }
      });
    });
};

sendMail(bookingRequest);