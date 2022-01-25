import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import Stack from '@mui/material/Stack';
import Box from "@material-ui/core/Box";
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { makeStyles } from "@material-ui/core/styles";
import TransferMoneyToUser from "./TransferMoneyToUser"
import TransferMoneyToBankAcc from "./TransferMoneyToBankAcc"

const useStyles = makeStyles((theme) => ({
    root: (props) => {
      return {
        color: 'white'
        // some other custom styles
      };
    }
  }));

export default function ColorToggleButton() {
  const [choice, setChoice] = React.useState('web');

  const handleChange = (event, newChoice) => {
    setChoice(newChoice);
  };

  return (
    <Stack
    >
      <h1>Money transfering</h1>
      <Box textAlign='center'>
        <ToggleButtonGroup
          color="primary"
          value={choice}
          exclusive
          onChange={handleChange}
          
          >
          <ToggleButton style={{background: "white", width:'100%'}} value="Send to user">Send to user</ToggleButton>
          <ToggleButton style={{background: "white", width:'100%'}} value="Send to bank account">Send to bank account</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box>
        { choice == "Send to user" ?
            <TransferMoneyToUser/>
            :
            <TransferMoneyToBankAcc/>
        }
      </Box>
    </Stack>
  );
}