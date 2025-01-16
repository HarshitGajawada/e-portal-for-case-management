const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const sendSummonViaMail = require("../mail-helper/summon-mail");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const approvedCases = require("../models/approvedCases");
const eFilingModel = require("../models/eFilingModel");
const defendantDetails = require("../models/defendantDetails");
const judges = require("../models/judges");
const GenerateDate = require("../DateGenerator/DateGenerator");
router.post("/send-summons",upload.fields([{ name: 'summon', maxCount: 1 }, { name: 'petition', maxCount: 1 }]) ,async (req, res) => { 
    const summon = req.files.summon[0].buffer;
    const summonFileName = req.files.summon[0].originalname;
    const petition = req.files.petition[0].buffer;
    const petitionFileName = req.files.petition[0].originalname;
    const defendantEmail = req.body.defendantEmail;
    const caseId = req.body.caseId;
    try {
        function generatePassword() {
            let password = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          
            for (let i = 0; i < 6; i++) {
              password += characters.charAt(Math.floor(Math.random() * characters.length));
            }
          
            return password;
          }

          const password = generatePassword();
    
        const defandantCredentials = new defendantDetails({ 
            caseId:caseId,
            password: password
        });

        const sendEmailPromise = sendSummonViaMail(defendantEmail, "Summoning to Appear in Court", "<h1>You have been summoned to court. Your case id is " + caseId + "</h1></br><h2>Your username is the case id and your password is "+password+ "</h2>", [
            {
                filename: summonFileName,
                content: summon
            },
            {
                filename: petitionFileName,
                content: petition
            }
        ],res)

    // Start the update processes
    const summonedDate = GenerateDate();
    const updatePromise1 = await eFilingModel.findOneAndUpdate(
        {caseId: caseId},
        {status: "Summoned the defendant and pending for written statement",
        summonedDate: summonedDate},
        {new:true}
    );
    const updatePromise2 = approvedCases.findOneAndUpdate(
        {caseId: caseId},
        {status: "Summoned the defendant and pending for written statement",
        summons: {
            filename: summonFileName,
            contentType: req.files.summon[0].mimetype,
            fileData: summon
        },
        summonedDate: summonedDate
    },
        {new:true}
    );
    const judgeNames = updatePromise1.judgeAssigned.split(",");
    const updatePromise4 = judges.updateMany( 
    {name: { $in: judgeNames }},
    {
      $set: {
        "cases.$[elem].status": "Summoned the defendant and pending for written statement"
      }
    },
    {
      arrayFilters: [
        {"elem.caseId": caseId}
    ]

    },
    {new:true}
    )


    const updatePromise3 = defandantCredentials.save();
    const [suc, data1, data2,data3] = await Promise.all([sendEmailPromise, updatePromise2, updatePromise3,updatePromise4]);

        if(suc) {
            
            res.status(200).json({message: "Summon sent successfully"});
        }
        else{
            res.status(500).json({message: "Summon not sent"});
        }

    }catch(error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }

})

router.post("/defendant-written-statement",upload.fields([{ name: 'writtenStatement', maxCount: 1 }]) ,async (req, res) => { 
    const writtenStatement = req.files.writtenStatement[0].buffer;
    const writtenStatementFileName = req.files.writtenStatement[0].originalname;
    const caseId = req.body.caseId;
   
    const writtenStatementSubmittedDate = GenerateDate() ;
    try {
        const approvedCase = await approvedCases.findOneAndUpdate(
            {caseId: caseId},
            {
             status: "Defendant has submitted the written statement and pending for review by judge",
             $set: {
                "docDetails.writtenStatement": {
                    filename: writtenStatementFileName,
                    contentType: req.files.writtenStatement[0].mimetype,
                    fileData: writtenStatement
                },
            },
            writtenStatementSubmittedDate: writtenStatementSubmittedDate
        },
            {new:true}
        )
        const approvedCase1 = await eFilingModel.findOneAndUpdate(
            {caseId: caseId},
            {
             status: "Defendant has submitted the written statement and pending for review by judge",
             $set: {
                "docDetails.writtenStatement": {
                    filename: writtenStatementFileName,
                    contentType: req.files.writtenStatement[0].mimetype,
                    fileData: writtenStatement
                },
                
            },
            writtenStatementSubmittedDate:writtenStatementSubmittedDate
        },
            {new:true}
        )
        
        const judgeNames = approvedCase.judgeAssigned.split(",");
        const updatePromise4 = await judges.updateMany( 
        {name: { $in: judgeNames }},
        {
          $set: {
            "cases.$[elem].status": "Defendant has submitted the written statement and pending for review by judge"
          }
        },
        {
          arrayFilters: [
            {"elem.caseId": caseId}
        ]
    
        },
        {new:true}
        )
        res.status(200).json({message: "Written statement submitted successfully"});

    }catch(error) { 
        console.log(error.message);
        res.status(500).json({message: error.message});
    }

    
 
})

module.exports = router;