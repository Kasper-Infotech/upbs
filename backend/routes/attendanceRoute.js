const express = require("express");
const {
  createAttendance,
  createHolidays,
  findAttendance,
  findEmployeeAttendanceEployeeId,
  findEmployeeAttendanceId,
  findAllHolidays,
  todaysAttendance,
  attendanceRegister,updateAttendance,
  getEmployeeTodayAttendance // Add this function to your controller
} = require("../controllers/AttendanceController");
const {verifyAdminHRManager,verifyAdminHR,verifyAll} = require('../middleware/rbacMiddleware');

const attendanceRoute = express.Router();

// Create a Attendance Route

attendanceRoute.post("/attendance/:attendanceId" ,createAttendance);
attendanceRoute.post("/Create-holiday",createHolidays);
attendanceRoute.post("/updateAttendance",updateAttendance);
attendanceRoute.get("/attendance",findAttendance);
attendanceRoute.get(
  "/attendances/:employeeId",
  findEmployeeAttendanceEployeeId
);
attendanceRoute.get("/attendance/:id",findEmployeeAttendanceId);  ////manager also view self attendence and all employee attendence 
attendanceRoute.get("/holidays",findAllHolidays);

attendanceRoute.get("/attendance-register/:year/:month", attendanceRegister);

attendanceRoute.get("/todays-attendance", todaysAttendance); // today attendence for all user

// Route to fetch today's attendance for a particular employee

attendanceRoute.get(
  "/employee/:employeeId/today-attendance",
  getEmployeeTodayAttendance
);

module.exports = {
  attendanceRoute
};
