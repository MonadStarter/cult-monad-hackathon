"use client";

import React, { useState } from "react";
import "./pagination.css";
import { isString } from "lodash";
import { LeftChevronArrow, RightChevronArrow } from "~~/icons/actions";

const Pagination = ({
  totalPages,
  small = false,
  sibling = 1,
  className,
}: {
  totalPages: number;
  sibling?: number;
  small?: boolean;
  className?: string;
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handlePageClick = (page: number | string) => {
    if (isString(page)) return;
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    let pages = [];
    const start = Math.max(currentPage - sibling, 1);
    const end = Math.min(currentPage + sibling, totalPages);

    if (start > 1) pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (end < totalPages - 1) pages.push("...");
    if (end < totalPages) pages.push(totalPages);

    if (pages.length > 5 && small) {
      // no space for more than 5 elements
      const removableElem = pages.indexOf("...") + 1;
      pages = [...pages.slice(0, removableElem), ...pages.slice(removableElem + 1)];
    }
    return pages;
  };

  return (
    <div className={`pagination-container border rounded-xl text-white ${className}`}>
      <button disabled={currentPage === 1} onClick={() => handlePageClick(currentPage - 1)} className="pagination-item">
        <LeftChevronArrow />
        Previous
      </button>
      {getPageNumbers().map((page, index) =>
        page === "..." ? (
          <div key={index} className="ellipsis pagination-item">
            ...
          </div>
        ) : (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`pagination-item ${page === currentPage ? "selected" : ""}`}
          >
            {page}
          </button>
        ),
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        className="pagination-item"
      >
        Next
        <RightChevronArrow />
      </button>
    </div>
  );
};

export default Pagination;
