const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const efiling = require("../models/eFilingModel");
const approvedcases = require("../models/approvedCases");
const judges = require("../models/judges");
const nodemailer = require("nodemailer");
const multer = require("multer");
const rejectedcases = require("../models/rejectedCases");
const sendEmail = require("../mail-helper/notification-mail");
const GenerateDate = require("../DateGenerator/DateGenerator");
require("dotenv").config();

const upload = multer({ storage: multer.memoryStorage() });
const generateRegistrationId = (pre) => {
  let year = new Date().getFullYear().toString().substr(2, 2); // Get the last two digits of the current year
  let prefix = "HCT";
  let randomString = Math.random().toString(36).substr(2, 10); // Generate a random string of 10 characters

  let caseId = pre + year + prefix + randomString;
  return caseId;
};
router.post(
  "/",
  upload.any(),
  async (req, res) => {
    const data = req.body;
    const fileData = req.files;


    const regId = generateRegistrationId("SR");

    try {
      const data = JSON.parse(req.body.details);
      const caseId = regId;
      const email = data.email;
      const docDetails = { 
        petition: null,
        aadhar: null,
        vakalatnama: null,
        others: []
      }

      req.files.forEach(file => {
        if (file.fieldname === 'petition' || file.fieldname === 'aadhar' || file.fieldname === 'vakalatnama') {
          docDetails[file.fieldname] = {
            filename: file.originalname,
            contentType: file.mimetype,
            fileData: file.buffer,
          };
        } else {
          docDetails.others.push({
            filename: file.fieldname,
            contentType: file.mimetype,
            fileData: file.buffer,
          });
        }
      });
     
      const newEfiling = new efiling({
        caseId: caseId,
        email: data.email,
        status: data.status,
        registrationDate: data.registrationDate,
        plaintDetails: data.storedPlaintDetails,
        plaintiffDetails: data.storedPlaintiffDetails,
        defendantDetails: data.storedDefendantDetails,
        docDetails: docDetails,
      });
      await newEfiling.save();
      try {
        const suc = await sendEmail(data.email, "Case Registration", "<h1>Your case has been registered successfully. Your case id is " + caseId+"</h1>");
        if(suc){
          res.status(200).json({ message: "Email Sent Succesfully" });
        }
        else{
          res.status(400).json({ message: "fail" });
        }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "fail" });
    }
  }catch(error){
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

router.post("/judge-reject-case", async (req, res) => {
  const id = req.body.id;
  const reasonforrejection = req.body.reasonforrejection;
  const rejectedDate = GenerateDate();
  try {
    const data = await efiling.findOneAndUpdate(
      { caseId: id }, // find a document with this id
      {
        status: "Rejected",
        reasonforrejection: reasonforrejection,
        rejectedDate: rejectedDate,
        rejectedDate: rejectedDate,
      },
      { new: true } // return the updated document
    );
    if (data) {
      const newRejectedCase = new rejectedcases(data.toObject());
      await newRejectedCase.save();
      const judge = await judges.findOneAndUpdate(
        { "cases.caseId":id} , // find a judge with this case id
        { $pull: { cases:{caseId:id} } }, // remove the case id from the cases array
        { "cases.caseId":id} , // find a judge with this case id
        { $pull: { cases:{caseId:id} } }, // remove the case id from the cases array
        { new: true } // return the updated document
      );
      if(newRejectedCase && judge){ 
        res.status(200).json({ message: "success" });
      }
      else{
        res.status(400).json({ message: "fail-new" });
      }
    } else {
      res.status(400).json({ message: "fail" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
router.post("/registrar-reject-case", async (req, res) => {
  const id = req.body.id;
  const reasonforrejection = req.body.reasonforrejection;
  const rejectedDate = GenerateDate();
  try {
    const data = await efiling.findOneAndUpdate(
      { caseId: id }, // find a document with this id
      {
        status: "Rejected",
        reasonforrejection: reasonforrejection,
        rejectedDate: rejectedDate,
      },
      { new: true } // return the updated document
    );
    if (data) {
      const newRejectedCase = new rejectedcases(data.toObject());
      await newRejectedCase.save();
      if(newRejectedCase){ 
        res.status(200).json({ message: "success" });
      }
      else{
        res.status(400).json({ message: "fail-new" });
      }
    } else {
      res.status(400).json({ message: "fail" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


let currentJudgeIndex = 0;
router.post("/approve-case", async (req, res) => {
  const id = req.body.id;
  const registrarApprovedDate = GenerateDate();
  try {
    const caseData = await efiling.findOne({ caseId: id });
    const val = caseData.plaintDetails.suitValue;
    console.log(val);
    const mandal = caseData.plaintDetails.mandal;
    const email = caseData.email;
    console.log(mandal);

    let reqrole = val <= 2000000 ? "junior" : (val <= 5000000 ? "senior" : "chief");

    console.log(reqrole);
    const judge = await judges.aggregate([
      {
        $match: {
          mandals: { $in: [mandal] },
          role: reqrole
        },
      },
      {
        $addFields: {
          numCases: { $size: { $ifNull: ["$cases", []] } },
        },
      },
      {
        $sort: { numCases: 1 },
      },
      {
        $project: {
          name: 1,
          numCases: 1,
          email: 1
        },
      }
    ]).limit(1);
    console.log(judge);

    if (judge.length === 0) {
      res.status(400).json({ message: "No judges available" });
    } else {
      const judgeName = judge[0].name;
      const newCaseId = generateRegistrationId("OS");
      console.log(judgeName);
      try {
        const data = await efiling.findOneAndUpdate(
          { caseId: id }, // find a document with this id
          {
            caseId: newCaseId,
            status: "Approved and pending for summons",
            judgeAssigned: judgeName,
            registrarApprovedDate:registrarApprovedDate
          },
          { new: true } // return the updated document
        );

        const judgeData = await judges.findOneAndUpdate(
          { name: judgeName }, // find a document with this name
          {
            $push: { cases: { caseId: newCaseId, status: "Pending for review by judge" } },
          },
          { new: true } // return the updated document
        );

        const newApprovedCase = new approvedcases(data.toObject());
        await newApprovedCase.save();

        if(newApprovedCase){ 
          res.status(200).json({ message: "success" });
          
        }
        else{
          res.status(400).json({ message: "fail-new" });
        }
        try {
          const suc1 = await sendEmail(email, "Case Approval", "<h1>Your Case has been Approved Succesfully. Your OS number is " + newCaseId+"</h1>");
          const suc2 = await sendEmail(judge[0].email, "Case Approval", "<h1>You have been allocated a case. OS number is " + newCaseId+"</h1>");

          if(suc1 && suc2){
            res.status(200).json({ message: "Email Sent Succesfully" });
          }
          else{
            res.status(400).json({ message: "fail" });
          }
      } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "fail" });
      }
      } catch (error) {
        console.log(error.message);
      }
      
    }
  } catch (error) {
    console.log(error.message);
  }
});



module.exports = router;