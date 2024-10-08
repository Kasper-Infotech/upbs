
import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import "./LeaveApplicationEmpForm.css";
import TittleHeader from "../../../Pages/TittleHeader/TittleHeader";
import BASE_URL from "../../../Pages/config/config";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../../Context/TheamContext/ThemeContext";
import { useSelector } from "react-redux";

const LeaveApplicationEmpForm = (props) => {
const { userData} = useSelector((state)=> state.user);

const id = userData?._id;
  const [empData, setEmpData] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState([]);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [leaveType, setLeaveType] = useState("");
  const [leaveCount, setLeaveCount] = useState([]);
  const [leaveDuration, setLeaveDuration] = useState(""); // Full day or half day
  const [halfDayType, setHalfDayType] = useState(""); // First half or second half
  const [addManager, setAddManager] = useState(""); // Additional manager
  const [additionalManagerList, setAdditionalManagerList] = useState([]); // List of additional managers
  const email = userData?.Email;

  const location = useLocation();
  const { darkMode } = useTheme();
  const status = location.pathname.split("/")[1];

  // Load employee data
  const loadEmployeeData = () => {
    axios
      .get(`${BASE_URL}/api/particularEmployee/${id}`, {
        headers: {
          authorization: localStorage.getItem("token") || "",
        },
      })
      .then((response) => {
        setEmpData(response.data);
      })
      .catch((error) => {
        console.error("Error loading employee data", error);
      });
  };

  // Load leave balance data
  const loadLeaveBalance = () => {
    axios
      .post(`${BASE_URL}/api/particularLeave`, { id })
      .then((response) => {
        setLeaveBalance(response.data);
        
      })
      .catch((error) => {
        console.error("Error loading leave balance", error);
      });
  };

  // Load additional managers
  const loadManagersData = () => {
    axios
      .post(`${BASE_URL}/api/managersList`, { status, email })
      .then((response) => {
        setAdditionalManagerList(response.data);
      })
      .catch((error) => {
        console.error("Error loading additional managers", error);
      });
  };

  useEffect(() => {
    loadEmployeeData();
    loadLeaveBalance();
    loadManagersData();
  }, []);

  const handleInputChange = (e) => {
 
    if(e.target.value==="unPaid Leave"){
      setLeaveCount(365);
      setLeaveType(e.target.value);
      return;
    }
    setLeaveCount(leaveBalance[0][e.target.value]);
    setLeaveType(e.target.value);
  };

  const handleDurationChange = (e) => {
    setLeaveDuration(e.target.value);
  
    if (e.target.value === "Full Day") {
      setFormData((prev) => ({
        ...prev,
        endDate: formData.startDate, // Make endDate same as startDate for full day
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        endDate: "", // Clear endDate for half-day leave
      }));
    }
  };

  const handleHalfDayTypeChange = (e) => {
    setHalfDayType(e.target.value);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const differenceCalculator = (e) => {
    if (leaveDuration === "Half Day") return; // Skip calculation if half-day leave
if(leaveType==="unPaid Leave"){
  setFormData((prev) => ({ ...prev, endDate: e.target.value }));
  return; 
}
    let requiredLeave = dateDifference(formData.startDate, e.target.value);

    if (leaveCount < requiredLeave + 1) {
      alert("Leave balance is low");
      return;
    }
    setFormData((prev) => ({ ...prev, endDate: e.target.value }));
  };

  function dateDifference(date1, date2) {
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    if (secondDate < firstDate) {
      alert("Please select proper date");
      return;
    }
    const differenceInTime = secondDate.getTime() - firstDate.getTime();
    const differenceInDays = differenceInTime / (1000 * 3600 * 24);
    return Math.abs(differenceInDays);
  }

  const deductLeave = (e) => {
    e.preventDefault();
    if(leaveType === "unPaid Leave"){
      const requiredLeave = leaveDuration === "Half Day" ? 0.5 : dateDifference(formData.startDate, formData.endDate); 
    props.onLeaveApplicationEmpSubmit(e,requiredLeave)
       return;
    }
    const requiredLeave = leaveDuration === "Half Day" ? 0.5 : dateDifference(formData.startDate, formData.endDate); // Half day leave
    if (leaveCount < requiredLeave) {
      alert("Leave balance is low");
      return;
    }
    props.onLeaveApplicationEmpSubmit(e,requiredLeave)
   
  };

  return (
<>
{empData?    <div
    style={{
      color: darkMode
        ? "var(--primaryDashColorDark)"
        : "var(--secondaryDashMenuColor)",
    }}
    className="container-fluid py2"
  >
    {leaveBalance.length===0 ? (
      <h1>No leave found</h1>
    ) : (
      <div>
        <TittleHeader
          title={"Create Leave "}
          message={"You can create a new leave request here."}
        />
        <form
          className="py-4 rounded row"
          onSubmit={(e) => (
            deductLeave(e)
          )}
        >
          <div className="mb-3 col-12">
            <label htmlFor="leaveType" className="form-label">
              Select Leave Type
            </label>
            <select
              className="form-select rounded-0"
              id="leaveType"
              name="leaveType"
              value={leaveType}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled selected>
                -- Select --
              </option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Paid Leave">Paid Leave</option>
              <option value="unPaid Leave">unPaid Leave</option>
              {empData.Gender === "male" ? (
                <option value="Paternity Leave">Paternity Leave</option>
              ) : (
                <option value="Maternity Leave">Maternity Leave</option>
              )}
            </select>
          </div>

          <div className="mb-3 col-12">
            <label htmlFor="leaveCount" className="form-label">
              Available {leaveType}
            </label>
            <input
              className="form-select rounded-0"
              id="leaveCount"
              name="leaveCount"
              value={leaveCount}
              readOnly
              placeholder="Please select a leave type"
            />
          </div>

          {leaveCount > 0 && (
            <>
              <div className="mb-3 col-12">
                <label htmlFor="leaveDuration" className="form-label">
                  Leave Duration
                </label>
                <select
                  className="form-select rounded-0"
                  id="leaveDuration"
                  name="leaveDuration"
                  value={leaveDuration}
                  onChange={handleDurationChange}
                  required
                >
                  <option value="" disabled selected>
                    -- Select --
                  </option>
                  <option value="Full Day">Full Day</option>
                  <option value="Half Day">Half Day</option>
                </select>
              </div>

              {leaveDuration === "Half Day" && (
                <div className="mb-3 col-12">
                  <label htmlFor="halfDayType" className="form-label">
                    Select Half
                  </label>
                  <select
                    className="form-select rounded-0"
                    id="halfDayType"
                    name="halfDayType"
                    value={halfDayType}
                    onChange={handleHalfDayTypeChange}
                    required
                  >
                    <option value="" disabled selected>
                      -- Select --
                    </option>
                    <option value="First Half">First Half</option>
                    <option value="Second Half">Second Half</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div className="mb-3 col-6">
            <label htmlFor="startDate" className="form-label">
              Start Date:
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="mb-3 col-6">
            <label htmlFor="endDate" className="form-label">
              End Date:
            </label>
            <input
              type="date"
              className="form-control rounded-0"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={differenceCalculator}
              disabled={leaveDuration === "Half Day"} // Disable for half-day leave
              required={leaveDuration === "Full Day"}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="manager" className="form-label">
              Reporting Manager:
            </label>
            <input
              className="form-control rounded-0"
              id="manager"
              name="manager"
              value={empData.reportManager}
              disabled
              placeholder={empData.reportManager}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="hr" className="form-label">
              Reporting HR:
            </label>
            <input
              className="form-control rounded-0"
              id="hr"
              name="hr"
              value={empData.reportHr}
              disabled
              placeholder={empData.reportHr}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="additionalManager" className="form-label">
              Additional Manager:
            </label>
            <select
              className="form-select rounded-0"
              id="additionalManager"
              name="additionalManager"
              value={addManager}
              onChange={(e) => setAddManager(e.target.value)}
            >
              <option value="" disabled selected>
                -- Select --
              </option>
              {additionalManagerList.map((val) => (
                <option key={val.Email} value={val.Email}>
                  {val.Email}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="reason" className="form-label">
              Reason:
            </label>
            <textarea
              className="form-control rounded-0"
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleFormChange}
              required
              placeholder="Please mention the reason for leave"
            />
          </div>

          <div className="d-flex align-items-center gap-3">
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="reset"
              className="btn btn-danger"
              onClick={props.onFormClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}
  </div> :<></>}</>
 

 
  );
};

export default LeaveApplicationEmpForm;




// import React, { useState, useEffect } from "react";
// import { Form, Button, Col } from "react-bootstrap";
// import axios from "axios";
// import "./LeaveApplicationEmpForm.css";
// import LeaveImg from "./Leave.svg";
// import InnerDashContainer from "../../InnerDashContainer";
// import BASE_URL from "../../../Pages/config/config";
// import { useLocation } from "react-router-dom";
// import { useTheme } from "../../../Context/TheamContext/ThemeContext";
// import TittleHeader from "../../../Pages/TittleHeader/TittleHeader";
// const LeaveApplicationEmpForm = (props) => {
//   const id = localStorage.getItem("_id");
//   const [empData, setEmpData] = useState([]);
//   const [leaveBalance, setLeaveBalance] = useState(null);
//   const [formData, setFormData] = useState({
//     startDate: "",
//     endDate: "",
//   });
//   const [leaveType, setLeaveType] = useState("");
//   const [addManager, setAddManager] = useState("");
//   const [leaveCount, setLeaveCount] = useState(null);
//   const [aditionalManager, setAditionalManager] = useState([]);
//   const email = localStorage.getItem("Email");
//   const location = useLocation();
//   const { darkMode } = useTheme();

//   const status = location.pathname.split("/")[1];

//   const loadEmployeeData = () => {
//     axios
//       .get(`${BASE_URL}/api/particularEmployee/${id}`, {
//         headers: {
//           authorization: localStorage.getItem("token") || "",
//         },
//       })
//       .then((response) => {
          
//         setEmpData(response.data);
//       })
//       .catch((error) => {
          
//       });
//   };
//   const loadManagersData = () => {
//     axios
//       .post(`${BASE_URL}/api/managersList`, { status, email })
//       .then((response) => {
          
//         setAditionalManager(response.data);
//       })
//       .catch((error) => {
          
//       });
//   };
//   useEffect(() => {
//     axios
//       .post(`${BASE_URL}/api/particularLeave`, {
//         id,
//       })
//       .then((response) => {
          
//         setLeaveBalance(response.data);
//       })
//       .catch((error) => {
          
//       });
//   }, []);
//   useEffect(() => {
//     loadEmployeeData();
//     loadManagersData();
//   }, []);

//   const handleInputChange = (e) => {
//     setLeaveCount(leaveBalance[0][e.target.value]);
//     setLeaveType(e.target.value);
//   };

//   function dateDifference(date1, date2) {
//     const firstDate = new Date(date1);
//     const secondDate = new Date(date2);
//     if (secondDate < firstDate) {
//       alert("please select proper date");
//       return;
//     }
//     const differenceInTime = secondDate.getTime() - firstDate.getTime();
//     const differenceInDays = differenceInTime / (1000 * 3600 * 24);
//     return Math.abs(differenceInDays);
//   }

//   const differenceCalculator = (e) => {
//     let requiredLeave = dateDifference(formData.startDate, e.target.value);

//     if (requiredLeave === undefined) return;
//     if (leaveCount < requiredLeave + 1) {
//       alert("leave balance is low");
//       return;
//     }
//     setFormData((prev) => ({ ...prev, endDate: e.target.value }));
//   };

//   const deductLeave = (e) => {
//     e.preventDefault();
//     let requiredLeave = dateDifference(formData.startDate, formData.endDate);
//     if (requiredLeave === undefined) return;
//     if (leaveCount < requiredLeave + 1) {
//       alert("leave balance is low");
//       return;
//     }
//     const totalLeaveRequired = requiredLeave + 1;
//     axios
//       .post(`${BASE_URL}/api/deductLeave`, {
//         id,
//         email,
//         leaveType,
//         totalLeaveRequired,
//       })
//       .then((response) => {
//         alert("leave applied");
//       })
//       .catch((error) => {
          
//       });
//   };

//   return (
//     <div
//       style={{
//         color: darkMode
//           ? "var(--primaryDashColorDark)"
//           : "var(--secondaryDashMenuColor)",
//       }}
//       className="container-fluid py2"
//     >
//       {leaveBalance === null ? (
//         <>
//           <h1>No leave found</h1>
//         </>
//       ) : (
//         <div>
//           <TittleHeader
//             title={"Create Leave "}
//             message={"You can create leave new leave request here."}
//           />
//           <form
//             className="py-4 rounded row"
//             onSubmit={(e) => (
//               deductLeave(e), props.onLeaveApplicationEmpSubmit(e)
//             )}
//           >
//             <div className="mb-3 col-12">
//               <label htmlFor="leaveType" className="form-label">
//                 Select Leave Type
//               </label>
//               <select
//                 className="form-select rounded-0"
//                 id="leaveType"
//                 name="leaveType"
//                 value={leaveType}
//                 onChange={handleInputChange}
//                 required
//               >
//                 {empData.length > 0 && empData.Gender === "male" ? (
//                   <>
//                     <option value="" disabled selected>
//                       -- Select --
//                     </option>
//                     <option value="Sick Leave">Sick Leave</option>
//                     <option value="Casual Leave">Casual Leave</option>
//                     <option value="Paid Leave">Paid Leave</option>
//                     <option value="Paternity Leave">Maternity Leave</option>
//                   </>
//                 ) : (
//                   <>
//                     <option value="" disabled selected>
//                       -- Select --
//                     </option>
//                     <option value="Sick Leave">Sick Leave</option>
//                     <option value="Casual Leave">Casual Leave</option>
//                     <option value="Paid Leave">Paid Leave</option>

//                     <option value="Maternity Leave">Paternity Leave</option>
//                   </>
//                 )}
//               </select>
//             </div>
//             <div className="mb-3 col-12">
//               <label htmlFor="leaveType" className="form-label">
//                 Available {leaveType}
//               </label>
//               <input
//                 className="form-select rounded-0"
//                 id="leaveStatus"
//                 name="leaveStatus"
//                 value={leaveCount}
//                 placeholder="Please select any leave"
//               />
//             </div>
//             <div className="mb-3 col-6">
//               <label htmlFor="startDate" className="form-label">
//                 Start Date:
//               </label>
//               <input
//                 type="date"
//                 className="form-control rounded-0"
//                 id="startDate"
//                 name="startDate"
//                 value={formData.startDate}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     startDate: e.target.value,
//                   }))
//                 }
//                 required
//               />
//             </div>
//             <div className="mb-3 col-6">
//               <label htmlFor="endDate" className="form-label">
//                 End Date:
//               </label>
//               <input
//                 type="date"
//                 className="form-control rounded-0"
//                 id="endDate"
//                 name="endDate"
//                 value={formData.endDate}
//                 onChange={differenceCalculator}
//                 required
//               />
//             </div>

//             <div className="mb-3">
//               <label htmlFor="manager" className="form-label">
//                 Reporting Manager:
//               </label>
//               <input
//                 className="form-control rounded-0"
//                 id="manager"
//                 name="manager"
//                 value={empData.reportManager}
//                 // onChange={handleInputChange}
//                 required
//                 disabled
//                 placeholder={empData.reportManager}
//               />
//             </div>

//             <div className="mb-3">
//               <label htmlFor="hr" className="form-label">
//                 Reporting Hr:
//               </label>
//               <input
//                 className="form-control rounded-0"
//                 id="hr"
//                 name="hr"
//                 value={empData.reportHr}
//                 // onChange={handleInputChange}
//                 required
//                 disabled
//                 placeholder={empData.reportHr}
//               />
//             </div>
//             <div className="mb-3">
//               <label htmlFor="manager" className="form-label">
//                 Additional Manager:
//               </label>
//               <select
//                 className="form-select rounded-0"
//                 id="leaveType"
//                 name="leaveType"
//                 value={addManager}
//                 onChange={(e) => setAddManager(e.target.value)}
//               >
//                 <option value="" disabled selected>
//                   -- Select --
//                 </option>
//                 {aditionalManager.map((val) => {
//                   return <option value={val.Email}>{val.Email}</option>;
//                 })}
//               </select>
//             </div>
//             <div className="mb-3">
//               <label htmlFor="reason" className="form-label">
//                 Reason:
//               </label>
//               <textarea
//                 className="form-control rounded-0"
//                 id="reason"
//                 name="reason"
//                 // value={formData.reason}
//                 // onChange={handleInputChange}
//                 required
//                 placeholder="Please mention the reason for leave"
//               />
//             </div>

//             <div className="d-flex align-items-center gap-3">
//               <button
//                 type="submit"
//                 className="btn btn-primary "
//                 // onClick={deductLeave}
//               >
//                 Submit
//               </button>
//               <button
//                 type="reset"
//                 className="btn btn-danger"
//                 onClick={props.onFormClose}
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LeaveApplicationEmpForm;
