import React from "react";
import { Button } from "react-bootstrap";
import { GrFormPrevious, GrFormNext } from "react-icons/gr"; // Added Next icon
import { useTheme } from "../Context/TheamContext/ThemeContext"; // Ensure correct spelling of theme context

const Pagination = ({
  currentPage,
  pageNumbers,
  handlePaginationPrev,
  handlePaginationNext,
  setCurrentPage,
  filteredDataLength,
  itemsPerPage,
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage;
  const indexOfLastItem = currentPage * itemsPerPage;

  // Make sure the dark mode is applied correctly
  const { darkMode } = useTheme();

  return (
    <div className="d-flex flex-column-reverse gap-4 gap-md-0 flex-md-row w-100 justify-content-between align-items-center">
      {/* Adjust color based on dark mode */}
      <div style={{ color: !darkMode ? "white" : "black" }} className="my-auto">
        Showing {indexOfFirstItem + 1} to{" "}
        {Math.min(indexOfLastItem, filteredDataLength)} of {filteredDataLength}{" "}
        results
      </div>

      <div className="d-flex align-items-center gap-1">
        {/* Previous Button */}
        <Button
          className="btn bg-light text-dark rounded-5 border shadow-sm py-1 mx-1"
          onClick={handlePaginationPrev}
          disabled={currentPage === 1}
        >
          <GrFormPrevious className="my-auto" /> Previous
        </Button>

        {/* Page Numbers */}
        <div className="pagination d-flex flex-nowrap gap-2">
          {pageNumbers.map((number) => (
            <Button
              key={number}
              style={{
                border: "none",
                borderRadius: "50%",
                height: "25px",
                width: "25px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => setCurrentPage(number)}
              className={
                currentPage === number
                  ? "bg-primary text-white border-0 rounded-circle"
                  : "bg-light text-dark border rounded-circle"
              }
            >
              {number}
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={handlePaginationNext}
          className="btn bg-light text-dark rounded-5 border shadow-sm py-1 mx-1"
          disabled={indexOfLastItem >= filteredDataLength}
        >
          Next <GrFormNext className="my-auto" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
