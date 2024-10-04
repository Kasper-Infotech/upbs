import React, { useState, useEffect, useContext } from "react";
import { HashRouter as Router, Route, Redirect, Switch,useHistory  } from "react-router-dom";
import axios from "axios";
import jwt from "jsonwebtoken";

import "./App.css"
import Login from "./Pages/Login/Login.jsx";
import DashboardAdmin from "./Component/Admin/DashboardAdmin.jsx";
import DashboardHR from "./Component/HrManager/DashboardHR.jsx";
import DashboardEmployee from "./Component/Employee/DashboardEmployee.jsx";
import ManagerDashboard from "./Component/Manager/ManagerDashboard.jsx";
import ForgetPass from "./Pages/ForgotPass/ForgetPass.jsx";
import BASE_URL from "./Pages/config/config.js";
import Moment from "moment";
import { AttendanceContext } from "./Context/AttendanceContext/AttendanceContext.js";
import { toast } from "react-hot-toast";
import {loginUser,attendanceInfo} from "./redux/slices/loginSlice.js";
import { useSelector, useDispatch } from "react-redux";
import { persistStore } from 'redux-persist';
import {store} from "./redux/store.js"


const App = () => {
  const history = useHistory();
 

  const persistor = persistStore(store);
  const dispatch = useDispatch();
  const { loginInfo,
    loginError,
    attednaceInfo,
    attednaceError} = useSelector((state)=> state.login);
    const { userData} = useSelector((state)=> state.user);

  const { socket, isLogin,setIsLogin} = useContext(AttendanceContext);




  useEffect(() => {
    if (attednaceInfo && attednaceError === "") {
     toast.success(attednaceInfo)   
    } else if (attednaceError !== "") {
      toast.error(attednaceError)
    }
  }, [attednaceInfo, attednaceError]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const bodyLogin = {
          email: event.target[0].value,
          password: event.target[1].value
        };
        dispatch(loginUser(bodyLogin))
  
  
    event.target.reset();
  };



  const handleLogout = async () => {
    try {
      dispatch(attendanceInfo({ employeeId: userData._id, status: "logout" }));
      
      localStorage.clear();
      await persistor.purge();
      dispatch({ type: 'RESET_APP' }); // Dispatch a reset action to clear store state
      setIsLogin(false);
      history.push("#/login");
      
      if (userData) {
        socket.emit("logoutUser", {
          manager: userData.reportHr || userData.reportManager,
          user: userData.Email
        });
  
        if (!userData.Email) {
          alert("Please select an employee");
          return;
        }
  
        alert("Logout time recorded successfully");
  
        // Refresh the page after logout
        window.location.reload(); 
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  




  return (

            <Switch>
      <Route
        exact
        path="/login"
        render={() =>
       {
        if (userData?.Account === 1) return <Redirect to="/admin/dashboard" />;
        if (userData?.Account === 2) return <Redirect to="/hr/dashboard" />;
        if (userData?.Account === 3) return <Redirect to="/employee/dashboard" />;
        if (userData?.Account === 4) return <Redirect to="/manager/dashboard" />;
        return <Login onSubmit={handleSubmit}  />;
       }
        }
      />
           <Route path="/admin" render={() => (
          userData?.Account === 1
            ? <DashboardAdmin data={userData} onLogout={handleLogout} />
            : <Redirect to="/login" />
        )} />

        <Route path="/hr" render={() => (
          userData?.Account === 2
            ? <DashboardHR data={userData} onLogout={handleLogout} />
            : <Redirect to="/login" />
        )} />

        <Route path="/employee" render={() => (
          userData?.Account === 3
            ? <DashboardEmployee data={userData} onLogout={handleLogout} />
            : <Redirect to="/login" />
        )} />

        <Route path="/manager" render={() => (
          userData?.Account === 4
            ? <ManagerDashboard data={userData} onLogout={handleLogout} />
            : <Redirect to="/login" />
        )} />

        <Route path="/forgetPassword" exact component={ForgetPass} />
        <Route path="/" render={() => <Redirect to="/login" />} />
      {/* <Route path="/" render={() => <Redirect to="/login" />} /> */}
      <Route render={() => <Redirect to="/login" />} />
      </Switch>
    
  );
};

export default App;

