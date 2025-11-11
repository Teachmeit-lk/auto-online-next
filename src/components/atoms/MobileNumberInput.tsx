"use client";

import React, { forwardRef } from "react";

export interface MobileNumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  error?: boolean;
}

export const MobileNumberInput = forwardRef<HTMLInputElement, MobileNumberInputProps>(
  (
    { containerClassName, inputClassName, error, className, onChange, ...props },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value ?? "";
      // Allow only digits; enforce max 10 digits
      const digitsOnly = raw.replace(/\D/g, "").slice(0, 10);
      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: digitsOnly },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={`relative ${containerClassName ?? ""}`}>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          onChange={handleChange}
          className={
            `w-full text-[10px] md:text-[14px] font-body placeholder:text-[10px] md:placeholder:text-[14px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 focus:outline-none focus:ring-2 border ` +
            `${error ? "focus:ring-red-500 border-red-300" : "focus:ring-yellow-500 border-gray-300"} ` +
            `${inputClassName ?? ""} ${className ?? ""}`
          }
          {...props}
        />
      </div>
    );
  }
);

MobileNumberInput.displayName = "MobileNumberInput";


