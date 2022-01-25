import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import {useAuth} from "../auth"

function Home() {
  const navigate = useNavigate();

  const [logged_in] = useAuth();

  if(!logged_in){
    navigate("/login")
  }

  return (
      <div>
          <h1>Welcome to E banking service.</h1>
      </div>
  )
}

export default Home;