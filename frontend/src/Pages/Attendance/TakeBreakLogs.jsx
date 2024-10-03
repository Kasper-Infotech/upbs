import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import Moment from "moment";
import BASE_URL from "../config/config";
import toast from "react-hot-toast";
import { FaComputerMouse } from "react-icons/fa6";
import { PiCoffeeFill } from "react-icons/pi";
import { AttendanceContext } from "../../Context/AttendanceContext/AttendanceContext";
import { useSelector } from "react-redux";

function TakeBreakLogs(props) {
  const [todayData, setTodayData] = useState(null);
  const { userData} = useSelector((state)=> state.user);
  const id = userData?._id;
  const { setMessage } = useContext(AttendanceContext);

  const loadPersonalInfoData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/attendances/` + id, {
        headers: {
          authorization: localStorage.getItem("token") || "",
        },
      });
      setTodayData(response.data);
    } catch (error) {
      console.error("Error fetching personal info:", error);
    }
  };

  useEffect(() => {
    loadPersonalInfoData();
  }, [props.data]);

  const handleAction = async (action) => {
    console.log(action);

    const attendanceID = todayData.attendanceID;

    const currentTime = Moment().format("HH:mm:ss");
    const currentTimeMs = Math.round(new Date().getTime() / 1000 / 60);
    console.log(attendanceID);
    try {
      const statusMapping = {
        login: {
          status: "login",
          loginTime: [currentTime],
        },
        logout: {
          status: "logout",
          logoutTime: [currentTime],
        },
        break: {
          status: "break",
          breakTime: [currentTime],
          breakTimeMs: [currentTimeMs],
        },
        resume: {
          status: "login",
          ResumeTime: [currentTime],
          resumeTimeMS: [currentTimeMs],
        },
      };

      await axios.post(`${BASE_URL}/api/attendance/${attendanceID}`, {
        employeeId: id,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().getDate(),
        ...statusMapping[action],
      });

      setMessage(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } time recorded successfully`
      );
      toast.success(
        `${
          action.charAt(0).toUpperCase() + action.slice(1)
        } time recorded successfully`
      );

      loadPersonalInfoData();
    } catch (error) {
      setMessage(`Error recording ${action} time`);
      toast.error(`Error recording ${action} time`);
    }
  };

  return (
    <div className="App row gap-2">
      <div style={{ alignItems: "center" }} className="d-flex gap-2">
        {todayData && todayData?.today?.status === "break" ? (
          <button
            className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleAction("resume")}
          >
            <FaComputerMouse className="my-auto fs-5" /> Break Over
          </button>
        ) : (
          <button
            className="btn btn-warning d-flex align-items-center justify-content-center gap-2"
            onClick={() => handleAction("break")}
          >
            <PiCoffeeFill className="my-auto fs-5" /> Take a Break
          </button>
        )}
      </div>
    </div>
  );
}

export default TakeBreakLogs;
