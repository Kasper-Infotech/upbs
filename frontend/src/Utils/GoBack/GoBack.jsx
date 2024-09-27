import React from "react";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { useTheme } from "../../Context/TheamContext/ThemeContext";
import { IoChevronBackOutline } from "react-icons/io5";

const GoBack = () => {
  const history = useHistory();
  const location = useLocation();
  const { darkMode } = useTheme();

  const userType = localStorage.getItem("Account");

  // Define the routes where the back button should not be displayed
  const shouldHideButton =
    (userType == 1 && location.pathname === "/admin/dashboard") ||
    (userType == 2 && location.pathname === "/hr/dashboard") ||
    (userType == 3 && location.pathname === "/manager/dashboard") ||
    (userType == 4 && location.pathname === "/employee/dashboard");

  return (
    <div>
      {!shouldHideButton && (
        <span
          style={{ cursor: "pointer", color: darkMode ? "black" : "white" }}
          className="py-1 px-2 d-flex align-items-center gap-2"
          onClick={() => history.goBack()}
        >
          <IoChevronBackOutline /> Back
        </span>
      )}
    </div>
  );
};

export default GoBack;
