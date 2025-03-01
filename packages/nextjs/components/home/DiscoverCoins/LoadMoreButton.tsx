"use client";

import { DownChevronArrow } from "~~/icons/actions";

interface LoadMoreButtonProps {
  // Define the props interface
  onClick: () => Promise<any>; // onClick is a function that returns a Promise (as fetchNextPage does)
  disabled?: boolean; // disabled is an optional boolean
}
const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, disabled }) => {
  return (
    <button className="bg-primary-500" onClick={onClick}>
      Load more coins
      <DownChevronArrow />
    </button>
  );
};

export default LoadMoreButton;
