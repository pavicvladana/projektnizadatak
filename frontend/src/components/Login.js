import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { login, useAuth } from "../auth";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [logged_in] = useAuth();

  useEffect(() => {
    if(logged_in){
      navigate("/home")
    }
  });

  const onSubmit = (data) => {
    const body = {
      email: data.email,
      password: data.password,
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };

    fetch("http://localhost:5000/login", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if(data.error){
            alert(data.error);
          }else{
            login(data.access_token)
            localStorage.setItem("active", data.active)
            console.log(data)
            navigate("/home");
          }
        }
      })
      .catch((err) => console.log(err));

    
  };
  console.log(errors);

  return (
    <div className="App">
      <form onSubmit={handleSubmit(onSubmit)}>
        <br />
        <br />

        <input
          type="email"
          placeholder="email"
          {...register("email", { required: true })}
        />
        <input
          type="password"
          placeholder="password"
          {...register("password", { required: true })}
        />

        <input type="submit" />
      </form>
    </div>
  );
}

export default Login;
