import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";
import { useAuth, logout } from "../auth";
import { NavLink, useNavigate } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const [logged_in] = useAuth();
  const active = localStorage.getItem("active")

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          <NavLink to="/home">Home</NavLink>
        </Typography>
        { logged_in ? 
            (!active ?
            <>
              <Typography variant="h6" className={classes.title}>
                <NavLink to="/activate">Activate</NavLink>
              </Typography>
            </>
            :
            <>
            <Typography variant="h6" className={classes.title}>
              <NavLink to="/deposit">Deposite money</NavLink>
            </Typography>
            </>
            )
            : <></>
        }
          
        {!logged_in ? 
        <>
          <Button>
            <NavLink to="/login">Login</NavLink>
          </Button>
          <Button>
            <NavLink to="/register">Register</NavLink>
          </Button>
        </> : 
        <>
          <Button>
            <NavLink to="/user/accounts">My account</NavLink>
          </Button>
          <Button>
            <NavLink to="/logout">Logout</NavLink>
          </Button>
        </>
        }
        
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
