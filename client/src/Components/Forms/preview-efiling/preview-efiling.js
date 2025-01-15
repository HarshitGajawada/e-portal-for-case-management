import { Typography } from "@mui/material";
import "./preview-efiling.css";
import { useContext, useEffect, useState } from "react";
import SpringModal from "../../Modals/springModal";
import axios from "axios";
import { EmailContext } from "../../../hooks/emailContext";
import UploadDocs from "../upload-docs/uploadDocs";
import { v4 as uuidv4 } from "uuid";
import { CircularProgress } from "@mui/material";

const Item = ({ title, value }) => {
  return (
    <div className="item">
      <div className="item-title">
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            fontWeight: "500",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {title}
        </Typography>
      </div>
      <div className="item-value">
        <Typography variant="h5" sx={{ fontWeight: "500" }}>
          {value}
        </Typography>
      </div>
    </div>
  );
};

const Title = ({ title }) => {
  return (
    <div className="doc-title">
      <Typography variant="h4" color="orange" sx={{ fontWeight: "500" }}>
        {title}
      </Typography>
    </div>
  );
};

const Preview = (props) => {
  const email = useContext(EmailContext);
  const storedPlaintDetails = JSON.parse(localStorage.getItem("plaintDetails"));
  const storedPlaintiffDetails = JSON.parse(
    localStorage.getItem("plaintiffDetails")
  );
  const storedDefendantDetails = JSON.parse(
    localStorage.getItem("defendantDetails")
  );
  const [loading1, setLoading1] = useState(false);
  const [registrationDate, setRegistrationDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState("");
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const status = "Pending for approval by court";

  useEffect(() => {
    const day = String(registrationDate.getDate()).padStart(2, "0");
    const month = String(registrationDate.getMonth() + 1).padStart(2, "0"); // January is 0!
    const year = registrationDate.getFullYear();

    setFormattedDate(day + "-" + month + "-" + year);
  }, [registrationDate]);

  const [docDetails, setDocdetails] = useState([]);

  const [additionalFiles, setAdditionalFiles] = useState([]);

  const data = {
    email: email,
    status: status,
    registrationDate: formattedDate,
    storedPlaintDetails: storedPlaintDetails,
    storedPlaintiffDetails: storedPlaintiffDetails,
    storedDefendantDetails: storedDefendantDetails,
  };

  const handleSubmit = async () => {
    setLoading1(true);
    handleClose();
    var flag = 0;

    if (docDetails.length === 0) {
      setError("Please upload all the documents");
      setLoading1(false);
      flag = 1;
      return;
    }

    if (docDetails.some((doc) => doc.file === null)) {
      setError("Please upload all the documents");
      setLoading1(false);
      flag = 1;
      return;
    }

    if (docDetails.some((doc) => doc.file.size > 200 * 1024)) {
      setError("File size should be less than 200kB");
      setLoading1(false);
      flag = 1;
      return;
    }

    if (flag === 1) {
      return;
    }

    const formData = new FormData();

    docDetails.forEach((doc, index) => {
      if (!doc.file) {
        handleClose();
        setError("Please upload all the documents");
        setLoading(false);
        return;
      }
      if (doc.file && doc.file.size > 200 * 1024) {
        handleClose();
        setError("File size should be less than 200kB");
        return;
      }
      formData.append(doc.name, doc.file);
    });

    formData.append("details", JSON.stringify(data));
    console.log(formData);

    try {
      const uploadres = await axios.post(
        "http://localhost:64000/e-filing/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (uploadres.status === 200) {
        handleClose();
        localStorage.clear();
        setLoading1(false);
        alert("Case Created Successfully");
        window.location.reload();
      } else {
        setLoading1(false);
        alert("Something went wrong");
      }
    } catch (err) {
      console.log(err.message);
    }
    finally{
      setLoading1(false)
    }
  };

  return (
    <div className="preview-main">
      {/* Plaint Details */}
      <Typography variant="h3">Preview</Typography>
      {loading1 && (
        <div className="loading-container">
          <CircularProgress style={{ color: "White" }} />
        </div>
      )}
      <div className="docs-details">
        <Title title={"Plaint Details"} />
        <div className="doc-main">
          <div className="doc-left">
            <Item
              title="Cause Title Plaintiff"
              value={storedPlaintDetails.causeTitlePlaintiff}
            />
            <Item
              title="Cause Title Defendant"
              value={storedPlaintDetails.causeTitleDefendant}
            />
            <Item title="Suit Type" value={storedPlaintDetails.suitType} />
            {}
            {storedPlaintDetails.reliefSought!=="nan" && (
              <Item
                title="Relief Sought"
                value={storedPlaintDetails.reliefSought}
              />
            )}
          </div>
          <div className="doc-right">
            <Item
              title="Number of Plaintiffs"
              value={storedPlaintDetails.numberOfPlaintiff}
            />
            <Item
              title="Number of Defendants"
              value={storedPlaintDetails.numberOfDefendants}
            />
            <Item title="Court Fees" value={storedPlaintDetails.courtFees} />
          </div>
        </div>
      </div>
      <div className="docs-details">
        <Title title={"Plaintiff Details"} />
        <div className="doc-main">
          <div className="doc-left">
            <Item
              title="Plaintiff Type"
              value={storedPlaintiffDetails.plaintiffType}
            />
            <Item
              title="Main Plaintiff Name"
              value={storedPlaintiffDetails.plaintiffName}
            />
            <Item
              title="Plaintiff Relation"
              value={storedPlaintiffDetails.plaintiffRelation}
            />
            <Item
              title="Plaintiff Relation Name"
              value={storedPlaintiffDetails.plaintiffParentSpouseName}
            />
            <Item
              title="Plaintiff Dead/Minor"
              value={storedPlaintiffDetails.plaintiffDeadMinor}
            />
            <Item
              title="Plaintiff DOB"
              value={storedPlaintiffDetails.plaintiffDOB}
            />
            <Item
              title="Plaintiff Age"
              value={storedPlaintiffDetails.plaintiffAge}
            />
            <Item
              title="Plaintiff Gender"
              value={storedPlaintiffDetails.plaintiffGender}
            />
          </div>
          <div className="doc-right">
            <Item
              title="Plaintiff email"
              value={storedPlaintiffDetails.plaintiffEmail}
            />
            <Item
              title="Plaintiff Phone"
              value={storedPlaintiffDetails.plaintiffPhone}
            />
            <Item
              title="Plaintiff Address"
              value={storedPlaintiffDetails.plaintiffAddress}
            />
            <Item
              title="Plaintiff City"
              value={storedPlaintiffDetails.plaintiffCity}
            />
            <Item
              title="Plaintiff District"
              value={storedPlaintiffDetails.plaintiffDistrict}
            />
            <Item
              title="Plaintiff State"
              value={storedPlaintiffDetails.plaintiffState}
            />
            <Item
              title="Plaintiff Country"
              value={storedPlaintiffDetails.plaintiffCountry}
            />
            <Item
              title="Plaintiff PinCode"
              value={storedPlaintiffDetails.plaintiffPinCode}
            />
          </div>
        </div>
      </div>
      <div className="docs-details">
        <Title title={"Defendant Details"} />
        <div className="doc-main">
          <div className="doc-left">
            <Item
              title="Defendant Type"
              value={storedDefendantDetails.defendantType}
            />
            <Item
              title="Main Defendant Name"
              value={storedDefendantDetails.defendantName}
            />
            <Item
              title="Defendant Relation"
              value={storedDefendantDetails.defendantRelation}
            />
            <Item
              title="Defendant Relation Name"
              value={storedDefendantDetails.defendantParentSpouseName}
            />
            <Item
              title="Defendant Dead/Minor"
              value={storedDefendantDetails.defendantDeadMinor}
            />
            <Item
              title="Defendant DOB"
              value={storedDefendantDetails.defendantDOB}
            />
            <Item
              title="Defendant Age"
              value={storedDefendantDetails.defendantAge}
            />
            <Item
              title="Defendant Gender"
              value={storedDefendantDetails.defendantGender}
            />
          </div>
          <div className="doc-right">
            <Item
              title="Defendant email"
              value={storedDefendantDetails.defendantEmail}
            />
            <Item
              title="Defendant Phone"
              value={storedDefendantDetails.defendantPhone}
            />
            <Item
              title="Defendant Address"
              value={storedDefendantDetails.defendantAddress}
            />
            <Item
              title="Defendant City"
              value={storedDefendantDetails.defendantCity}
            />
            <Item
              title="Defendant District"
              value={storedDefendantDetails.defendantDistrict}
            />
            <Item
              title="Defendant State"
              value={storedDefendantDetails.defendantState}
            />
            <Item
              title="Defendant Country"
              value={storedDefendantDetails.defendantCountry}
            />
            <Item
              title="Defendant PinCode"
              value={storedDefendantDetails.defendantPinCode}
            />
          </div>
        </div>
      </div>
      <UploadDocs
        docDetails={docDetails}
        setDocdetails={setDocdetails}
        additionalFiles={additionalFiles}
        setAdditionalFiles={setAdditionalFiles}
        error={error}
      />

      <div className="submit-div-preview">
        <button className="submit-button" onClick={handleOpen}>
          Save and Submit
        </button>
      </div>
      <SpringModal
        handleOpen={handleOpen}
        handleClose={handleClose}
        open={open}
        message="submit"
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default Preview;
