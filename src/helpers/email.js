const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  // host: "smtp.gmail.com",
  host: "email-smtp.us-east-1.amazonaws.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const emailWithNodemailer = async (emailData) => {
  try {
    const mailOptions = {
      // from: process.env.SMTP_USERNAME, // sender address
      from: "message@ootms.com", // sender address
      to: emailData.email, // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    };
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending mail", error);
    throw error;
  }
};

const supportEmailWithNodemailer = async (emailData) => {
  try {
    const mailOptions = {
      from: emailData.email, // sender address
      to: "xyz@gmail.com", // list of receivers
      subject: emailData.subject, // Subject line
      html: emailData.html, // html body
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending mail", error);
    throw error;
  }
};

module.exports = { emailWithNodemailer, supportEmailWithNodemailer };
