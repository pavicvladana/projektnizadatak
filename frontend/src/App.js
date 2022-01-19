import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home"
import Logout from "./components/Logout"
import Activate from "./components/Activate"
import Deposit from "./components/Deposit"
import UserAccounts from "./components/UserAccounts"

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <Navbar></Navbar>
        <Routes>
          <Route exact path="/login" element={<Login />}></Route>
          <Route exact path="/register" element={<Register />}></Route>
          <Route exact path="/home" element={<Home />}></Route>
          <Route exact path="/logout" element={<Logout />}></Route>
          <Route exact path="/activate" element={<Activate />}></Route>
          <Route exact path="/deposit" element={<Deposit />}></Route>
          <Route exact path="/user/accounts" element={<UserAccounts />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
