"use client";

import React from "react";
import "./InputField.css";

interface InputFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  type?: string;
  label?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  placeholder = "Enter text...",
  value,
  onChange,
  icon,
  endIcon,
  containerClassName,
  inputClassName,
  type = "text",
  label,
  required,
  ...props
}) => {
  const inputComp = (
    <div className={`input-field-container ${containerClassName}`}>
      {icon && <span className="input-field-icon">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field ${inputClassName}`}
        required={required}
        {...props}
      />
      {endIcon && <span className="input-field-icon !mr-0">{endIcon}</span>}
    </div>
  );

  if (!label) return inputComp;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm">
        {label}
        {required && "*"}
      </p>
      {inputComp}
    </div>
  );
};

export default InputField;
