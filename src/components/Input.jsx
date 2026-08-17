import React from "react";

const Input = ({
  label,
  type = "text",
  error,
  autoFocus = false,
  disabled,
  shake = false, // New prop to trigger shake
  classes = "",
  ...props
}) => {
  return (
    <div className={`${classes} mb-5`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          autoFocus={autoFocus}
          className={`
            mt-1 block w-full px-4 py-3 rounded-lg border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary
            ${error ? "border-red-500" : "border-gray-300"}
            ${shake ? "animate-shake" : ""}
            ${disabled ? "bg-gray-200" : ""}
          `}
          onWheel={type === "number" ? (event) => event.target.blur() : undefined}
          {...props}
        />
      </div>

      {/* Error Message with fade-in */}
      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium animate-in fade-in slide-in-from-top-1 duration-300">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
