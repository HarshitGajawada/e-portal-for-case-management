const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Registrar = require("../models/registrars");

router.post("/", async (req, res) => {
  const { name,email, phone} = req.body;

  const registrar = await Registrar.findOne({ email, name, phone });
  if (registrar) {

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
  const token = crypto.randomBytes(20).toString("hex");

  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: email,
    subject: "Set Password",
    html: "<h1>Set Password for Registar</h1><p>Click <a href='http://localhost:3000/set-password-registrar?token=" + token + "'>here</a> to set password</p>",
  };



  transporter.sendMail(mailOptions, async (err, data) => {
    if (err) {
      console.log(err.message);
      res.status(500).send("Error " + err);
    } else {
      console.log("Email sent successfully");
    }
      try {

        const registar = await Registrar.findOneAndUpdate(
          { email },//find the registrar with this email
          { token  //update the token and casePreferences
          },
          { new: true } //return the updated document
        );
        res.status(200).send("Email sent successfully");
      } catch (error) {
        console.log(error.message);
      }
  });

}
else{
  res.status(400).send("Registar not found"); //if registar not found
}
})

router.put("/set-password-registrar", async (req, res) => { 
  const token = req.query.token;
  const { password } = req.body;
  const registrar = await Registrar.findOne({ token });
  if(registrar) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const registar = await Registrar.findOneAndUpdate(
        { token },
        { password :hashedPassword },
        { new: true }
      );
      registrar.token = null;
      await registrar.save();
      res.status(200).send("Password set successfully");
    } catch (error) {
      console.log(error.message);
    }
  } else { 
    res.status(400).send("Invalid token");
  }
})


module.exports = router;