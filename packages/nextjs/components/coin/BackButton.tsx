"use client";

import { useRouter } from "next/navigation";
import { LeftChevronArrow } from "~~/icons/actions";

const BackButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <div className="back-button" onClick={handleClick}>
      <LeftChevronArrow />
      <p className="text-base font-bold">Back</p>
    </div>
  );
};

export default BackButton;
