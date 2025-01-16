import * as React from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import "./summons-modal.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { CloseFullscreenSharp } from "@mui/icons-material";
import { CloseRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import {CircularProgress} from "@mui/material";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

function SummonModal(props) {
  const [loading, setLoading] = useState(false);
  const [caseDetails, setCaseDetails] = useState([]);
  const [summon, setSummon] = useState(null);
  const [message, setMessage] = useState("");
  const [petition, setPetition] = useState(null);
  const [disabled, setDisabled] = useState(false);


  useEffect(() => {
    setLoading(true);
    axios
      .get(
        "http://localhost:64000/casedetails/send-summons-details?id=" +
          props.caseId
      )
      .then((res) => {
        if (res.status === 200) {
          setCaseDetails(res.data.data);
          setLoading(false);
        }
        if (res.status === 400) {
          setMessage("No data found");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [props.open]);

  async function viewPetition() {
    setLoading(true);
    axios
      .get(
        "http://localhost:64000/casedetails/registrar-view-petition-summons?id=" +
          props.caseId
      )
      .then((res) => {
        if (res.status === 200) {
          setPetition(res.data.petition);
          setLoading(false);
        }
        if (res.status === 400) {
          setMessage("No data found");
          setLoading(false);
        }
      });
  }

  const date = new Date();
  date.setDate(date.getDate() + 30);

  const generatePDF = () => {
    const docDefinition = {
      content: [
        { text: "THE SECOND SCHEDULE", style: "header" },
        { text: "(See section 476)", style: "subheader" },
        { text: "FORM NO.1", style: "header" },
        { text: "SUMMONS TO AN ACCUSED PERSON", style: "header" },
        {
          text: `To ${caseDetails.defendantDetails.defendantName} of`,
        },
        {
          text: `${caseDetails.defendantDetails.defendantAddress}\n${caseDetails.defendantDetails.defendantCity}\n${caseDetails.defendantDetails.defendantState}\n${caseDetails.defendantDetails.defendantPinCode}`,
        },
        {
          text: `WHEREAS your attendance is necessary to answer to a charge of (state shortly the offence charged), you are hereby required to appear in person (or by pleader, as the case may be) before the (Magistrate) of on the ${date
            .toISOString()
            .substring(0, 10)}`,
        },
      ],
      styles: {
        header: {
          fontSize: 15,
          bold: 500,
          alignment: "center",
          margin: [0, 10, 0, 10],
          fontFamily: "Times New Roman",
        },
        subheader: {
          fontSize: 10,
          italics: true,
          bold: false,
          alignment: "center",
          margin: [0, 0, 0, 0],
        },
      },
    };
    pdfMake.createPdf(docDefinition).getBase64(setSummon);
  };

  function base64ToBlob(base64, mimeType = '') {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type: mimeType});
  }

  async function handleSend() {
    setLoading(true);
    setDisabled(true);
    const formData = new FormData();
    const summonBlob = base64ToBlob(summon, 'application/pdf');
    formData.append('summon', summonBlob, 'summon.pdf');
    const petitionBlob = base64ToBlob(petition, 'application/pdf');
    formData.append('petition', petitionBlob, 'petition.pdf');
    formData.append('defendantEmail', caseDetails.defendantDetails.defendantEmail);
    formData.append('caseId', props.caseId);
  
    axios.post("http://localhost:64000/approve-cases/send-summons", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((res) => { 
      if(res.status === 200) { 
        alert("Summon sent successfully");
        props.handleClose();
        props.setReloadKey(prevkey=> prevkey + 1);
        setLoading(false);
      }
      if(res.status === 400) { 
        alert("Summon not sent");
        setLoading(false);
      }
    })

  }

  return (
    <div>
      <Modal
        keepMounted
        open={props.open}
        onClose={props.handleClose}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <div className="summons-modal">
        <IconButton
            size="small"
            style={{
              position: "absolute",
              right: "1%",
              top: "1%",
              color: "white",
              background:"red",
              borderRadius:"50%",
              alignItems:"center",
            }}
            onClick={props.handleClose}
          >
            <CloseRounded />
          </IconButton>
          <div className="buttons-div">
          
            <Button
              onClick={generatePDF}
              variant="contained"
              style={{ background: "orange", margin: "10px" }}
            >
              Generate PDF
            </Button>
            {loading && <CircularProgress  style={{color:"white"}}/>}
            <Button
              onClick={viewPetition}
              variant="contained"
              style={{ background: "orange", margin: "10px" }}
            >
              View Plaint
            </Button>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              height: "100%",
            }}
          >
            {summon && (
              <>
                <div
                  style={{
                    width: "45%",
                    height: "100%",
                    display: "flex",
                    flex: "1",
                    margin: "0.15%",
                  }}
                >
                  <iframe
                    title="Summon"
                    src={`data:application/pdf;base64,${summon}`}
                    width="100%"
                    height="100%"
                    color="white"
                  />
                </div>
              </>
            )}

            {petition && (
              <>
                <div
                  style={{
                    width: "50%",
                    height: "100%",
                    display: "flex",
                    flex: "1",
                    margin: "0.15%",
                  }}
                >
                  
                  <iframe
                    title="Petition"
                    src={`data:application/pdf;base64,${petition}`}
                    width="100%"
                    height="100%"
                    color="white"
                  />
                </div>
              </>
            )}
          </div>
          <Button
            variant="contained"
            color={disabled?"grey":"success"}
            style={{
              marginTop: "1%",

            }}
            onClick={handleSend}
            disabled={disabled}
          >
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default SummonModal;
