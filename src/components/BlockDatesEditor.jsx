import { useMemo, useState } from "react";

const DAY_INDEX = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
const DAYS_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// Shared between CreateSpace.jsx and EditSpace.jsx so the block/unblock
// calendar logic (and its date-math bug fixes) live in exactly one place.
export default function BlockDatesEditor({ blockedDates, onChange }) {
  const [blockViewDate, setBlockViewDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [blockStart, setBlockStart] = useState(null);
  const [blockMode, setBlockMode] = useState("block");
  const [quickBlockFrom, setQuickBlockFrom] = useState("");
  const [quickBlockTo, setQuickBlockTo] = useState("");
  const [recurringDay, setRecurringDay] = useState("");
  const [recurringFrom, setRecurringFrom] = useState("");
  const [recurringTo, setRecurringTo] = useState("");

  const blockCalendarToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const getBlockDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    const adjustedFirst = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < adjustedFirst; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const isBlockedDate = (date) => {
    if (!date) return false;

    const current = new Date(date);
    current.setHours(0, 0, 0, 0);

    return (blockedDates || []).some((blocked) => {
      const start = new Date(blocked.start);
      const end = new Date(blocked.end);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      // end is stored as start + 1 day (an exclusive boundary marking a
      // single blocked calendar day) -- using <= here treated the day
      // *after* every blocked day as blocked too (e.g. "Block All
      // Wednesdays" also shaded every Thursday).
      return current >= start && current < end;
    });
  };

  const handleBlockDateClick = (date) => {
    if (!date) return;

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    if (selectedDate < blockCalendarToday) return;

    if (!blockStart) {
      setBlockStart(selectedDate);
      return;
    }

    const start = blockStart < selectedDate ? blockStart : selectedDate;
    const rangeEnd = blockStart < selectedDate ? selectedDate : blockStart;
    // Exclusive upper boundary (rangeEnd + 1 day), matching the quick-block
    // tools below -- clicking the same day twice (a single-day block) used
    // to save start === end, a zero-width range that isBlockedDate's own
    // `current < end` check can never match, silently making the block a
    // no-op both here and (via the equivalent check in routes/bookings.js)
    // for actually preventing guest bookings.
    const end = new Date(rangeEnd.getTime() + 86400000);

    if (blockMode === "block") {
      const existing = blockedDates || [];
      onChange([
        ...existing,
        { start: start.toISOString(), end: end.toISOString(), reason: "personal" },
      ]);
    } else {
      const updated = (blockedDates || []).filter((blocked) => {
        const blockedStart = new Date(blocked.start);
        const blockedEnd = new Date(blocked.end);
        blockedStart.setHours(0, 0, 0, 0);
        blockedEnd.setHours(0, 0, 0, 0);
        return !(blockedStart >= start && blockedEnd <= end);
      });
      onChange(updated);
    }

    setBlockStart(null);
  };

  return (
    <div>
      <div style={{
        background: "#F8F6F0",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}>
        <p style={{ fontSize: "13px", fontWeight: "700", color: "#0A1628", margin: 0 }}>
          Quick Block Options
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>From</label>
            <input
              type="date"
              style={{ height: "36px", border: "1.5px solid #E5E7EB", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}
              value={quickBlockFrom}
              onChange={(e) => setQuickBlockFrom(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>To</label>
            <input
              type="date"
              style={{ height: "36px", border: "1.5px solid #E5E7EB", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}
              value={quickBlockTo}
              onChange={(e) => setQuickBlockTo(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!quickBlockFrom || !quickBlockTo) return;
              const from = new Date(quickBlockFrom);
              const to = new Date(quickBlockTo);
              if (to < from) return;
              const newBlocks = [];
              const cursor = new Date(from);
              while (cursor <= to) {
                const d = new Date(cursor);
                d.setHours(0, 0, 0, 0);
                const alreadyBlocked = (blockedDates || []).some((b) => {
                  const bs = new Date(b.start);
                  bs.setHours(0, 0, 0, 0);
                  return bs.toDateString() === d.toDateString();
                });
                if (!alreadyBlocked) {
                  newBlocks.push({ start: d.toISOString(), end: new Date(d.getTime() + 86400000).toISOString(), reason: "personal" });
                }
                cursor.setDate(cursor.getDate() + 1);
              }
              onChange([...(blockedDates || []), ...newBlocks]);
              setQuickBlockFrom("");
              setQuickBlockTo("");
            }}
            style={{
              height: "36px", padding: "0 16px", borderRadius: "8px",
              background: "#0A1628", color: "#fff", border: "none",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Block Range
          </button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>Every</label>
            <select
              style={{ height: "36px", border: "1.5px solid #E5E7EB", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}
              value={recurringDay}
              onChange={(e) => setRecurringDay(e.target.value)}
            >
              <option value="">Select day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>From</label>
            <input
              type="date"
              style={{ height: "36px", border: "1.5px solid #E5E7EB", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}
              value={recurringFrom}
              onChange={(e) => setRecurringFrom(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px", color: "#6B7280", display: "block", marginBottom: "4px" }}>Until</label>
            <input
              type="date"
              style={{ height: "36px", border: "1.5px solid #E5E7EB", borderRadius: "8px", padding: "0 10px", fontSize: "13px" }}
              value={recurringTo}
              onChange={(e) => setRecurringTo(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!recurringDay || !recurringFrom || !recurringTo) return;
              const targetDay = DAY_INDEX[recurringDay];
              const from = new Date(recurringFrom);
              const to = new Date(recurringTo);
              if (to < from) return;
              const newBlocks = [];
              const cursor = new Date(from);
              while (cursor <= to) {
                if (cursor.getDay() === targetDay) {
                  const d = new Date(cursor);
                  d.setHours(0, 0, 0, 0);
                  const alreadyBlocked = (blockedDates || []).some((b) => {
                    const bs = new Date(b.start);
                    bs.setHours(0, 0, 0, 0);
                    return bs.toDateString() === d.toDateString();
                  });
                  if (!alreadyBlocked) {
                    newBlocks.push({ start: d.toISOString(), end: new Date(d.getTime() + 86400000).toISOString(), reason: "personal" });
                  }
                }
                cursor.setDate(cursor.getDate() + 1);
              }
              onChange([...(blockedDates || []), ...newBlocks]);
              setRecurringDay("");
              setRecurringFrom("");
              setRecurringTo("");
            }}
            style={{
              height: "36px", padding: "0 16px", borderRadius: "8px",
              background: "#0A1628", color: "#fff", border: "none",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}
          >
            Block All {recurringDay || "Selected Day"}s
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          type="button"
          onClick={() => setBlockMode("block")}
          style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            background: blockMode === "block" ? "#0A1628" : "#fff",
            color: blockMode === "block" ? "#fff" : "#0A1628",
            border: `1.5px solid ${blockMode === "block" ? "#0A1628" : "#E5E7EB"}`,
          }}
        >
          Block dates
        </button>
        <button
          type="button"
          onClick={() => setBlockMode("unblock")}
          style={{
            padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            background: blockMode === "unblock" ? "#0A1628" : "#fff",
            color: blockMode === "unblock" ? "#fff" : "#0A1628",
            border: `1.5px solid ${blockMode === "unblock" ? "#0A1628" : "#E5E7EB"}`,
          }}
        >
          Unblock dates
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center" }}>
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setBlockViewDate(new Date(blockViewDate.getFullYear(), blockViewDate.getMonth() - 1, 1))}
          style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}
        >
          ←
        </button>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "#0A1628" }}>
          {blockViewDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          {" – "}
          {new Date(blockViewDate.getFullYear(), blockViewDate.getMonth() + 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setBlockViewDate(new Date(blockViewDate.getFullYear(), blockViewDate.getMonth() + 1, 1))}
          style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", cursor: "pointer" }}
        >
          →
        </button>
      </div>

      {blockStart && (
        <p style={{ fontSize: "13px", color: "#2E58EC", marginBottom: "12px", fontWeight: "500" }}>
          Start selected: {blockStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — now click an end date
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {[blockViewDate, new Date(blockViewDate.getFullYear(), blockViewDate.getMonth() + 1, 1)].map((monthDate, monthIndex) => {
          const cells = getBlockDaysInMonth(monthDate);

          return (
            <div key={monthIndex}>
              <p style={{ fontSize: "14px", fontWeight: "700", color: "#0A1628", marginBottom: "12px" }}>
                {monthDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "8px" }}>
                {DAYS_SHORT.map((day) => (
                  <div key={day} style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", padding: "4px 0" }}>
                    {day}
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                {cells.map((date, index) => {
                  if (!date) return <div key={`empty-${monthIndex}-${index}`} />;
                  const isPast = date < blockCalendarToday;
                  const blocked = isBlockedDate(date);
                  const isStart = blockStart && date.toDateString() === blockStart.toDateString();

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleBlockDateClick(date)}
                      disabled={isPast}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "6px",
                        border: isStart ? "2px solid #2E58EC" : "none",
                        background: isPast ? "transparent" : blocked ? "#0A1628" : "transparent",
                        color: isPast ? "#D1D5DB" : blocked ? "#fff" : "#111827",
                        fontSize: "12px",
                        cursor: isPast ? "not-allowed" : "pointer",
                        fontWeight: blocked ? "700" : "400",
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "16px", marginTop: "16px", fontSize: "12px", color: "#6B7280" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#0A1628", display: "inline-block" }} />
          Blocked
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", border: "1px solid #E5E7EB", display: "inline-block" }} />
          Available
        </span>
      </div>
    </div>
  );
}
