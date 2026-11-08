import { useState } from "react";
import UnitForm from "./UnitForm";
import apiFetch from "../utils/apiClient";
import { MAX_UNITS, emptyUnit, unitAvailability, unitPriceDisplay, unitToForm, unitToPayload, validateUnit } from "../utils/buildingListing";

// Rooms (units) of a building, inside EditSpace. Unlike the rest of the edit
// page these save immediately, one room at a time, through the unit
// endpoints; "Save Changes" only covers the building itself.

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
};
const BADGE = {
  available: { background: "#DCFCE7", color: "#166534" },
  available_from: { background: "rgba(48,92,222,0.1)", color: "#305CDE" },
  let: { background: "#FEF3C7", color: "#92400E" },
};

export default function BuildingRoomsEditor({ buildingId, initialUnits }) {
  const [units, setUnits] = useState(initialUnits);
  // The room being added or edited (unit form state), or null.
  const [editing, setEditing] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);
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

  const saveEditing = async () => {
    const problem = validateUnit(editing);
    if (problem) {
      setError(problem);
      return;
    }
    const body = JSON.stringify(unitToPayload(editing));
    const ok = await run(
      editing._id || "new",
      () => apiFetch(editing._id ? `/properties/units/${editing._id}` : `/properties/${buildingId}/units`, { method: editing._id ? "PUT" : "POST", body })
    );
    if (ok) setEditing(null);
  };

  const setLet = (unit, isLet) =>
    run(unit._id, () =>
      apiFetch(`/properties/units/${unit._id}`, {
        method: "PUT",
        body: JSON.stringify(unitToPayload({ ...unitToForm(unit), availStatus: isLet ? "let" : "available", availableFrom: "" })),
      })
    );

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
            {units.length} of {MAX_UNITS} rooms. Changes here save straight away; guests see the building's photos for every room.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError("");
            setEditing(emptyUnit());
          }}
          disabled={units.length >= MAX_UNITS || Boolean(editing)}
          style={{ ...smallButton, background: "#0A1628", color: "#fff", border: "none", padding: "8px 16px", opacity: editing ? 0.5 : 1 }}
        >
          + Add a room
        </button>
      </div>

      {error && (
        <p style={{ color: "#DC2626", fontSize: 13, background: "rgba(220,38,38,0.08)", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
          {error}
        </p>
      )}

      {editing && !editing._id && (
        <RoomEditor value={editing} setValue={setEditing} onSave={saveEditing} onCancel={() => { setEditing(null); setError(""); }} saving={busyId === "new"} />
      )}

      {units.length === 0 && !editing ? (
        <p style={{ border: "1.5px dashed #E5E7EB", borderRadius: 12, padding: 24, textAlign: "center", color: "#9CA3AF", fontSize: 14, margin: 0 }}>
          No rooms yet. Click "Add a room" to add one.
        </p>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {units.map((unit) => {
          const details = unit.unitDetails || {};
          const availability = unitAvailability(details);
          const price = unitPriceDisplay(unit);
          const busy = busyId === unit._id;

          if (editing?._id === unit._id) {
            return (
              <RoomEditor key={unit._id} value={editing} setValue={setEditing} onSave={saveEditing} onCancel={() => { setEditing(null); setError(""); }} saving={busy} />
            );
          }

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
                  <button type="button" onClick={() => { setError(""); setEditing(unitToForm(unit)); }} disabled={busy || Boolean(editing)} style={smallButton}>
                    Edit
                  </button>
                  <button type="button" onClick={() => setLet(unit, availability.key !== "let")} disabled={busy || Boolean(editing)} style={smallButton}>
                    {busy ? "Saving..." : availability.key === "let" ? "Mark available" : "Mark let"}
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(unit._id)} disabled={busy || Boolean(editing)} style={{ ...smallButton, color: "#DC2626" }}>
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

function RoomEditor({ value, setValue, onSave, onCancel, saving }) {
  return (
    <div style={{ border: "1.5px solid #305CDE", borderRadius: 12, padding: 16, marginBottom: 12, background: "#FAFBFF" }}>
      <p style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0A1628" }}>{value._id ? "Edit room" : "New room"}</p>
      <UnitForm value={value} onChange={(patch) => setValue((current) => ({ ...current, ...patch }))} />
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button type="button" onClick={onSave} disabled={saving} style={{ ...smallButton, background: "#0A1628", color: "#fff", border: "none", padding: "8px 18px" }}>
          {saving ? "Saving..." : "Save room"}
        </button>
        <button type="button" onClick={onCancel} disabled={saving} style={smallButton}>
          Cancel
        </button>
      </div>
    </div>
  );
}
