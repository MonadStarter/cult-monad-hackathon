"use client";

import { useState } from "react";
import { CheckIcon, CogIcon } from "~~/icons/actions";

const Checkbox = ({
  label,
  className,
  onChange,
}: {
  label: string;
  className?: string;
  onChange?: (checked: boolean) => void;
}) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    setIsChecked(!isChecked);
    if (onChange) onChange(isChecked);
  };

  return (
    <div className={`flex items-center space-x-3 cursor-pointer ${className}`} onClick={toggleCheckbox}>
      {isChecked ? <CheckIcon /> : <CogIcon />}
      <span className="font-semibold">{label}</span>
    </div>
  );
};

export default Checkbox;
