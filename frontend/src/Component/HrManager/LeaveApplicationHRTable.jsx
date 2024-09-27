import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { RingLoader } from "react-spinners";
import { css } from "@emotion/core";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import { LuSearch } from "react-icons/lu";
import { useTheme } from "../../Context/TheamContext/ThemeContext";
import LeaveLight from "../../img/Leave/LeaveLight.svg";
import LeaveDark from "../../img/Leave/LeaveDark.svg";
import BASE_URL from "../../Pages/config/config";
import { useLocation } from "react-router-dom/cjs/react-router-dom";
import { rowBodyStyle, rowHeadStyle } from "../../Style/TableStyle";
import Pagination from "../../Utils/Pagination";

const override = css`
  display: block;
  margin: 0 auto;
  margin-top: 45px;
  border-color: red;
`;

const LeaveApplicationHRTable = (props) => {
  const [leaveApplicationHRData, setLeaveApplicationHRData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowData, setRowData] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filteredData, setFilteredData] = useState([]);
  const { darkMode } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const location = useLocation();

  const email = localStorage.getItem("Email");
  const formatDate = (dateString) => {
    if (!dateString) return;
    const dateParts = dateString.split("-");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  };

  const loadLeaveApplicationHRData = () => {
    axios
      .post(
        `${BASE_URL}/api/leave-application-hr/`,
        { hr: email },
        {
          headers: {
            authorization: localStorage.getItem("token") || "",
          },
        }
      )
      .then((response) => {
        const leaveApplicationHRObj = response.data;

        setLeaveApplicationHRData(leaveApplicationHRObj);
        setLoading(false);

        const rowDataT = leaveApplicationHRObj.map((data) => {
          return {
            data,
            empID: data?.empID,
            Name: data?.FirstName + " " + data?.LastName,
            Leavetype: data?.Leavetype,
            CreatedOn: formatDate(data?.createdOn?.slice(0, 10)),
            FromDate: formatDate(data["FromDate"]?.slice(0, 10)),
            ToDate: formatDate(data["ToDate"]?.slice(0, 10)),
            Days: calculateDays(data?.FromDate, data?.ToDate),
            Reasonforleave: data?.Reasonforleave,
            aditionalManager: data?.aditionalManager,
            Status: status(data?.Status),
            empObjID: data?.empObjID,
          };
        });
        console.log(rowDataT);

        setRowData(
          rowDataT.filter(
            (data) => data.Status === "Pending" || data.Status === 1
          )
        );
        setFilteredData(
          rowDataT.filter(
            (data) => data.Status === "Pending" || data.Status === 1
          )
        );
      })
      .catch((error) => {});
  };

  useEffect(() => {
    loadLeaveApplicationHRData();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery]);

  const filterData = () => {
    const filtered = rowData.filter((item) => {
      return item.Name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
  };

  const calculateDays = (startDate, endDate) => {
    if (!endDate) return 0.5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
    return diffDays;
  };

  const onLeaveApplicationHRDelete = (e1, e2) => {
    if (window.confirm("Are you sure to delete this record? ")) {
      axios
        .delete(`${BASE_URL}/api/leave-application-hr/` + e1 + "/" + e2, {
          headers: {
            authorization: localStorage.getItem("token") || "",
          },
        })
        .then((res) => {
          loadLeaveApplicationHRData();
        })
        .catch((err) => {});
    }
  };

  const exportToPDF = () => {
    if (window.confirm("Are you sure to download Leave record? ")) {
      const pdfWidth = 297;
      const pdfHeight = 210;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      doc.setFontSize(18);
      doc.text("Employee Leave Details", pdfWidth / 2, 15, "center");
      const headers = [
        "Emp Id",
        "Leave Type",
        "Start Date",
        "End Date",
        "Remarks",
        "Days",
        "CreatedOn",
        "Status",
      ];
      const data = filteredData.map((row) => [
        row.empID,
        row.Leavetype,
        row.FromDate,
        row.ToDate,
        row.Days,
        row.CreatedOn,
        row.Reasonforleave,
        row.Status,
      ]);
      doc.setFontSize(12);
      doc.autoTable({
        head: [headers],
        body: data,
        startY: 25,
      });

      doc.save("leaveApplication_data.pdf");
    }
  };

  const status = (s) => {
    if (s == 1) {
      return "Pending";
    }
    if (s == 2) {
      return "Approved";
    }
    if (s == 3) {
      return "Rejected";
    }
  };

  const approvedLeaves = filteredData.filter(
    (data) => data.Status === "Pending"
  ).length;

  const handlePaginationNext = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePaginationPrev = () => {
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column justify-between m-0 mt-3">
        <div className="d-flex justify-content-between aline-items-center">
          <div className="my-auto">
            <h5
              style={{
                color: darkMode
                  ? "var(--secondaryDashColorDark)"
                  : "var(--secondaryDashMenuColor)",
              }}
              className="m-0 p-0 "
            >
              Leaves Request ( {filteredData.length} )
            </h5>
            <p
              style={{
                color: darkMode
                  ? "var(--secondaryDashColorDark)"
                  : "var(--secondaryDashMenuColor)",
              }}
              className="m-0 p-0 "
            >
              You can see all new leave requests here{" "}
            </p>
          </div>
          <div className="d-flex gap-2 justify-content-between py-3">
            <button
              className="btn btn-danger rounded-0 py-0 shadow-sm d-flex justify-center  aline-center gap-2"
              onClick={exportToPDF}
            >
              <BsFillFileEarmarkPdfFill className="fs-6" />
              <p className="my-auto d-none d-md-flex fs-6">PDF</p>
            </button>
            <div className="searchholder p-0 d-flex  position-relative">
              <input
                style={{
                  height: "100%",
                  width: "100%",
                  paddingLeft: "15%",
                }}
                className="form-control border rounded-0"
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <LuSearch
                style={{ position: "absolute", top: "30%", left: "5%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div id="clear-both" />

      <div>
        <div>
          {currentItems.length > 0 ? (
            <>
              <div
                style={{
                  // maxHeight: "68vh",
                  overflow: "auto",
                  position: "relative",
                }}
                className="table-responsive p-2 mb-3"
              >
                <table className="table">
                  <thead>
                    <tr className="shadow">
                      <th style={rowHeadStyle(darkMode)}>Profile</th>
                      <th style={rowHeadStyle(darkMode)}>Employee Name</th>
                      <th style={rowHeadStyle(darkMode)}>Emp ID</th>
                      <th style={rowHeadStyle(darkMode)}>Leave Type</th>
                      <th style={rowHeadStyle(darkMode)}>Start Date</th>
                      <th style={rowHeadStyle(darkMode)}>End Date</th>
                      <th style={rowHeadStyle(darkMode)}>CreatedOn</th>
                      <th style={rowHeadStyle(darkMode)}>Days</th>
                      <th style={rowHeadStyle(darkMode)}>Status</th>
                      <th style={rowHeadStyle(darkMode)}>Remarks</th>
                      <th style={rowHeadStyle(darkMode)}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((data, index) => {
                      return (
                        <tr key={index}>
                          <td style={rowBodyStyle(darkMode)}>
                            <div
                              className="mx-auto d-flex align-items-center justify-content-center"
                              style={{
                                height: "30px",
                                width: "30px",
                                borderRadius: "50%",
                                backgroundColor: "#ccc",
                                color: "white",
                                fontWeight: "bold",
                                overflow: "hidden",
                                objectFit: "cover",
                              }}
                            >
                              {data?.data?.profile?.image_url ? (
                                <img
                                  style={{
                                    height: "100%",
                                    width: "100%",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                  }}
                                  src={data?.data?.profile?.image_url}
                                  alt=""
                                />
                              ) : (
                                <span>
                                  {data?.Name?.split(" ")
                                    .map((name) => name[0])
                                    .join("")
                                    .toUpperCase()}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={rowBodyStyle(darkMode)}>{data.Name}</td>
                          <td style={rowBodyStyle(darkMode)}>{data.empID}</td>
                          <td style={rowBodyStyle(darkMode)}>
                            {data.Leavetype}
                          </td>
                          <td style={rowBodyStyle(darkMode)}>
                            {data.FromDate}
                          </td>
                          <td style={rowBodyStyle(darkMode)}>{data.ToDate}</td>
                          <td style={rowBodyStyle(darkMode)}>
                            <span>{data.CreatedOn}</span>
                          </td>
                          <td style={rowBodyStyle(darkMode)}>
                            <span>{data.Days}</span>
                          </td>
                          <td style={rowBodyStyle(darkMode)}>
                            <span className=" text-warning border border-warning px-2 py-0 rounded-5">
                              {data.Status}
                            </span>
                          </td>
                          <td style={rowBodyStyle(darkMode)}>
                            {data.Reasonforleave}
                          </td>
                          <td style={rowBodyStyle(darkMode)}>
                            <div
                              className="d-flex gap-3 py-2"
                              style={{ cursor: "pointer" }}
                            >
                              <p title="Update" className="m-auto text-primary">
                                <FontAwesomeIcon
                                  className="m-auto"
                                  icon={faEdit}
                                  onClick={() =>
                                    props.onEditLeaveApplicationHR(
                                      data.data,
                                      data.Days
                                    )
                                  }
                                />
                              </p>
                              <p title="Delete" className="m-auto text-danger">
                                <FontAwesomeIcon
                                  className="m-auto"
                                  icon={faTrash}
                                  onClick={() =>
                                    onLeaveApplicationHRDelete(
                                      data.empObjID,
                                      data.data["_id"]
                                    )
                                  }
                                />
                              </p>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPage}
                pageNumbers={pageNumbers}
                handlePaginationPrev={handlePaginationPrev}
                handlePaginationNext={handlePaginationNext}
                setCurrentPage={setCurrentPage}
                filteredDataLength={filteredData.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div
              style={{
                height: "80vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                wordSpacing: "5px",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <img
                style={{
                  height: "auto",
                  width: "25%",
                }}
                src={darkMode ? LeaveDark : LeaveLight}
                alt="img"
              />
              <p
                style={{
                  color: darkMode
                    ? "var(--secondaryDashColorDark)"
                    : "var( --primaryDashMenuColor)",
                }}
              >
                No Leave requests found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveApplicationHRTable;

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
// import { RingLoader } from "react-spinners";
// import { css } from "@emotion/core";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
// import { LuSearch } from "react-icons/lu";
// import { useTheme } from "../../Context/TheamContext/ThemeContext";
// import LeaveLight from "../../img/Leave/LeaveLight.svg";
// import LeaveDark from "../../img/Leave/LeaveDark.svg";
// import BASE_URL from "../../Pages/config/config";
// import { useLocation } from "react-router-dom/cjs/react-router-dom";
// import { rowBodyStyle, rowHeadStyle } from "../../Style/TableStyle";
// import Pagination from "../../Utils/Pagination";

// const override = css`
//   display: block;
//   margin: 0 auto;
//   margin-top: 45px;
//   border-color: red;
// `;

// const LeaveApplicationHRTable = (props) => {
//   const [leaveApplicationHRData, setLeaveApplicationHRData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [rowData, setRowData] = useState([]);
//   const [sortColumn, setSortColumn] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [filteredData, setFilteredData] = useState([]);
//   const { darkMode } = useTheme();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const location = useLocation();

//   const email = localStorage.getItem("Email");
//   const formatDate = (dateString) => {
//     if (!dateString) return;
//     const dateParts = dateString.split("-");
//     return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
//   };

//   const loadLeaveApplicationHRData = () => {
//     axios
//       .post(
//         `${BASE_URL}/api/leave-application-hr/`,
//         { hr: email },
//         {
//           headers: {
//             authorization: localStorage.getItem("token") || ""
//           }
//         }
//       )
//       .then((response) => {
//         const leaveApplicationHRObj = response.data;

//         setLeaveApplicationHRData(leaveApplicationHRObj);
//         setLoading(false);

//         const rowDataT = leaveApplicationHRObj.map((data) => {
//           return {
//             data,
//             empID: data?.empID,
//             Name: data?.FirstName + " " + data?.LastName,
//             Leavetype: data?.Leavetype,
//             CreatedOn: formatDate(data?.createdOn?.slice(0, 10)),
//             FromDate: formatDate(data["FromDate"]?.slice(0, 10)),
//             ToDate: formatDate(data["ToDate"]?.slice(0, 10)),
//             Days: calculateDays(data?.FromDate, data?.ToDate),
//             Reasonforleave: data?.Reasonforleave,
//             aditionalManager: data?.aditionalManager,
//             Status: status(data?.Status),
//             empObjID: data?.empObjID
//           };
//         });

//         setRowData(rowDataT.filter(data=> data.Status === "Pending" || data.Status === 1));
//         setFilteredData(rowDataT.filter(data=> data.Status === "Pending" || data.Status === 1));
//       })
//       .catch((error) => {

//       });
//   };

//   useEffect(() => {
//     loadLeaveApplicationHRData();
//   }, []);

//   useEffect(() => {
//     filterData();
//   }, [searchQuery]);

//   const filterData = () => {
//     const filtered = rowData.filter((item) => {
//       return item.Name.toLowerCase().includes(searchQuery.toLowerCase());
//     });
//     setFilteredData(filtered);
//   };

//   const calculateDays = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end - start);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Add 1 to include both start and end dates
//     return diffDays;
//   };

//   const onLeaveApplicationHRDelete = (e1, e2) => {
//     if (window.confirm("Are you sure to delete this record? ")) {
//       axios
//         .delete(`${BASE_URL}/api/leave-application-hr/` + e1 + "/" + e2, {
//           headers: {
//             authorization: localStorage.getItem("token") || ""
//           }
//         })
//         .then((res) => {
//           loadLeaveApplicationHRData();
//         })
//         .catch((err) => {

//         });
//     }
//   };

//   const exportToPDF = () => {
//     if (window.confirm("Are you sure to download Leave record? ")) {
//       const pdfWidth = 297;
//       const pdfHeight = 210;
//       const doc = new jsPDF({
//         orientation: "landscape",
//         unit: "mm",
//         format: [pdfWidth, pdfHeight]
//       });

//       doc.setFontSize(18);
//       doc.text("Employee Leave Details", pdfWidth / 2, 15, "center");
//       const headers = [
//         "Emp Id",
//         "Leave Type",
//         "Start Date",
//         "End Date",
//         "Remarks",
//         "Days",
//         "CreatedOn",
//         "Status"
//       ];
//       const data = filteredData.map((row) => [
//         row.empID,
//         row.Leavetype,
//         row.FromDate,
//         row.ToDate,
//         row.Days,
//         row.CreatedOn,
//         row.Reasonforleave,
//         row.Status
//       ]);
//       doc.setFontSize(12);
//       doc.autoTable({
//         head: [headers],
//         body: data,
//         startY: 25
//       });

//       doc.save("leaveApplication_data.pdf");
//     }
//   };

//   const status = (s) => {
//     if (s == 1) {
//       return "Pending";
//     }
//     if (s == 2) {
//       return "Approved";
//     }
//     if (s == 3) {
//       return "Rejected";
//     }
//   };

//   const approvedLeaves = filteredData.filter(
//     (data) => data.Status === "Pending"
//   ).length;

//   const handlePaginationNext = () => {
//     setCurrentPage((prevPage) => prevPage + 1);
//   };

//   const handlePaginationPrev = () => {
//     setCurrentPage((prevPage) => prevPage - 1);
//   };

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   return (
//     <div className="container-fluid">
//     <div className="d-flex flex-column justify-between m-0 mt-3">
//       <div className="d-flex justify-content-between aline-items-center">
//         <div className="my-auto">
//           <h5
//             style={{
//               color: darkMode
//                 ? "var(--secondaryDashColorDark)"
//                 : "var(--secondaryDashMenuColor)"
//             }}
//             className="m-0 p-0 "
//           >
//             Leaves Request ( {filteredData.length} )
//           </h5>
//           <p
//             style={{
//               color: darkMode
//                 ? "var(--secondaryDashColorDark)"
//                 : "var(--secondaryDashMenuColor)"
//             }}
//             className="m-0 p-0 "
//           >
//             You can see all new leave requests here{" "}
//           </p>
//         </div>
//         <div className="d-flex gap-2 justify-content-between py-3">
//           <button
//             className="btn btn-danger rounded-0 py-0 shadow-sm d-flex justify-center  aline-center gap-2"
//             onClick={exportToPDF}
//           >
//             <BsFillFileEarmarkPdfFill className="fs-6" />
//             <p className="my-auto d-none d-md-flex fs-6">PDF</p>
//           </button>
//           <div className="searchholder p-0 d-flex  position-relative">
//             <input
//               style={{
//                 height: "100%",
//                 width: "100%",
//                 paddingLeft: "15%"
//               }}
//               className="form-control border rounded-0"
//               type="text"
//               placeholder="Search by name"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//             <LuSearch
//               style={{ position: "absolute", top: "30%", left: "5%" }}
//             />
//           </div>
//         </div>
//       </div>
//     </div>

//     <div id="clear-both" />

//     <div>
//       <div
//       >
//         {currentItems.length > 0 ? (
// <>
// <div style={{
//             // maxHeight: "68vh",
//             overflow: "auto",
//             position: "relative",
//           }}
//           className="table-responsive p-2 mb-3">
//             <table className="table">
//             <thead>
//               <tr className="shadow">
//                 <th style={rowHeadStyle(darkMode)}>Profile</th>
//                 <th style={rowHeadStyle(darkMode)}>Employee Name</th>
//                 <th style={rowHeadStyle(darkMode)}>Emp ID</th>
//                 <th style={rowHeadStyle(darkMode)}>Leave Type</th>
//                 <th style={rowHeadStyle(darkMode)}>Start Date</th>
//                 <th style={rowHeadStyle(darkMode)}>End Date</th>
//                 <th style={rowHeadStyle(darkMode)}>CreatedOn</th>
//                 <th style={rowHeadStyle(darkMode)}>Days</th>
//                 <th style={rowHeadStyle(darkMode)}>Status</th>
//                 <th style={rowHeadStyle(darkMode)}>Remarks</th>
//                 <th style={rowHeadStyle(darkMode)}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems
//                 .map((data, index) => {
//                   return (
//                     <tr key={index}>
//                     <td style={rowBodyStyle(darkMode)}>
//                     <div
//                         className="mx-auto d-flex align-items-center justify-content-center"
//                         style={{
//                           height: "30px",
//                           width: "30px",
//                           borderRadius: "50%",
//                           backgroundColor: "#ccc",
//                           color: "white",
//                           fontWeight: "bold",
//                           overflow: "hidden",
//                           objectFit: "cover",
//                         }}
//                       >
//                         {data?.data?.profile?.image_url ? (
//                           <img
//                             style={{
//                               height: "100%",
//                               width: "100%",
//                               borderRadius: "50%",
//                               objectFit: "cover",
//                             }}
//                             src={data?.data?.profile?.image_url}
//                             alt=""
//                           />
//                         ) : (
//                           <span>
//                             {data?.Name?.split(" ")
//                               .map((name) => name[0])
//                               .join("")
//                               .toUpperCase()}
//                           </span>
//                         )}
//                       </div>
//                   </td>
//                       <td style={rowBodyStyle(darkMode)}>{data.Name}</td>
//                       <td style={rowBodyStyle(darkMode)}>{data.empID}</td>
//                       <td style={rowBodyStyle(darkMode)}>{data.Leavetype}</td>
//                       <td style={rowBodyStyle(darkMode)}>{data.FromDate}</td>
//                       <td style={rowBodyStyle(darkMode)}>{data.ToDate}</td>
//                       <td style={rowBodyStyle(darkMode)}>
//                         <span>{data.CreatedOn}</span>
//                       </td>
//                       <td style={rowBodyStyle(darkMode)}>
//                         <span>{data.Days}</span>
//                       </td>
//                       <td style={rowBodyStyle(darkMode)}>
//                         <span className=" text-warning border border-warning px-2 py-0 rounded-5">
//                           {data.Status}
//                         </span>
//                       </td>
//                       <td style={rowBodyStyle(darkMode)}>{data.Reasonforleave}</td>
//                       <td style={rowBodyStyle(darkMode)}>
//                         <div
//                           className="d-flex gap-3 py-2"
//                           style={{ cursor: "pointer" }}
//                         >
//                           <p title="Update" className="m-auto text-primary">
//                             <FontAwesomeIcon
//                               className="m-auto"
//                               icon={faEdit}
//                               onClick={() =>
//                                 props.onEditLeaveApplicationHR(data.data)
//                               }
//                             />
//                           </p>
//                           <p title="Delete" className="m-auto text-danger">
//                             <FontAwesomeIcon
//                               className="m-auto"
//                               icon={faTrash}
//                               onClick={() =>
//                                 onLeaveApplicationHRDelete(
//                                   data.empObjID,
//                                   data.data["_id"]
//                                 )
//                               }
//                             />
//                           </p>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//           </div>
//           <Pagination
//           currentPage={currentPage}
//           pageNumbers={pageNumbers}
//           handlePaginationPrev={handlePaginationPrev}
//           handlePaginationNext={handlePaginationNext}
//           setCurrentPage={setCurrentPage}
//           filteredDataLength={filteredData.length}
//           itemsPerPage={itemsPerPage}
//         /></>
//         ) : (
//           <div
//             style={{
//               height: "80vh",
//               width: "100%",
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               wordSpacing: "5px",
//               flexDirection: "column",
//               gap: "2rem"
//             }}
//           >
//             <img
//               style={{
//                 height: "auto",
//                 width: "25%"
//               }}
//               src={darkMode ? LeaveDark : LeaveLight}
//               alt="img"
//             />
//             <p
//               style={{
//                 color: darkMode
//                   ? "var(--secondaryDashColorDark)"
//                   : "var( --primaryDashMenuColor)"
//               }}
//             >
//               No Leave requests found.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
//   );
// };

// export default LeaveApplicationHRTable;
