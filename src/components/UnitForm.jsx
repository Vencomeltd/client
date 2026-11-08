import PriceTaxFields from "./PriceTaxFields";

// The fields for one room (unit) of a building listing: name, monthly price
// with VAT/utilities, size, capacity, features and availability. Controlled:
// `value` is the unit form state from utils/buildingListing.js, `onChange`
// receives a patch. Used by CreateSpace's Rooms step and EditSpace.

const fieldStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  fontSize: 14,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};
const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

export default function UnitForm({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <label style={labelStyle}>Room name or number</label>
        <input
          value={value.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Unit 1.04"
          maxLength={80}
          style={fieldStyle}
        />
      </div>

      <div>
        <label style={{ ...labelStyle, fontSize: 13, color: "#0A1628" }}>Monthly price (£)</label>
        <input
          type="number"
          min="0"
          placeholder="0.00"
          value={value.price}
          onChange={(e) => onChange({ price: e.target.value })}
          onWheel={(e) => e.target.blur()}
          style={{ ...fieldStyle, maxWidth: 200 }}
        />
        <PriceTaxFields value={value} onChange={onChange} unit="month" />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Size (sq ft)</label>
          <input
            type="number"
            min="0"
            value={value.sizeSqFt}
            onChange={(e) => onChange({ sizeSqFt: e.target.value })}
            onWheel={(e) => e.target.blur()}
            style={fieldStyle}
          />
        </div>
        <div style={{ flex: "1 1 140px" }}>
          <label style={labelStyle}>Capacity (people)</label>
          <input
            type="number"
            min="0"
            value={value.capacity}
            onChange={(e) => onChange({ capacity: e.target.value })}
            onWheel={(e) => e.target.blur()}
            style={fieldStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Key features (comma separated)</label>
        <textarea
          rows={2}
          value={value.features}
          onChange={(e) => onChange({ features: e.target.value })}
          placeholder="e.g. Natural light, Air conditioning, Own lockable door"
          style={{ ...fieldStyle, fontFamily: "inherit", resize: "vertical" }}
        />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 180px" }}>
          <label style={labelStyle}>Availability</label>
          <select value={value.availStatus} onChange={(e) => onChange({ availStatus: e.target.value })} style={fieldStyle}>
            <option value="available">Available now</option>
            <option value="available_from">Available from a date</option>
            <option value="let">Let</option>
          </select>
        </div>
        {value.availStatus === "available_from" && (
          <div style={{ flex: "1 1 160px" }}>
            <label style={labelStyle}>Available from</label>
            <input
              type="date"
              value={value.availableFrom}
              onChange={(e) => onChange({ availableFrom: e.target.value })}
              style={fieldStyle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
