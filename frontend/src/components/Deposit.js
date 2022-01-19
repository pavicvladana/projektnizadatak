import React from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';

export default function Deposit() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const navigate = useNavigate();
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  const onSubmit = data => {
      data.amount = parseFloat(data.amount) 
      console.log(data)
    const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
      };
  
      fetch("http://localhost:5000/user/deposit", requestOptions)
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
          if (data.error) {
            alert(data.error);
          }
          if(data.msg){
            alert(data.msg)
            navigate("/user/accounts");
          }
        })
        .catch((err) => console.log(err));
  };
  console.log(errors);
  
  return (
      <div>
        <h1>Deposit money on your account</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
        <input type="text" placeholder="Credit card number" {...register("cc_number", {required: true, pattern: /[0-9]{16}/i})} />
        <input type="text" placeholder="Name" {...register("name", {required: true})} />
        <input type="text" placeholder="Expire date" {...register("exp_date", {required: true, min: 5, maxLength: 5, pattern: /[0-9]{2}[/][0-9]{2}/i})} />
        <input type="text" placeholder="Secure code" {...register("password", {required: true, pattern: /[0-9]+/i})} />
        <input type="text" placeholder="Amount" {...register("amount", {required: true, maxLength: 10, pattern: /d*\.?\d*/i})} />

        <input type="submit" />
        </form>
      </div>
  );
}