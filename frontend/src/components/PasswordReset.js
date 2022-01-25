import React from 'react';
import { useForm } from 'react-hook-form';

export default function ResetPassword() {
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => {
      console.log(data);
      if(data.password != data.confirm_password){
          alert("Passwords must match.")
          return;
      }
      const requestOptions = {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
      };
  
      fetch("http://localhost:5000/user/reset-password", requestOptions)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert(data.msg);
          }
          if(data.msg){
            alert(data.msg);
            window.location.href = "/user/profile";
          }
        })
        .catch((err) => console.log(err));

  }
  console.log(errors);
  
  return (
    <div className="App">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
        <input type="password" placeholder="Old password" {...register("old_password", {required: true})} />
        <input type="password" placeholder="Password" {...register("password", {required: true, min: 8})} />
        <input type="password" placeholder="Confirm password" {...register("confirm_password", {required: true, min: 8})} />

        <input type="submit" value='Reset' />
        </form>
    </div>
  );
}