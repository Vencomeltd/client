import React from "react";
import { Minus, Plus } from "lucide-react"; // optional icons

const Counter = ({
  label,
  subtitle,
  name,
  value,
  onChange,
  min = 0,
  max = 100,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange({ target: { name, value: value - 1 } });
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange({ target: { name, value: value + 1 } });
    }
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <div>
        <h3 className="text-gray-800 font-medium">{label}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={handleDecrement}
          className="bg-yellow-400 hover:bg-yellow-500 text-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all"
        >
          <Minus size={18} />
        </button>
        <span className="w-6 text-center font-medium text-gray-800">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={handleIncrement}
          className="bg-yellow-400 hover:bg-yellow-500 text-white w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-all"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
};

export default Counter;
