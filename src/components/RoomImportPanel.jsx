import { useMemo, useRef, useState } from "react";
import apiFetch from "../utils/apiClient";
import { downloadCsv } from "../utils/csv";
import { FIELDS, MAX_IMPORT_ROWS, TEMPLATE_ROWS, autoMatchColumns, buildRows, mappingProblems, readTable } from "../utils/roomImport";

// "Import rooms from a spreadsheet", inside the Rooms section of EditSpace.
// Choose a CSV -> match its columns to the room fields -> check it (a dry run:
// the server says what it would create, skip as a duplicate, or reject, and
// writes nothing) -> confirm. Existing rooms are never changed.

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const VAT_CHOICES = [
  ["excludes", "Excluding VAT (VAT is added on top)"],
  ["includes", "Including VAT"],
  ["none", "No VAT charged"],
];
const RESULT_STYLE = {
  create: { label: "Will create", background: "#DCFCE7", color: "#166534" },
  created: { label: "Created", background: "#DCFCE7", color: "#166534" },
  duplicate: { label: "Duplicate, skipped", background: "#FEF3C7", color: "#92400E" },
  error: { label: "Error", background: "rgba(220,38,38,0.1)", color: "#B91C1C" },
};

const box = { border: "1px solid #E5E7EB", borderRadius: 12, padding: 16, marginBottom: 16, background: "#F9FAFB" };
const heading = { fontSize: 14, fontWeight: 700, color: "#0A1628", margin: "0 0 8px" };
const hint = { fontSize: 13, color: "#6B7280", margin: "0 0 8px" };
const button = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1.5px solid #E5E7EB",
  background: "#fff",
  color: "#0A1628",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const primaryButton = { ...button, background: "#0A1628", borderColor: "#0A1628", color: "#fff" };
const linkButton = { background: "none", border: "none", padding: 0, color: "#305CDE", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "underline" };
const select = { padding: "8px 10px", borderRadius: 8, border: "1.5px solid #E5E7EB", fontSize: 13, background: "#fff", color: "#0A1628", minWidth: 200, maxWidth: "100%" };
const cell = { padding: "6px 10px", textAlign: "left", fontSize: 13, color: "#374151", borderBottom: "1px solid #E5E7EB", verticalAlign: "top" };

const columnLetter = (index) => {
  let n = index + 1;
  let letters = "";
  while (n > 0) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
};

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const ErrorNote = ({ children }) => (
  <p role="alert" style={{ color: "#DC2626", fontSize: 13, background: "rgba(220,38,38,0.08)", padding: "10px 14px", borderRadius: 8, margin: "0 0 12px" }}>
    {children}
  </p>
);

function ResultsTable({ results, rows }) {
  if (!results.length) return null;
  return (
    <div style={{ maxHeight: 320, overflow: "auto", border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", marginTop: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Row", "Room", "Result", "Details"].map((name) => (
              <th key={name} style={{ ...cell, fontWeight: 700, color: "#0A1628", position: "sticky", top: 0, background: "#F3F4F6" }}>
                {name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((result) => {
            const style = RESULT_STYLE[result.status] || RESULT_STYLE.error;
            return (
              <tr key={result.row}>
                <td style={cell}>{rows[result.row - 1]?.sourceRow ?? result.row}</td>
                <td style={{ ...cell, fontWeight: 600, wordBreak: "break-word" }}>{result.room || "(no name)"}</td>
                <td style={cell}>
                  <span style={{ background: style.background, color: style.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap" }}>{style.label}</span>
                </td>
                <td style={{ ...cell, wordBreak: "break-word" }}>{result.errors?.length ? result.errors.join("; ") : result.reason || ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RoomImportPanel({ buildingId, onImported, onClose }) {
  const [fileName, setFileName] = useState("");
  const [table, setTable] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [vatAll, setVatAll] = useState("");
  // map -> checking -> preview -> importing -> done
  const [phase, setPhase] = useState("choose");
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const busy = useRef(false);

  const rows = useMemo(() => (table && mapping ? buildRows(table, mapping, { vatAll }) : []), [table, mapping, vatAll]);
  const problems = mapping ? mappingProblems(mapping, vatAll) : [];
  const working = phase === "checking" || phase === "importing";

  const chooseFile = async (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setError("");
    setNote("");
    setResult(null);
    setConfirming(false);
    setTable(null);
    setMapping(null);
    setPhase("choose");
    setFileName(file.name);
    try {
      if (/\.xlsx?$/i.test(file.name) || (/spreadsheetml|ms-excel/.test(file.type) && !/\.csv$/i.test(file.name))) {
        throw new Error("That's an Excel file. Export the sheet as CSV first (Excel: File, Save As, CSV; Google Sheets: File, Download, Comma-separated values), then choose the CSV.");
      }
      if (file.size > MAX_FILE_BYTES) throw new Error("That file is too large (2 MB at most). Split it into smaller files.");
      const parsed = readTable(await file.text());
      if (!parsed.headers.length || !parsed.rows.length) throw new Error("No rooms found in that file. The first row must be the column headings, with one room per row below it.");
      if (parsed.rows.length > MAX_IMPORT_ROWS) {
        throw new Error(`That file has ${parsed.rows.length} rows; at most ${MAX_IMPORT_ROWS} can be imported at once. Split it into smaller files.`);
      }
      setTable(parsed);
      setMapping(autoMatchColumns(parsed.headers));
      setPhase("map");
    } catch (err) {
      setError(err.message || "Couldn't read that file.");
    } finally {
      input.value = ""; // so choosing the same file again works
    }
  };

  // Any change to the columns means the last check no longer applies.
  const changeMapping = (update) => {
    setMapping((current) => ({ ...current, ...update }));
    backToMapping();
  };
  const backToMapping = () => {
    if (working) return;
    setResult(null);
    setConfirming(false);
    setError("");
    setPhase("map");
  };

  const send = async (dryRun) => {
    const res = await apiFetch(`/properties/${buildingId}/units/import`, {
      method: "POST",
      body: JSON.stringify({ rows: rows.map((row) => row.payload), dryRun }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || body.message || `The import failed (server error ${res.status}).`);
    return body;
  };

  const run = async (dryRun) => {
    if (busy.current) return; // double click
    busy.current = true;
    setError("");
    setNote("");
    setPhase(dryRun ? "checking" : "importing");
    try {
      const body = await send(dryRun);
      setResult(body);
      setConfirming(false);
      setPhase(dryRun ? "preview" : "done");
      if (!dryRun && body.summary?.create > 0) {
        try {
          await onImported?.();
        } catch {
          setNote("The rooms were created, but the list above couldn't refresh. Reload the page to see them.");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Nothing was imported.");
      setPhase(dryRun ? "map" : "preview");
    } finally {
      busy.current = false;
    }
  };

  const check = () => {
    if (problems.length) return setError(problems[0]);
    if (!rows.length) return setError("No rooms found in the chosen columns.");
    if (rows.length > MAX_IMPORT_ROWS) return setError(`That's ${rows.length} rooms; at most ${MAX_IMPORT_ROWS} can be imported at once.`);
    return run(true);
  };

  const toCreate = result?.summary?.create || 0;
  const sample = (key) => (mapping[key] >= 0 ? table.rows.map((row) => String(row.cells[mapping[key]] ?? "").trim()).find(Boolean) : "");

  return (
    <div style={{ ...box, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div>
          <h4 style={{ ...heading, fontSize: 15, margin: 0 }}>Import rooms from a spreadsheet</h4>
          <p style={{ ...hint, margin: "4px 0 0" }}>
            Add many rooms at once from a CSV file. Rooms that are already in this building are skipped, never changed.
          </p>
        </div>
        <button type="button" onClick={onClose} disabled={working} style={button}>
          {phase === "done" ? "Close" : "Cancel"}
        </button>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {note && <p style={{ ...hint, color: "#92400E" }}>{note}</p>}

      {phase !== "done" && (
        <div style={box}>
          <p style={heading}>1. Choose your file</p>
          <p style={hint}>
            A .csv file with the column headings in the first row. In Excel or Google Sheets, save or download the sheet as CSV.{" "}
            <button type="button" style={linkButton} onClick={() => downloadCsv("room-import-template.csv", TEMPLATE_ROWS)}>
              Download a CSV template
            </button>
          </p>
          <input type="file" accept=".csv,text/csv" onChange={chooseFile} disabled={working} aria-label="Choose a CSV file" />
          {table && (
            <p style={{ ...hint, margin: "8px 0 0" }}>
              {fileName}: {plural(table.rows.length, "row")} found.
            </p>
          )}
        </div>
      )}

      {table && mapping && phase !== "done" && (
        <div style={box}>
          <p style={heading}>2. Match your columns</p>
          <p style={hint}>We've matched what we could. Check each one, and change any that are wrong.</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(150px, 220px) minmax(200px, 1fr)", gap: "10px 16px", alignItems: "center" }}>
            {FIELDS.map((field) => {
              const id = `room-import-${field.key}`;
              const example = sample(field.key);
              return (
                <div key={field.key} style={{ display: "contents" }}>
                  <label htmlFor={id} style={{ fontSize: 13, fontWeight: 600, color: "#0A1628" }}>
                    {field.label}
                    {field.required && <span style={{ color: "#DC2626" }}> *</span>}
                  </label>
                  <div>
                    <select id={id} value={mapping[field.key]} onChange={(e) => changeMapping({ [field.key]: Number(e.target.value) })} disabled={working} style={select}>
                      <option value={-1}>{field.key === "vatStatus" ? "No VAT column in my file" : field.required ? "Choose a column..." : "Not in my file"}</option>
                      {table.headers.map((header, index) => (
                        <option key={index} value={index}>
                          {header || `(blank heading, column ${columnLetter(index)})`}
                        </option>
                      ))}
                    </select>
                    {example && <span style={{ fontSize: 12, color: "#6B7280", marginLeft: 10 }}>e.g. {example.length > 40 ? `${example.slice(0, 40)}...` : example}</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {mapping.vatStatus < 0 && (
            <div style={{ marginTop: 14 }}>
              <label htmlFor="room-import-vat-all" style={{ fontSize: 13, fontWeight: 600, color: "#0A1628", display: "block", marginBottom: 6 }}>
                All prices are: <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <select
                id="room-import-vat-all"
                value={vatAll}
                onChange={(e) => {
                  setVatAll(e.target.value);
                  backToMapping();
                }}
                disabled={working}
                style={select}
              >
                <option value="">Choose...</option>
                {VAT_CHOICES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <button type="button" onClick={check} disabled={working || problems.length > 0 || phase === "preview"} style={{ ...primaryButton, opacity: working || problems.length > 0 || phase === "preview" ? 0.5 : 1 }}>
              {phase === "checking" ? "Checking..." : "Check the file"}
            </button>
            <span style={{ fontSize: 12, color: "#6B7280" }}>Checking only shows what would happen. Nothing is saved yet.</span>
          </div>
          {problems.length > 0 && <p style={{ ...hint, margin: "8px 0 0", color: "#92400E" }}>{problems[0]}</p>}
        </div>
      )}

      {result && phase !== "done" && (
        <div style={box} aria-live="polite">
          <p style={heading}>3. Check the results</p>
          <p style={{ ...hint, color: "#0A1628" }}>
            <strong>{plural(result.summary.create, "room")}</strong> will be created, <strong>{plural(result.summary.duplicate, "duplicate")}</strong> skipped,{" "}
            <strong>{plural(result.summary.error, "error")}</strong>. Rows with errors are not imported; fix them in your file and choose it again, or import the rest now.
          </p>
          <ResultsTable results={result.results} rows={rows} />
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {confirming ? (
              <>
                <span style={{ fontSize: 13, color: "#374151" }}>
                  Create {plural(toCreate, "room")} in this building? Existing rooms won't be changed.
                </span>
                <button type="button" onClick={() => run(false)} disabled={working} style={primaryButton}>
                  {phase === "importing" ? "Importing..." : `Yes, import ${plural(toCreate, "room")}`}
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={working} style={button}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setConfirming(true)} disabled={toCreate === 0 || working} style={{ ...primaryButton, opacity: toCreate === 0 ? 0.5 : 1 }}>
                  Import {plural(toCreate, "room")}
                </button>
                <button type="button" onClick={backToMapping} disabled={working} style={button}>
                  Change the columns
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {result && phase === "done" && (
        <div style={box} aria-live="polite">
          <p style={heading}>Import finished</p>
          <p style={{ ...hint, color: "#0A1628" }}>
            <strong>{plural(result.summary.create, "room")}</strong> created, <strong>{plural(result.summary.duplicate, "duplicate")}</strong> skipped,{" "}
            <strong>{plural(result.summary.error, "error")}</strong>.
            {result.summary.error > 0 ? " Rows with errors were not imported; fix them in your file and import it again (rooms already created are skipped)." : ""}
          </p>
          <ResultsTable results={result.results} rows={rows} />
          <div style={{ marginTop: 14 }}>
            <button type="button" onClick={onClose} style={primaryButton}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
