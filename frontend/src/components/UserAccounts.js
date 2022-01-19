import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { randomInt, randomUserName } from '@mui/x-data-grid-generator';
import Box from '@mui/material/Box';

const columns = [
  { field: 'currency' },
  { field: 'id' , width: 150},
  { field: 'balance', width: 80, type: 'number' },
];

let idCounter = 0;
const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
const createRandomRow = () => {
  idCounter += 1;
  return { id: idCounter, username: randomUserName(), age: randomInt(10, 80) };
};

export default function UserAccounts() {
    const [rows, setRows] = React.useState([]);
    React.useEffect(() => {
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
            setRows(data.accounts);
        })
        .catch((err) => console.log(err));
    }, [])

    
  return (
    <div style={{ width: '100%'}}>
      <Box sx={{ height: 700, bgcolor: 'background.paper' }}>
        <DataGrid hideFooter rows={rows} columns={columns} />
      </Box>
    </div>
  );
}