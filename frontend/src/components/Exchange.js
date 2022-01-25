import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from "react-router-dom";

export default function Exchange() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [currencyList, setCurrencyList] = useState({});
  const [currency, setCurrency] = useState('RSD')
  const [cost, setCost] = useState()
  const [amount, setAmount] = useState()
  const navigate = useNavigate()
  useEffect(() => {
      
    const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
        },
    };

    fetch("http://localhost:5000/exchange", requestOptions)
    .then((res) => res.json())
    .then((data) => {
        console.log(data)
        if(data.msg){
            if(data.msg === 'Token has expired'){
                navigate('/logout')
            }
        }
        setCurrencyList(data)        
    })
    .catch((err) => console.log(err));
  }, [])

  const onSubmit = data => {
    const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    data.amount = parseFloat(data.amount) 
    if(isNaN(data.amount)){
        alert("Please enter number for amount.")
        return;
    }
    data.currency = currency
    console.log(data)
    const requestOptions = {
        method: "POST",
        headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${JSON.parse(token)}`,
        },
        body: JSON.stringify(data),
        };
        
        fetch("http://localhost:5000/exchange", requestOptions)
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
  //console.log(errors);

  const handleChange = (event) => {
    let curr = event.target.value
    setCurrency(curr);
    setCost((amount / currencyList[curr]).toFixed(2));
  };

  const onAmountChange = (value) => {
    let amount = parseFloat(value)
    if(amount != NaN){
        setAmount(amount)
        setCost((amount / currencyList[currency]).toFixed(2));
    }
  };

  return (
      <>
        <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="cc_number">Credit card number</label>
        <input type="text" placeholder="Credit card number" {...register("cc_number", {required: true, pattern: /[0-9]{16}/i})} />
        <label htmlFor="name">Name</label>
        <input type="text" placeholder="Name" {...register("name", {required: true})} />
        <label htmlFor="exp_date">Expire date</label>
        <input type="text" placeholder="Expire date" {...register("exp_date", {required: true, min: 5, maxLength: 5, pattern: /[0-9]{2}[/][0-9]{2}/i})} />
        <label htmlFor="password">Secure code</label>
        <input type="text" placeholder="Secure code" {...register("password", {required: true, pattern: /[0-9]+/i})} />
        <label htmlFor="currency">Currency</label>
        <Select
                labelId="demo-simple-select-label"
                id="currency"
                value={currency}
                //label="Account"
                style={{background: 'white', width:'100%'}}
                onChange={handleChange}
            >
                {
                    Object.keys(currencyList).map(key => 
                        <MenuItem key={key} value={key}>
                                    {key}
                        </MenuItem>
                    )
                }
        </Select>
        <br></br>
        <label htmlFor="amount">Amount</label>
        <input type="text" placeholder="Amount" {...register("amount", {required: true, min: 1})}  onChange={e => onAmountChange(e.target.value)} autoComplete="off"/>
        {!isNaN(cost) && cost ? <h3>This will cost you: {cost} {"RSD"}</h3> : <></>}
        <input type="submit" value='Exchange'/>
        </form>
      </>
    
  );
}