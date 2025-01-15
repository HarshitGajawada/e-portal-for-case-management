import React from 'react';
import './set-password.css';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const SetPassword = () => { 

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

            const res = await axios.put("http://localhost:64000/judge-register/set-password-judge?token="+token,{password});
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
                <div className='set-password-main-input'>
                    <input type={type} placeholder="Enter Password" className="set-password-input" onChange={(e) => setPassword(e.target.value)}/>
                </div>
                <div className='set-password-main-input'>
                    <input type={type} placeholder="Re-enter Password" className="set-password-input" onChange={(e) => setRePassword(e.target.value)}/>
                </div>
                <button style={{color:"white"}} onClick={() => {
                type === "password" ? setType("text") : setType("password");
            }}>Show</button>
            </div>
            <button className="set-password-btn" onClick={handlePasswordSubmit}>Submit</button>
        </div>
    );
}

export default SetPassword;