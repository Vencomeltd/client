import React from "react";
import { X } from "lucide-react"; // optional: close icon

const themeColors = {
  success: "bg-green-100 border-green-500 text-green-700",
  danger: "bg-red-100 border-red-500 text-red-700",
  warn: "bg-yellow-100 border-yellow-500 text-yellow-700",
};

const Notification = ({ message, type = "success", onClose }) => {
  const colors = themeColors[type] || themeColors.success;

  return (
    <div
      className={`flex items-center justify-between border-l-4 p-4 rounded-md shadow-md ${colors} mb-2`}
    >
      <p className="text-sm">{message}</p>
      {onClose && (
        <button
          aria-label="Close"
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Notification;
