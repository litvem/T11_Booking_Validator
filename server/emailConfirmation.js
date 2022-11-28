const nodemialer = require('nodemailer');

// Nodemailer function for sending email
exports.sendEmail = function (bookingRequest) {
  
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
            <p>Time: ${bookingRequest.time}</p> `,
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