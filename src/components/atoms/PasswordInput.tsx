"use client";

import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  inputClassName?: string;
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      containerClassName,
      inputClassName,
      error,
      className,
      readOnly,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    const showToggle = !readOnly && !disabled;

    return (
      <div className={`relative ${containerClassName ?? ""}`}>
        <input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={
            `w-full text-[10px] md:text-[14px] font-body placeholder:text-[10px] md:placeholder:text-[14px] text-[#111102] bg-[#FEFEFE] rounded-[5px] px-3 focus:outline-none focus:ring-2 border ` +
            `${
              error
                ? "focus:ring-red-500 border-red-300"
                : "focus:ring-yellow-500 border-gray-300"
            } ` +
            `${inputClassName ?? ""} ${className ?? ""}`
          }
          readOnly={readOnly}
          disabled={disabled}
          {...props}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setIsVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500"
            tabIndex={-1}
            aria-label={isVisible ? "Hide password" : "Show password"}
          >
            {isVisible ? (
              <Eye className="size-[12px] md:size-[16px]" />
            ) : (
              <EyeOff className="size-[12px] md:size-[16px]" />
            )}
          </button>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
