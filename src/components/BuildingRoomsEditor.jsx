import { useState } from "react";
import { Link } from "react-router-dom";
import apiFetch from "../utils/apiClient";
import { MAX_UNITS, unitAvailability, unitPriceDisplay } from "../utils/buildingListing";
import RoomImportPanel from "./RoomImportPanel";

// Rooms of a building, inside EditSpace. Each room is a full listing: "Add
// room" opens the room flow in CreateSpace, "Edit" opens the room in EditSpace.
// Marking a room let / available and deleting a room save immediately.

const card = { background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px", marginBottom: "16px" };
const smallButton = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  background: "#fff",
  color: "#0A1628",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
};
const BADGE = {
  available: { background: "#DCFCE7", color: "#166534" },
  available_from: { background: "rgba(48,92,222,0.1)", color: "#305CDE" },
  let: { background: "#FEF3C7", color: "#92400E" },
};

export default function BuildingRoomsEditor({ buildingId, initialUnits }) {
  const [units, setUnits] = useState(initialUnits);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  const reload = async () => {
    const res = await apiFetch(`/properties/${buildingId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Couldn't refresh the rooms");
    setUnits((data.property || data).units || []);
  };

  // Runs one API call for a room, then refreshes the list.
  const run = async (busy, call) => {
    setError("");
    setBusyId(busy);
    try {
      const res = await call();
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || body.error || `Couldn't save the room (server error ${res.status}).`);
      }
      await reload();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const setLet = (unit, isLet) => {
    const body = new FormData();
    body.append("unitDetails", JSON.stringify({ availability: { status: isLet ? "let" : "available" } }));
    return run(unit._id, () => apiFetch(`/properties/${unit._id}`, { method: "PUT", body }));
  };

  const deleteUnit = async (unit) => {
    const ok = await run(unit._id, () => apiFetch(`/properties/units/${unit._id}`, { method: "DELETE" }));
    if (ok) setConfirmDeleteId(null);
  };

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0A1628", margin: 0 }}>Rooms</h3>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>
            {units.length} of {MAX_UNITS} rooms. Each room is a listing of its own that guests book directly; it uses the building's photos unless you add some to the room.
          </p>
        </div>
        {units.length >= MAX_UNITS ? null : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setImporting(true)} disabled={importing} style={{ ...smallButton, padding: "8px 16px" }}>
              Import rooms from a spreadsheet
            </button>
            <Link
              to={`/create-space?building=${buildingId}`}
              style={{ ...smallButton, background: "#0A1628", color: "#fff", border: "none", padding: "8px 16px" }}
            >
              + Add a room
            </Link>
          </div>
        )}
      </div>

      {importing && <RoomImportPanel buildingId={buildingId} onImported={reload} onClose={() => setImporting(false)} />}

      {units.length === 0 ? (
        <p style={{ color: "#92400E", fontSize: 13, background: "#FEF3C7", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
          Add a room to make this building visible. Guests can't see a building until it has a room.
        </p>
      ) : null}

      {error && (
        <p style={{ color: "#DC2626", fontSize: 13, background: "rgba(220,38,38,0.08)", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {units.map((unit) => {
          const details = unit.unitDetails || {};
          const availability = unitAvailability(details);
          const price = unitPriceDisplay(unit);
          const busy = busyId === unit._id;

          return (
            <div key={unit._id} style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 14, opacity: availability.key === "let" ? 0.75 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0A1628" }}>{details.label || unit.title}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6B7280" }}>
                    {price.price}
                    {price.suffix}
                    {details.sizeSqFt ? ` · ${details.sizeSqFt} sq ft` : ""}
                    {details.capacity ? ` · ${details.capacity} ${details.capacity === 1 ? "person" : "people"}` : ""}
                  </p>
                </div>
                <span style={{ ...BADGE[availability.key], fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>{availability.label}</span>
              </div>

              {confirmDeleteId === unit._id ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 13, color: "#374151" }}>Delete {details.label || unit.title}? This can't be undone.</span>
                  <button type="button" onClick={() => deleteUnit(unit)} disabled={busy} style={{ ...smallButton, background: "#DC2626", borderColor: "#DC2626", color: "#fff" }}>
                    {busy ? "Deleting..." : "Delete room"}
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)} disabled={busy} style={smallButton}>
                    Keep
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  <Link to={`/edit-space/${unit._id}`} style={smallButton}>
                    Edit
                  </Link>
                  <button type="button" onClick={() => setLet(unit, availability.key !== "let")} disabled={busy} style={smallButton}>
                    {busy ? "Saving..." : availability.key === "let" ? "Mark available" : "Mark let"}
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(unit._id)} disabled={busy} style={{ ...smallButton, color: "#DC2626" }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
