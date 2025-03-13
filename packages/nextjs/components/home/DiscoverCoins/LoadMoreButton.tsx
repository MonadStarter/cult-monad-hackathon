"use client";

import { DownChevronArrow } from "~~/icons/actions";

interface LoadMoreButtonProps {
  // Define the props interface
  onClick: () => Promise<any>; // onClick is a function that returns a Promise (as fetchNextPage does)
  disabled?: boolean; // disabled is an optional boolean
}

const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, disabled }) => {
  return (
    <button 
      className={`
        flex items-center justify-center gap-2 
        px-6 py-3 
        bg-gradient-to-r from-purple-600 to-indigo-600 
        hover:from-purple-700 hover:to-indigo-700 
        text-white font-medium 
        rounded-lg 
        transition-all duration-300 
        shadow-lg hover:shadow-purple-500/20
        ${disabled ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}
      `}
      onClick={() => !disabled && onClick()}
      disabled={disabled}
    >
      {disabled ? (
        <>
          <span className="animate-pulse">Loading more tokens...</span>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </>
      ) : (
        <>
          <span>Load more tokens</span>
          <span className="animate-bounce">
            <DownChevronArrow />
          </span>
        </>
      )}
    </button>
  );
};

export default LoadMoreButton;
