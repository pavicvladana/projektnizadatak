import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';


export default function TransferMoneyToUser() {
    const [account, setAccount] = React.useState('');
    const [accounts, setAccounts] = React.useState([]);
    const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    const active = localStorage.getItem("active");
    const navigate = useNavigate();

    React.useEffect(() =>{
        if(!active){
            navigate("/activate")
        }
        const requestOptions = {
            method: "GET",
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
            },
        };

        fetch("http://localhost:5000/user/state", requestOptions)
        .then((res) => res.json())
        .then((data) => {
            console.log(data)
            setAccounts(data.accounts);
        })
        .catch((err) => console.log(err));
    }, [])

    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = data => {
        data.amount = parseFloat(data.amount)
        if(data.amount == NaN){
            alert("Please enter valid numbre")
            return;
        }
        data.acc_id = account.id
        const requestOptions = {
            method: "POST",
            headers: {
              "content-type": "application/json",
              Authorization: `Bearer ${JSON.parse(token)}`,
            },
            body: JSON.stringify(data),
          };
          console.log(data)
      
          fetch("http://localhost:5000/user/send-to-user", requestOptions)
            .then((res) => res.json())
            .then((data) => {
                console.log(data)
              if (data.error) {
                alert(data.error);
              }
              if(data.msg){
                alert(data.msg)
                navigate("/user/transactions");
              }
            })
            .catch((err) => console.log(err));
    };

    const handleChange = (event) => {
      setAccount(event.target.value);
    };
  
    return (
        <>
         <h1>Transfer money to user.</h1>
         <br></br>         
         <Stack direction="row" spacing={2}>
            <Box sx={{ minWidth: 250 }}>
                    <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Account</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={account}
                        label="Account"
                        style={{background: 'white'}}
                        onChange={handleChange}
                    >
                        {
                            accounts.map((acc, i) => {
                                return(
                                <MenuItem key={i} value={acc}>
                                 {acc.currency} - {acc.id}
                                </MenuItem>
                            )})
                        }
                    </Select>
                    </FormControl>
            </Box>
            {account ? <h3 style={{marginTop: 'auto', marginBottom: 'auto'}}>Balance: {account.balance} {account.currency}</h3> : <></>}
         </Stack>
         {account ?
            <form onSubmit={handleSubmit(onSubmit)}>
                <input type="text" placeholder="Amount" {...register("amount", {required: true, min: 1})} />
                <input type="email" placeholder="To" {...register("to", {required: true})} />

                <input type="submit" value="Send" />
            </form>     
            :
            <></>
         }
      </>
      
    );
  }