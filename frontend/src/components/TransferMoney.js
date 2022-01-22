import * as React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
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
    <div>
        <h1>Money transfering</h1>
      <ToggleButtonGroup
        color="primary"
        value={choice}
        exclusive
        onChange={handleChange}
        
        >
        <ToggleButton style={{background: "white"}} value="Send to user">Send to user</ToggleButton>
        <ToggleButton style={{background: "white"}} value="Send to bank account">Send to bank account</ToggleButton>
        </ToggleButtonGroup>
        { choice == "Send to user" ?
            <TransferMoneyToUser/>
            :
            <TransferMoneyToBankAcc/>
        }
    </div>
  );
}