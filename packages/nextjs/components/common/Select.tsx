"use client";

import { DownChevronArrow } from "~~/icons/actions";

type SelectOption = {
  value: string;
  label: string;
};

function Select({
  className,
  options,
}: {
  className?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        className={`block appearance-none w-full font-semibold px-3 py-2 min-w-48 rounded-xl bg-white-7 focus:outline-none ${className}`}
      >
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <DownChevronArrow />
      </div>
    </div>
  );
}

export default Select;
