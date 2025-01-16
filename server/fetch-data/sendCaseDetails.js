const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const efiling = require("../models/eFilingModel");
const caseCateg = require("../models/caseCategory");
const judges = require("../models/judges");
const approvedcases = require("../models/approvedCases");

//client dashboard details
router.get("/client-case-details/", async (req, res) => {
  const email = req.query.email;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    const totalCount = await efiling.countDocuments({ email: email });
    let data;
    if (search) {
      data = await efiling
        .find({
          email: email,
          $or: [
            { caseId: new RegExp(search, "i") },
            { "plaintDetails.causeTitlePlaintiff": new RegExp(search, "i") },
            { status: new RegExp(search, "i") },
            { "plaintDetails.caseCategory": new RegExp(search, "i") },
            { registrationDate: new RegExp(search, "i") },
            {judgeAssigned: new RegExp(search, "i")}  
          ],
        })
        .select(["plaintDetails", "caseId", "status", "registrationDate","judgeAssigned"])
        .skip(skip)
        .limit(limit);
    } else {
      data = await efiling
        .find({ email: email })
        .select(["plaintDetails", "caseId", "status", "registrationDate","judgeAssigned"])
        .skip(skip)
        .limit(limit);
    }
    if (data.length > 0) {
      res.status(200).json({ data: data, totalCount: totalCount });
    } else {
      res.status(400).json({ message: "No data found for this email" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get('/registrar-view-petition-summons', async (req, res) => {
    const id=req.query.id;
    try{
        const data = await approvedcases.findOne({caseId: id}).select('docDetails');
        if(data){
            const petitionBase64 = Buffer.from(data.docDetails.petition.fileData).toString('base64');
            res.status(200).json({petition: petitionBase64, petitionName: data.docDetails.petition.filename});
        }
        else{
            res.status(400).json({message: "No data found"});
        }
    }catch (error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
})

//registrar dashboard details
router.get("/registrar-case-details", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    let data;

    const totalCount = await efiling.countDocuments({
      status: "Pending for approval by court",
    });

    if (search) {
      data = await efiling
        .find({
          status: "Pending for approval by court",
          $or: [
            { caseId: new RegExp(search, "i") },
            { "plaintDetails.causeTitlePlaintiff": new RegExp(search, "i") },
            { "plaintDetails.causeTitleDefendant": new RegExp(search, "i") },
            { registrationDate: new RegExp(search, "i") },
          ],
        })
        .select(["plaintDetails", "caseId", "registrationDate", "status"])
        .skip(skip)
        .limit(limit);
    } else {
      data = await efiling
        .find({ status: "Pending for approval by court" })
        .select(["plaintDetails", "caseId", "registrationDate", "status"])
        .skip(skip)
        .limit(limit);
    }
    if (data.length > 0) {
      res.status(200).json({ data: data, totalCount: String(totalCount) });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar allocation of cases
// router.get("/registrar-allocation-of-cases", async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 2;
//   const skip = (page - 1) * limit;
//   const search = req.query.search || "";
//   try {
//     let data;
//     const totalCount = await efiling.countDocuments({
//       status: "Pending for allocation of judge"});
//     if(search) {
//       data = await efiling
//       .find({
//         caseSensitivity: "High",
//         status: "Pending for allocation of judge",
//         $or: [
//           { caseId: new RegExp(search, "i") },
//           { "plaintDetails.caseCategory": new RegExp(search, "i") },
//           { "plaintDetails.caseSubCategory": new RegExp(search, "i") },
//         ]
//       })
//       .select([
//         "plaintDetails.caseCategory",
//         "plaintDetails.caseSubCategory",
//         "caseId",
//         "caseSensitivity",
//       ])
//       .skip(skip)
//       .limit(limit);
//     } else {
//       data = await efiling
//               .find({
//                 caseSensitivity: "High",
//                 status: "Pending for allocation of judge",
//               })
//               .select([
//                 "plaintDetails.caseCategory",
//                 "plaintDetails.caseSubCategory",
//                 "caseId",
//                 "caseSensitivity",
//               ])
//               .skip(skip)
//               .limit(limit);
//     }
//     if (data.length > 0) {
//       res.status(200).json({ data: data, totalCount: String(totalCount) });
//     } else {
//       res.status(400).json({ message: "No data found" });
//     }
//   } catch (error) {
//     console.log(error.message);
//     res.status(500).json({ message: error.message });
//   }
// });

//registrar view details
router.get("/registrar-view-details", async (req, res) => {
  const id = req.query.id;
  console.log(id)
  try {
    const data = await efiling.findOne({ caseId: id });
    if (data) {
      res.status(200).send([data]);
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar view documents
router.get("/registrar-view-documents", async (req, res) => {
  const id = req.query.id;
  try {
    const data = await efiling.findOne({ caseId: id }).select("docDetails");
    if (data) {
      let documents = {};
      for (let docName in data.docDetails) {
        if (docName === 'others') {
          documents[docName] = data.docDetails[docName].map((doc, index) => {
            const docBase64 = Buffer.from(doc.fileData).toString("base64");
            return {
              fileData: docBase64,
              filename: doc.filename
            };
          });
        } else if (data.docDetails[docName].fileData) {
          const docBase64 = Buffer.from(data.docDetails[docName].fileData).toString("base64");
          documents[docName] = {
            fileData: docBase64,
            filename: data.docDetails[docName].filename
          };
        } else {
          console.log("No file found");
        }
      }
      res.status(200).json(documents);
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar view petition for pending cases from e-filings collection
router.get("/registrar-view-petition", async (req, res) => {
  const id = req.query.id;
  try {
    const data = await efiling.findOne({ caseId: id }).select("docDetails");
    if (data) {
      const petitionBase64 = Buffer.from(
        data.docDetails.petition.fileData
      ).toString("base64");
      res
        .status(200)
        .json({
          petition: petitionBase64,
          petitionName: data.docDetails.petition.filename,
        });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar view petition in summons page from approved cases collection
router.get("/registrar-view-petition-summons", async (req, res) => {
  const id = req.query.id;
  try {
    const data = await approvedcases
      .findOne({ caseId: id })
      .select("docDetails");
    if (data) {
      const petitionBase64 = Buffer.from(
        data.docDetails.petition.fileData
      ).toString("base64");
      res
        .status(200)
        .json({
          petition: petitionBase64,
          petitionName: data.docDetails.petition.filename,
        });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar list of judges available for allocation high cases
router.get("/registrar-view-judges", async (req, res) => {
  const caseCategory = req.query.caseCategory;
  try {
    const data = await judges
      .find({ availability: true, casePreferences: { $in: [caseCategory] } })
      .select(["name", "cases"]);
    // const data = await judges.find({availability: true}).select(['name','cases']);
    if (data) {
      res.status(200).json({ data: data });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get("/judge-active-case-details", async (req, res) => {
  const email = req.query.email;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";
  try {
    const judge = await judges.findOne({ email: email });
    if (judge) {
      let data;
      const totalCount = judge.cases.filter(caseObj => caseObj.status === "Summoned the defendant and pending for written statement" || caseObj.status === "Defendant has submitted the written statement and pending for review by judge").length;
      const caseIds = judge.cases
        .filter(
          (caseid) =>
            caseid.status ===
                "Summoned the defendant and pending for written statement" ||
                "Defendant has submitted the written statement and pending for review by judge"
        )
        .map((caseObj) => caseObj.caseId);
      if(search){
        data = await approvedcases
          .find({ caseId: { $in: caseIds },
                 $or: [
                  { caseId: new RegExp(search, "i") },
                  { plaintDetails: new RegExp(search, "i") },
                  { registrationDate: new RegExp(search, "i") },
                  { status: new RegExp(search, "i") },
                  { caseSensitivity: new RegExp(search, "i")}
                 ]})
          .select([
            "plaintDetails",
            "caseId",
            "status",
            "registrationDate",
            "caseSensitivity",
            "docDetails.writtenStatement",
          ])
          .skip(skip)
          .limit(limit);
      } else {
          data = await approvedcases
            .find({ caseId: { $in: caseIds } })
            .select([
              "plaintDetails",
              "caseId",
              "status",
              "registrationDate",
              "caseSensitivity",
              "docDetails.writtenStatement",
            ])
            .skip(skip)
            .limit(limit);
      }
      if (data.length > 0) {
        res.status(200).json({ data: data, totalCount: String(totalCount)});
      } else {
        res.status(400).json({ message: "No data found" });
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//registrar case details from approved cases pending for summons
router.get("/send-summons", async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 2;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  try {
    let data;
    const totalCount = await approvedcases.countDocuments({
      status: "Approved and pending for summons"});
    if (search){
      data = await approvedcases
        .find({status: "Approved and pending for summons",
              $or: [
                { caseId: new RegExp(search, "i") },
                { "judgeAssigned": new RegExp(search, "i") },
                { registrationDate: new RegExp(search, "i") },
              ]
        })
        .select([
          "caseId",
          "registrationDate",
          "judgeAssigned",
          "status"
        ])
        .skip(skip)
        .limit(limit);
    } else {
      data = await approvedcases
        .find({ status: "Approved and pending for summons" })
        .select([
          "caseId",
          "registrationDate",
          "judgeAssigned",
          "status"
        ])
        .skip(skip)
        .limit(limit);
    }
    if (data.length > 0) {
      res.status(200).json({ data: data, totalCount: String(totalCount)});
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//details to be filled in summon and showing petition in summons modal
router.get("/send-summons-details", async (req, res) => {
  const id = req.query.id;
  try {
    const data = await approvedcases
      .findOne({ caseId: id })
      .select(["defendantDetails", "docDetails.petition"]);
    if (data) {
      res.status(200).json({ data: data });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get("/defendant-case-details", async (req, res) => {
  const caseId = req.query.caseId;
  try {
    const data = await approvedcases
      .findOne({ caseId: caseId })
      .select(["plaintDetails", "caseId", "status", "registrationDate"]);
    if (data) {
      res.status(200).json({ data: [data] });
    } else {
      res.status(400).json({ message: "No data found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/send-docs", async (req, res) => { 
  const caseId = req.query.caseId;
  const fileName = req.query.fileName;

  try {
    const data = await approvedcases.findOne({ caseId: caseId }).select("docDetails."+fileName);
    if(data) {
      const fileBase64 = Buffer.from(data.docDetails[fileName].fileData).toString('base64');
      res.status(200).json({file:fileBase64,fileName:data.docDetails[fileName].filename});
    }
    else{
      res.status(400).json({ message: "No data found" });
    }
  }catch(error){
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }

})


module.exports = router;