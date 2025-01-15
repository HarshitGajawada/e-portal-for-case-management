import * as React from "react";
import Typography from "@mui/material/Typography";
import { ColorModeContext, useMode } from "../../themes";
import { CssBaseline, TextField, ThemeProvider } from "@mui/material";
import { IconButton, useTheme } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Home } from "@mui/icons-material";
import "./login.css";
import { toast } from "react-toastify";
import { Link } from 'react-router-dom';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Changepassmodal from "./changepassmodal";
import {Box} from "@mui/material";
export default function SignIn() {

  const [theme, colorMode] = useMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [caseId, setCaseId] = useState("");
  const [role, setRole] = useState("judge");
  const [emailError, setEmailError] = useState(false);
  const [caseIdError, setCaseIdError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [emailErrorMsg, setEmailErrorMsg] = useState("");
  const [caseIdErrorMsg, setCaseIdErrorMsg] = useState("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState("");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;
  const data = role === "defendant" ? { caseId, password, role } : { email, password, role };
  // const [passwordType, setPasswordType] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  // const [isClicked, setIsClicked] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const validateForm = () => {
    let isValid = true;

    if (role === 'defendant' && !caseId) {
      setCaseIdError(true);
      setCaseIdErrorMsg("Case Id is required");
      isValid = false;
    } else {
      setCaseIdError(false);
      setCaseIdErrorMsg("");
    }

    if (role !== 'defendant' && !email) {
      setEmailError(true);
      setEmailErrorMsg("Email is required");
      isValid = false;
    } else if (role !== 'defendant' && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(email)) {
      setEmailError(true);
      setEmailErrorMsg("Invalid Email");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMsg("");
    }

    if (!password) {
      setPasswordError(true);
      setPasswordErrorMsg("Password is required");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMsg("");
    }

    return isValid;
  };
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = "http://localhost:64000/login/" + role;
    const res = await axios.post(url, data);

    if (res.data.message === "success") {
      navigate("/" + role);
      toast.success("Login Successful");
    } else {
      toast.error(res.data.message);
      navigate("/login");
    }
  };
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <IconButton onClick={() => navigate("/")}>
          <Home />
          <label
            style={{
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            Home
          </label>
        </IconButton>

        <div className="mains-divs">
          <div className="inner-div">
            <div className="inner-items">
              <div className="switch-buttons">
                <button onClick={() => { setRole("judge"); }}>Judge</button>
                <button onClick={() => setRole("registrar")}>Registrar</button>
                <button onClick={() => setRole("client")}>Client</button>
                <button onClick={() => setRole("defendant")}>Defendant</button>
              </div>
              <div
                className="roles"
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Typography
                  variant="h3"
                  sx={{ fontWeight: "500", fontSize: "xl", marginTop: "20px", marginBottom: "20px" }}
                  justifySelf="center"
                >
                  {" "}
                  {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
                </Typography>
              </div>
              <TextField
                value={role === "defendant" ? caseId : email}
                label={role === "defendant" ? "Case ID" : "Email"}
                onChange={role === "defendant" ? (e) => setCaseId(e.target.value) : (e) => { setEmail(e.target.value); }}
                error={role === "defendant" ? caseIdError : emailError}
                helperText={role === "defendant" ? caseIdError ? caseIdErrorMsg : "" : emailError ? emailErrorMsg : ""}
                sx={{
                  width: "100%", marginBottom: '10px',
                  backdropFilter: 'blur(60px)',
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgb(201, 198, 193)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: 'white', // change as needed
                    },
                  },
                }}
              />
              <br />

              <FormControl sx={{
                m: 1, width: '100%', backdropFilter: 'blur(60px)', '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: 'rgb(201, 198, 193)',
                  },
                },
                '& .MuiInputLabel-root': {
                  '&.Mui-focused': {
                    color: 'white', // change as needed
                  },
                },
              }} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-password"
                  type={showPassword ? 'text' : 'password'}
                  error={passwordError}
                  helperText={passwordError ? passwordErrorMsg : ""}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}

                />
              </FormControl>
              {role === 'client' &&
                <div style={{ textAlign: 'right', width: "100%" }}>
                  <button onClick={handleOpen}>Forgot password?</button>
                </div>
              }
              <Box>
                <Changepassmodal
                  handleOpen={handleOpen}
                  handleClose={handleClose}
                  // handleSubmit={handleChangePassword}
                  open={open}
                  message="Change Password?"
                  notif="Mail for changing password sent Successfully"
                />
              </Box>


              <br />
              <div className="submit-enter">
                <button
                  className="submit"
                  onClick={handleSubmit}
                  onSubmit={handleSubmit}
                  type="text"
                >
                  Login
                </button>
              </div>
              <div className="no-account-register">
                {role === 'client' && <Link to="/client-register">No account? Register here</Link>}
                {role === 'registrar' && <Link to="/registrar-register">No account? Register here</Link>}
                {role === 'judge' && <Link to="/judge-register">No account? Register here</Link>}

              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}