import React from 'react';
import './set-password.css';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
const ClientPassword = () => { 
    const [showPassword, setShowPassword] =useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
      event.preventDefault();
    };
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [type, setType] = useState("password");
    const [error, setError] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const handlePasswordSubmit = async () => { 
        if(password === rePassword) {
            
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            const res = await axios.put("http://localhost:64000/client-register/set-password-client?token="+token,{password});
            if(res.status === 200) {
                setTimeout(() => { 
                    setError("");
                    navigate("/login");
                },3000);
                setError("Password set successfully");
                
            }
        } else { 
            setError("Passwords do not match");
        }
    }

    return (
        <div className="set-password-main">
            {error && <h1 style={{color:"orange"}}>{error}</h1>}
            <div className="set-password-main-primary">
                <Typography variant='h5' sx={{color:"white"}}>Client Set Password</Typography>
                <div className='set-password-main-input'>
                <FormControl sx={{ m: 1, width: '100%', backdropFilter:'blur(60px)',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white', // Replace 'color' with your desired color
      },
      '&:hover fieldset': {
        borderColor: 'orange', // Hover state border color
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
      '& input': {
        color: 'white', // Text color
      },
    },
    '& .MuiInputLabel-root': {
        color:"white",
      '&.Mui-focused': {
        color: 'white', // change as needed
      },
      
    },
    color:"white"}} variant="outlined">
         <InputLabel htmlFor="outlined-adornment-password">Enter Password</InputLabel>
  <OutlinedInput
    id="outlined-adornment-password"
    type={showPassword ? 'text' : 'password'}
    endAdornment={
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
          style={{color:"white"}}
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
                </div>
                <div className='set-password-main-input'>

                <FormControl sx={{ m: 1, width: '100%', backdropFilter:'blur(60px)',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'white', // Replace 'color' with your desired color
      },
      '&:hover fieldset': {
        borderColor: 'orange', // Hover state border color
      },
      '&.Mui-focused fieldset': {
        borderColor: 'white',
      },
      '& input': {
        color: 'white', // Text color
      },
    },
    '& .MuiInputLabel-root': {
        color:"white",
      '&.Mui-focused': {
        color: 'white', // change as needed
      },
      
    },
    color:"white"}} variant="outlined">
         <InputLabel htmlFor="outlined-adornment-password">Re Enter Password</InputLabel>
  <OutlinedInput
    id="outlined-adornment-password"
    type={showPassword ? 'text' : 'password'}
    endAdornment={
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={handleClickShowPassword}
          onMouseDown={handleMouseDownPassword}
          edge="end"
          style={{color:"white"}}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    }
    label="Re-enter Password"
    value={rePassword}
    onChange={(e) => {
      setRePassword(e.target.value);
    }}
  />
          </FormControl>
                </div>
                <button style={{color:"white"}} onClick={() => {
                type === "password" ? setType("text") : setType("password");
            }}>Show</button>
            </div>
            <button className="set-password-btn" onClick={handlePasswordSubmit}>Submit</button>
        </div>
    );
}

export default ClientPassword;