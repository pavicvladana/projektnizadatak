import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {logout, useAuth} from "../auth"

function Login() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token")
    const [logged_in] = useAuth();
    const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      };
    if(logged_in){
        fetch("http://localhost:5000/logout", requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if(data.error){
                    alert(data.error);
                }
            })
            .catch((err) => console.log(err));
            
        localStorage.removeItem("active")
        logout()
        
    }
    navigate("/login");
  

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();


  

  

  return (
    <div className="App">
      
    </div>
  );
}

export default Login;
