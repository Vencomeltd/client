import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { getLowestWeeklyRate } from "../utils/dayPricing";

const EvenCard = ({ id, data }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${id}`);
  };

  return (
    <div
      className="w-full p-3 flex flex-col gap-3 max-w-sm bg-gray-100 rounded-[16px] shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={data.coverImage}
          alt={data.title}
          className="w-full h-72 rounded-[16px] object-cover"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-4 bg-white rounded-[16px]">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {data.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {data.location.address}, {data.location.city}, {data.location.country}
        </p>
        <div className="flex items-center">
          {(() => {
            const hasDayVariance = (data.pricing?.customDayPricing?.length || 0) > 0;
            const isHourly = data.pricing?.pricingType === "HOURLY";
            const baseRate = isHourly ? data.pricing?.hourlyPrice : data.pricing?.weekdayPrice;
            const rate = getLowestWeeklyRate(baseRate, data.pricing?.customDayPricing);
            return (
              <p className="text-lg">
                {hasDayVariance ? "From " : ""}${rate} / {isHourly ? "hour" : "night"}
              </p>
            );
          })()}
          <div className="flex items-center gap-1 px-2 py-1 text-sm font-semibold text-gray-800">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span>{data.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvenCard;
