import React from "react";
import { IoIosCheckmarkCircle } from "react-icons/io";

const VerifiedName = ({ name, isVerified, className = "" }) => {
  if (!isVerified) {
    return <span className={`font-medium ${className}`}>{name}</span>;
  }

  return (
    <div
      className={`inline-flex items-center gap-1 group relative ${className}`}
    >
      <span className="font-medium">{name}</span>
      <div className="relative">
        <IoIosCheckmarkCircle
          size={20}
          color="#305CDE"
          className="cursor-help"
        />

        {/* Custom tooltip */}
        <div className="tooltip left-1/2 -translate-x-1/2 top-full mt-2 whitespace-nowrap">
          <div className="font-semibold">Verified Business</div>
          <div className="text-xs text-gray-300 mt-1">
            This account has completed full business verification
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedName;
