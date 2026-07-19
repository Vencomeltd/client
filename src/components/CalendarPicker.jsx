import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const toDateStr = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const toDateTimeStr = (date, time) => `${toDateStr(date)}T${time}`;

const startOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const ALL_TIMES = (() => {
  const times = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
})();

const timeToMinutes = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export default function CalendarPicker({
  value,
  onChange,
  label,
  isHourly = false,
  minDate = null,
  placeholder = "Select date",
  openTime = null,
  closeTime = null,
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed)) {
        setSelectedDate(startOfDay(parsed));
        setViewDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
        if (isHourly) {
          const h = String(parsed.getHours()).padStart(2, "0");
          const m = String(parsed.getMinutes()).padStart(2, "0");
          setSelectedTime(`${h}:${m}`);
        }
      }
    } else {
      setSelectedDate(null);
    }
  }, [value, isHourly]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setShowTimePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = startOfDay(new Date());
  const minDay = minDate ? startOfDay(new Date(minDate)) : today;

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  };

  const handleDateClick = (date) => {
    const day = startOfDay(date);
    if (day < minDay) return;
    setSelectedDate(day);
    if (isHourly) {
      setShowTimePicker(true);
    } else {
      onChange(toDateStr(day));
      setOpen(false);
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      onChange(toDateTimeStr(selectedDate, selectedTime));
      setOpen(false);
      setShowTimePicker(false);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    if (selectedDate) {
      onChange(toDateTimeStr(selectedDate, time));
    }
  };

  const prevMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () =>
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const displayValue = () => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return isHourly ? `${dateStr} at ${selectedTime}` : dateStr;
  };

  const cells = getDaysInMonth();

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setShowTimePicker(false); }}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: open ? "1.5px solid #2E58EC" : "1.5px solid #E5E7EB",
          fontSize: "14px",
          background: "#fff",
          color: selectedDate ? "#111827" : "#9CA3AF",
          textAlign: "left",
          cursor: "pointer",
          boxSizing: "border-box",
          outline: "none",
          boxShadow: open ? "0 0 0 3px rgba(46,88,236,0.1)" : "none",
          transition: "all 0.15s ease",
        }}
      >
        {displayValue() || placeholder}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 9999,
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            width: "320px",
            overflow: "hidden",
          }}
        >
          {!showTimePicker ? (
            <div style={{ padding: "16px" }}>
              {/* Month nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={prevMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronLeft size={16} color="#0A1628" />
                </button>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>
                  {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={nextMonth}
                  style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronRight size={16} color="#0A1628" />
                </button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "8px" }}>
                {DAYS.map((d) => (
                  <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", padding: "4px 0" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Date cells */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />;
                  const day = startOfDay(date);
                  const isPast = day < minDay;
                  const isSelected = selectedDate && day.getTime() === selectedDate.getTime();
                  const isToday = day.getTime() === today.getTime();

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => !isPast && handleDateClick(date)}
                      disabled={isPast}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        border: isToday && !isSelected ? "2px solid #2E58EC" : "none",
                        background: isSelected ? "#2E58EC" : "transparent",
                        color: isSelected ? "#fff" : isPast ? "#D1D5DB" : "#111827",
                        fontSize: "13px",
                        fontWeight: isSelected ? "700" : "400",
                        cursor: isPast ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.1s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isPast && !isSelected) e.currentTarget.style.background = "rgba(46,88,236,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isPast && !isSelected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Confirm for non-hourly */}
              {!isHourly && selectedDate && (
                <button
                  type="button"
                  onClick={() => { onChange(toDateStr(selectedDate)); setOpen(false); }}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    padding: "12px",
                    borderRadius: "10px",
                    background: "#0A1628",
                    color: "#fff",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Confirm Date
                </button>
              )}
            </div>
          ) : (
            /* Time picker */
            <div style={{ padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <button
                  type="button"
                  aria-label="Back to date selection"
                  onClick={() => setShowTimePicker(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
                >
                  <ChevronLeft size={18} color="#0A1628" />
                </button>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#0A1628" }}>
                  Select Time — {selectedDate?.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", padding: "10px 12px", background: "#F8F6F0", borderRadius: "8px" }}>
                <Clock size={16} color="#2E58EC" />
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628" }}>{selectedTime}</span>
              </div>

              <div style={{ maxHeight: "200px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", paddingRight: "4px" }}>
                {ALL_TIMES.map((t) => {
                  const tMin = timeToMinutes(t);
                  const openMin = openTime ? timeToMinutes(openTime) : 0;
                  const closeMin = closeTime ? timeToMinutes(closeTime) : 23 * 60 + 30;
                  const isRestricted = openTime && closeTime && (tMin < openMin || tMin > closeMin);
                  const isSelected = selectedTime === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => !isRestricted && handleTimeSelect(t)}
                      disabled={isRestricted}
                      title={isRestricted ? `Available ${openTime} - ${closeTime} only` : ""}
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        border: isSelected ? "2px solid #2E58EC" : "1px solid #E5E7EB",
                        background: isRestricted
                          ? "#F3F4F6"
                          : isSelected
                          ? "rgba(46,88,236,0.08)"
                          : "#fff",
                        color: isRestricted
                          ? "#D1D5DB"
                          : isSelected
                          ? "#2E58EC"
                          : "#374151",
                        fontSize: "13px",
                        fontWeight: isSelected ? "700" : "400",
                        cursor: isRestricted ? "not-allowed" : "pointer",
                        textDecoration: isRestricted ? "line-through" : "none",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleTimeConfirm}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#0A1628",
                  color: "#fff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
