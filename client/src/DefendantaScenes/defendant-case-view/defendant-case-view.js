import { useState, useEffect, useContext } from "react";
import axios from "axios";
import "./defendant-case-view.css";
import Header from "../../Components/Header";
import { CaseIdContext } from "../../hooks/caseIdContext";
import { Button, CircularProgress } from "@mui/material";
import { set } from "mongoose";

const DefendantCaseView = () => {
  const caseId = useContext(CaseIdContext);
  const [caseDetails, setCaseDetails] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState({});
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [writtenStatement, setWrittenStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reloadkey, setReloadKey] = useState(0);

  useEffect(() => {
    axios
      .get(
        "http://localhost:64000/casedetails/defendant-case-details?caseId=" +
          caseId
      )
      .then((res) => {
        setCaseDetails(res.data.data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [caseId, reloadkey]);

  const handleUpload = () => {
    const formData = new FormData();
    formData.append(
      "writtenStatement",
      writtenStatement,
      "WrittenStatement.pdf"
    );
    formData.append("caseId", caseId);
    setLoading(true);
    axios
      .post(
        "http://localhost:64000/approve-cases/defendant-written-statement",
        formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);
          setReloadKey(reloadkey + 1);
          setUploadSuccess({...uploadSuccess, [caseId]:true})
          alert("Written Statement submitted successfully");
          
        }
      }).catch((err) => { 
        console.log(err.message);
        setLoading(false);
      })
  };

  return (
    <div className="defendant-main">
      <Header title="Your Cases" />
      <div className="table-main">
        <table className="defendant-table">
          <thead>
            <tr>
              <td>Case Id</td>
              <td>Cause Title</td>
              <td>Regn Date</td>
              <td>Case Status</td>
              <td>Pending Actions</td>
            </tr>
          </thead>
          <tbody>
            {caseDetails.length === 0 ? (
              <CircularProgress style={{color:"white"}}/>
            ) : (
              caseDetails.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.caseId}</td>
                    <td>
                      {item.plaintDetails.causeTitlePlaintiff} Vs{" "}
                      {item.plaintDetails.causeTitleDefendant}
                    </td>
                    <td>{item.registrationDate}</td>
                    <td>{item.status}</td>
                    <td>
                      {item.status.includes("pending for written statement") ? (
                        <input
                        type="file"
                        style={{ whiteSpace: "nowrap" }}
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            setIsFileSelected(true);
                            setWrittenStatement(e.target.files[0]);
                          } else {
                            setIsFileSelected(false);
                          }
                        }}
                      />
                      ):null}

                      {isFileSelected ? (
                        <>
                        { loading && <CircularProgress style={{color:"white"}}/> }
                        <Button
                          variant="contained"
                          color={uploadSuccess[item.caseId] ? "inherit" : "success"}
                          style={{
                            fontSize: "12px",
                            borderRadius: "5px",
                            marginTop: "5%",
                            opacity: uploadSuccess[item.caseId] ? 0.8 : 1
                          }}
                          disabled={loading || uploadSuccess[item.caseId]}
                          onClick={handleUpload}
                        >
                          {uploadSuccess[item.caseId] ? "Uploaded" : "Upload"}
                        </Button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DefendantCaseView;
