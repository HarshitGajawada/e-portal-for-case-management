import "./e-filing.css";
import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PlaintForm from "../../Components/Forms/plaint-form/plaint-form";
import PlaintiffForm from "../../Components/Forms/plaintiff-form/plaintiff-form";
import RespondantForm from "../../Components/Forms/defendant-form/defendant-form";
import Preview from "../../Components/Forms/preview-efiling/preview-efiling.js";
import Header from "../../Components/Header";

const steps = [
  "Enter plaint details",
  "Plaintiff details",
  "Defendant details",
  "Preview",
];

const Efiling = () => {
  const [activeStep, setActiveStep] = React.useState(  JSON.parse(localStorage.getItem('activeStep')) || 0);
  const [completed, setCompleted] = React.useState({});
  

  const totalSteps = () => {
    return steps.length;
  };

  const completedSteps = () => {
    return Object.keys(completed).length;
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const handleNext = () => {
    const newActiveStep =
      isLastStep() && !allStepsCompleted()
        ? // It's the last step, but not all steps have been completed,
          // find the first step that has been completed
          steps.findIndex((step, i) => !(i in completed))
        : activeStep + 1;
    setActiveStep(newActiveStep);
    localStorage.setItem('activeStep', JSON.stringify(newActiveStep));
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    if (step <= activeStep) {
      setActiveStep(step);
    }
    // setActiveStep(step);
  };

  const handleReset = () => {
    setActiveStep(0);
    setCompleted({});
  };
  return (
    <>
    <Header title={"E-Filing"} />
    <div className="e-filing-main">
      <Box width="100%">
     
        {/* stepper */}
        <Stepper nonLinear activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label} completed={completed[index]}>
              <StepButton
                onClick={handleStep(index)}
              >
                <Typography variant="h5" fontWeight={activeStep === index ? "bold" : "none" } color={activeStep === index ? "orange" : "inherit"}>{label}</Typography>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        <div className="div-forms">
          {allStepsCompleted() ? (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1 }}>
                All steps completed - you&apos;re finished
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                <Box sx={{ flex: "1 1 auto" }} />
                <Button onClick={handleReset}>Reset</Button>
              </Box>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Typography sx={{ mt: 2, mb: 1, py: 1 }} variant="h4">
                Step {activeStep + 1}
              </Typography>
              {/* making forms */}
              
              {activeStep === 0 && (<PlaintForm activeStep={activeStep} handleNext={handleNext}/>)}
              {activeStep === 1 && (<PlaintiffForm activeStep={activeStep} handleNext={handleNext}/>)}
              {activeStep === 2 && (<RespondantForm activeStep={activeStep} handleNext={handleNext}/>)}
              {activeStep === 3 && (<Preview activeStep = {activeStep} handleNext = {handleNext}/>)}

              
              <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
                {activeStep > 0 && (
                <Box sx={{ display:"flex",justifyContent:"flex-start"}}>
                <button
                  variant="contained"
                  onClick={handleBack}
                  className="submit-button"
                  >
                    Back
                  </button>
                </Box>)}
              </Box>
            </React.Fragment>
          )}
        </div>
      </Box>
    </div>
    </>
  );
};

export default Efiling;
