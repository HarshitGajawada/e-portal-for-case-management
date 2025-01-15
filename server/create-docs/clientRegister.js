const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ClientData = require("../models/clientData");

router.post("/", async (req, res) => {
  const { firstName, lastName, email, phone, dateOfBirth } = req.body;
  const token = crypto.randomBytes(20).toString("hex");
  const newClient = new ClientData({
    firstName,
    lastName,
    email,
    token: token,
    phone,
    dateOfBirth,
  });
  const user = await ClientData.findOne({
    email: email,
  });
  try {
    if (!user) {
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
    
      let mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: "Set Password",
        html: "<h1>Set Password for Client</h1><p>Click <a href='http://localhost:3000/set-password-client?token=" + token + "'>here</a> to set password</p>",
      };
  
      transporter.sendMail(mailOptions, async (err, data) => {
        if (err) {
          console.log(err.message);
          res.status(500).send("Error " + err);
        } else {
          await newClient.save();
          res.status(200).send("If the email you provided is valid, a set password mail will be sent to that email-address");
        }
          
      });
    } else {
      res.status(400).json({ message: "User already exists" });        
    }
  } catch (err) {
    console.log(err.message);
  }
});
router.put("/set-password-client", async (req, res) => { 
  const token = req.query.token;
  const { password } = req.body;
  const client = await ClientData.findOne({ token });
  if(client) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const client = await ClientData.findOneAndUpdate(
        { token },
        { password :hashedPassword },
        { new: true }
      );
      client.token = null;
      await client.save();
      res.status(200).send("Password set successfully");
    } catch (error) {
      console.log(error.message);
    }
  } else { 
    res.status(400).send("Invalid token");
  }
})

module.exports = router;
