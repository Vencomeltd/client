// CSV for spreadsheet export. Every cell is quoted (quotes doubled), and a
// cell starting with = + - @ (or tab/CR) gets a leading ' so Excel/Sheets
// show it as text instead of running it as a formula.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  let text = value === null || value === undefined ? "" : String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename, rows) {
  // BOM so Excel opens UTF-8 (e.g. £) correctly.
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
