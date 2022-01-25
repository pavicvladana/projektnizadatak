import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import "../index.css";

function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const [logged_in] = useAuth();

  useEffect(() => {
    if(logged_in){
      navigate("/home")
    }
  });

  const onSubmit = (data) => {
    // alert(JSON.stringify(data));

    const body = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstname: data.firstname,
      lastname: data.lastname,
      address: data.address,
      city: data.city,
      country: data.country,
      phone: data.phone,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };

    fetch("http://localhost:5000/register", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.msg);
        }
        if(data.msg){
          window.location.href = "/login";
        }
      })
      .catch((err) => console.log(err));

    
  };

  return (
    <div className="App">
      <br />
      <br />
      <form onSubmit={handleSubmit(onSubmit)}>
      <input
          type="text"
          placeholder="Username"
          {...register("username", { required: true })}
        />
        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
        />
        <input
          type="text"
          placeholder="First name"
          {...register("firstname", { required: true, maxLength: 80 })}
        />
        <input
          type="text"
          placeholder="Last name"
          {...register("lastname", { required: true, maxLength: 100 })}
        />
        <input
          type="text"
          placeholder="Phone number"
          {...register("phone", { required: true, maxLength: 12 })}
        />
        <input
          type="password"
          placeholder="password"
          {...register("password", { required: true })}
        />
        <input
          type="text"
          placeholder="Address"
          {...register("address", { required: true })}
        />
        <input
          type="text"
          placeholder="City"
          {...register("city", { required: true })}
        />
        <input
          type="text"
          placeholder="Country"
          {...register("country", { required: true })}
        />
        

        <input type="submit"  value='Register' />
      </form>
    </div>
  );
}

export default Register;
