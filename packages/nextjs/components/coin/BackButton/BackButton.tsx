"use client";

import { useRouter } from "next/navigation";
import styles from "./styles.module.css";
import { LeftChevronArrow } from "~~/icons/actions";

const BackButton = () => {
  const router = useRouter();

  const handleClick = () => {
    router.back();
  };

  return (
    <div className={styles.back_button} onClick={handleClick}>
      <LeftChevronArrow />
      <p className="text-base font-bold">Back</p>
    </div>
  );
};

export default BackButton;
