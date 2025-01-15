const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken: process.env.OAUTH_ACCESS_TOKEN
  },
});

  async function sendEmail(to, subject, html) {
    let mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: to,
      subject: subject,
      html: html,
    };
  return new Promise((resolve,reject) => { 
    transporter.sendMail(mailOptions, async (err, data) => { 
        if (err) {
            console.log(err.message);

            reject(false);
          } else {
            console.log("Email sent successfully");
            resolve(true);
          }
    });
  }).catch(error => {
    console.log(error.message);
}) 
    
  }
  
module.exports = sendEmail;