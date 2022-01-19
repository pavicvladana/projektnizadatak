import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

export default function Activate() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const navigate = useNavigate();
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  const active = localStorage.getItem("active")
  if(active){
    navigate("/home");
  }
  const onSubmit = data => {
    const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
      };
  
      fetch("http://localhost:5000/user/activate", requestOptions)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.msg);
          }
          if(data.msg){
            localStorage.setItem("active", true)
            navigate("/home");
          }
        })
        .catch((err) => console.log(err));
  };
  console.log(errors);
  
  return (
    <>
     <h1>Enter your credit card</h1>
     <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="Credit card number" {...register("cc_number", {required: true, pattern: /[0-9]{16}/i})} />
      <input type="text" placeholder="Name" {...register("name", {required: true})} />
      <input type="text" placeholder="Expire date" {...register("exp_date", {required: true, min: 5, maxLength: 5, pattern: /[0-9]{2}[/][0-9]{2}/i})} />
      <input type="text" placeholder="Secure code" {...register("password", {required: true, pattern: /[0-9]+/i})} />

      <input type="submit" value="activate"/>
    </form>
    </>
  );
}