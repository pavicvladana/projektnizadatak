import React, { useState, useEffect } from "react";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import "../index.css";

function User() {
  const { register, handleSubmit } = useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState();
  const navigate = useNavigate();
  
  const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");

  function setEditingState(newState){
    setIsEditing(newState);
    getUserData()
  }
  const [logged_in] = useAuth();

  useEffect(() => {
    getUserData()
  }, []);

  function getUserData(){
    const requestOptions = {
      method: "GET",
      headers: {
          Authorization: `Bearer ${JSON.parse(token)}`,
      },
    };

    fetch("http://localhost:5000/user", requestOptions)
    .then((res) => res.json())
    .then((data) => {
        setUser(data);
        console.log(data)
    })
    .catch((err) => console.log(err));
  }

  const onSubmit = (data) => {
    // alert(JSON.stringify(data));
   
    
    console.log(user)

    const requestOptions = {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${JSON.parse(token)}`,
      },
      body: JSON.stringify(data),
    };

    fetch("http://localhost:5000/user", requestOptions)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        }
        if(data.msg){
          //alert(data.msg);
          setEditingState(false)
        }
      })
      .catch((err) => console.log(err));

    
  };

  return (
      <Stack className="center">
        <h1>User profile</h1>
        { isEditing == false ?
            <div>
                <h3>Username : {user? user.username : ""}</h3>
                <h3>Email : {user? user.email : ""}</h3>
                <h3>First name : {user? user.firstname : ""}</h3>
                <h3>Last name : {user? user.lastname : ""}</h3>
                <h3>City : {user? user.city : ""}</h3>
                <h3>Adress : {user? user.address : ""}</h3>
                <h3>Country : {user? user.country : ""}</h3>
                <h3>Phone : {user? user.phone : ""}</h3>
                <Button variant="outlined" onClick={() => { setEditingState(true) }}>Edit profile</Button>
                <Button variant="outlined" onClick={() => { navigate('/user/resetpassword')}}>Change password</Button>
            </div>
            :
            <div >
                <br />
                <br />
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label htmlFor="firstname">First name</label>
                    <input
                        type="text"
                        placeholder="First name"
                        defaultValue={user? user.firstname:""}
                        {...register("firstname", { required: true, maxLength: 80 })}
                        />
                    <label htmlFor="lastname">Last name</label>
                    <input
                        type="text"
                        placeholder="Last name"
                        defaultValue={user? user.lastname:""}
                        {...register("lastname", { required: true, maxLength: 100 })}
                        />
                    <label htmlFor="city">City</label>
                    <input
                        type="text"
                        placeholder="City"
                        defaultValue={user? user.city:""}
                        {...register("city", { required: true })}
                        />
                    <label htmlFor="address">Address</label>
                    <input
                        type="text"
                        placeholder="Address"
                        defaultValue={user? user.address:""}
                        {...register("address", { required: true })}
                        />
                    <label htmlFor="country">Country</label>
                    <input
                        type="text"
                        placeholder="Country"
                        defaultValue={user? user.country:""}
                        {...register("country", { required: true })}
                        />
                    <label htmlFor="phone">Phone</label>
                    <input
                        type="text"
                        placeholder="Phone number"
                        defaultValue={user? user.phone:""}
                        {...register("phone", { required: true, maxLength: 12 })}
                        />
                    <input type="submit" value='Change' />
                </form>
            </div>
        }
    </Stack>
  );
}

export default User;
