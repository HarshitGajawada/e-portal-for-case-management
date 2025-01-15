const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const sendEmail = require("../mail-helper/notification-mail");
require("dotenv").config();
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const ClientData = require("../models/clientData");

router.post("/", async (req, res) => {
    const email=req.body.email;
    const user = await ClientData.findOne({email});
    if (user) {
      try{ 
        const token = crypto.randomBytes(20).toString("hex");
        const suc = await sendEmail(email, "Set Password", "<h1>Set Password for Client</h1><p>Click <a href='http://localhost:3000/client-change-password?token=" + token + "'>here</a> to set password</p>");
        const client = await ClientData.findOneAndUpdate(
          { email },//find the judge with this email
          { token },
          { new: true } //return the updated document
        );
        res.status(200).send("Email sent successfully");
      }
      catch (error) {
        console.log(error.message);
      }
    }
    else{
        res.status(400).send("Client not found")
    }
});

router.put("/client-change-password", async (req, res) => {
    const token = req.query.token;
    const password = req.body.password;
    const client = await ClientData.findOne({ token });
    if (client) {
        try{
        const newPassword = await bcrypt.hash(password, 10);
        const client = await ClientData.findOneAndUpdate(
            { token },
            { password: newPassword },
            { new: true });
        client.token = null;
        await client.save();
        // res.clearCookie("accessToken");
        res.status(200).send("Password changed successfully");
        } catch (error) {
            console.log(error.message);
        }
    }
    else {
        res.status(400).send("Invalid Token");
    }
});


module.exports = router;


