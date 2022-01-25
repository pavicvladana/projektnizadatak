import * as React from 'react';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
  
const columns = [
  { field: 'id' , width: 150},
  { field: 'currency', width: 150 },
  { field: 'amount', width: 80, type: 'number' },
  { field: 'payer' , width: 150},
  { field: 'receiver' , width: 150},
  { field: 'state' , width: 150},
];

export default function EnhancedTable() {
  
  const [rows, setRows] = React.useState([])

  React.useEffect(() => {
    const token = localStorage.getItem("REACT_TOKEN_AUTH_KEY");
    const requestOptions = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${JSON.parse(token)}`,
        },
    };

    fetch("http://localhost:5000/user/transactions", requestOptions)
    .then((res) => res.json())
    .then((data) => {
        console.log(data)
        let transactions = data.trans_as_payer.concat(data.trans_as_receiver)
        setRows(transactions);
    })
    .catch((err) => console.log(err));
  }, [])

  return (
    <div style={{ width: '100%'}}>
      <Box sx={{ width: '100%',height: 12*52, bgcolor: 'background.paper' }}>
        <DataGrid hideFooter rows={rows} columns={columns} />
      </Box>
    </div>
  );
}
