// Room import from a spreadsheet (CSV). Pure helpers, no React: a small CSV
// parser, the field list with its header aliases (auto-matching the file's
// columns), the cell cleaners and the row builder that turns the file into the
// rows POST /properties/:buildingId/units/import takes. The server validates
// every row again; a cell these cleaners cannot read is sent as the raw text
// so the server's dry run reports it against that row.

export const MAX_IMPORT_ROWS = 200;

// ---- CSV -----------------------------------------------------------------

// Text -> rows of cells. Handles a BOM, "quoted, fields", "" for a quote
// inside quotes, newlines inside quotes, and CRLF / LF / CR line ends.
export function parseCsv(text) {
  const raw = String(text || "");
  const src = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < src.length; i += 1) {
    const char = src[i];
    if (inQuotes) {
      if (char !== '"') field += char;
      else if (src[i + 1] === '"') {
        field += '"';
        i += 1;
      } else inQuotes = false;
    } else if (char === '"' && field === "") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const clean = (value) => String(value ?? "").trim();
const isEmptyRow = (cells) => cells.every((cell) => clean(cell) === "");

// CSV text -> { headers, rows: [{ cells, sourceRow }] }. The first non-empty
// line is the header row (trimmed); empty lines are ignored. sourceRow is the
// line's row number in the spreadsheet (1 = header), for the results table.
export function readTable(text) {
  const all = parseCsv(text);
  let start = all.findIndex((cells) => !isEmptyRow(cells));
  if (start >= 0 && /^sep=.?$/i.test(clean(all[start][0])) && all[start].slice(1).every((cell) => clean(cell) === "")) {
    start = all.findIndex((cells, i) => i > start && !isEmptyRow(cells)); // Excel's "sep=," line
  }
  if (start < 0) return { headers: [], rows: [] };
  const headers = all[start].map(clean);
  const rows = [];
  for (let i = start + 1; i < all.length; i += 1) {
    if (!isEmptyRow(all[i])) rows.push({ cells: all[i], sourceRow: i + 1 });
  }
  return { headers, rows };
}

// ---- Fields and column matching -----------------------------------------

// aliases: whole-header names (spaces and punctuation ignored). loose: words
// that match a header containing them ("Monthly Rent (excl. VAT)" has "rent").
export const FIELDS = [
  {
    key: "room", label: "Room name or number", required: true,
    aliases: ["room", "rooms", "room name", "room no", "room number", "room id", "room ref", "unit", "unit name", "unit no", "unit number", "unit id", "unit ref", "suite", "suite name", "suite no", "suite number", "space", "office", "office name", "office no", "office number", "name", "number", "no", "ref", "reference"],
    loose: ["room", "unit", "suite", "office", "space"],
  },
  {
    key: "pricePerMonth", label: "Price per month", required: true,
    aliases: ["rent", "price", "pcm", "pm", "rate", "cost", "rental", "monthly", "monthly rent", "monthly price", "monthly rate", "monthly cost", "rent pcm", "price pcm", "rent pm", "rent per month", "price per month", "per month", "rental price", "asking rent", "asking price", "licence fee", "license fee"],
    loose: ["rent", "price", "pcm", "cost", "rental", "per month", "licence fee", "license fee"],
  },
  {
    key: "vatStatus", label: "VAT", required: true,
    aliases: ["vat", "vat status", "vat treatment", "vat applicable", "vat included", "vat excluded", "vat ex", "vat inc", "plus vat", "inc vat", "tax", "tax status"],
    loose: ["vat", "tax"],
  },
  {
    key: "minTermMonths", label: "Minimum term (months)",
    aliases: ["term", "min term", "minimum term", "min term months", "minimum term months", "term months", "lease term", "min lease", "minimum lease", "min contract", "minimum contract", "contract length", "min stay", "minimum stay"],
    loose: ["min term", "minimum term", "lease term", "min lease", "minimum lease", "term"],
  },
  {
    key: "sizeSqFt", label: "Size (sq ft)",
    aliases: ["sq ft", "sqft", "sf", "size", "area", "size sq ft", "size sqft", "area sq ft", "area sqft", "floor area", "nia", "square feet", "sq feet", "square footage"],
    loose: ["sq ft", "sqft", "size", "area", "square feet", "nia"],
  },
  {
    key: "capacity", label: "Capacity (people)",
    aliases: ["desks", "capacity", "people", "pax", "persons", "seats", "headcount", "workstations", "desk capacity", "no of desks", "number of desks", "no of people", "number of people", "max people", "max desks"],
    loose: ["desks", "capacity", "people", "pax", "seats", "headcount", "workstations"],
  },
  {
    key: "features", label: "Features",
    aliases: ["amenities", "features", "notes", "key features", "facilities", "includes", "inclusions", "comments", "extras"],
    loose: ["amenities", "features", "facilities", "notes", "comments"],
  },
  {
    key: "status", label: "Status",
    aliases: ["status", "availability", "let", "let status", "letting status", "occupancy", "state", "available", "vacant"],
    loose: ["status", "availability", "occupancy"],
  },
  {
    key: "availableFrom", label: "Available from",
    aliases: ["available from", "vacant from", "date", "date available", "available date", "available on", "availability date", "vacancy date", "move in", "move in date", "ready date", "from"],
    loose: ["available from", "vacant from", "available date", "date available", "availability date", "move in"],
  },
  {
    key: "description", label: "Description",
    aliases: ["description", "desc", "details", "summary", "about", "overview", "room description", "unit description"],
    loose: ["description", "desc", "details", "summary"],
  },
];

// More specific fields first, so "Unit Price" is a price and "Suite Size" a size.
const LOOSE_ORDER = ["pricePerMonth", "vatStatus", "minTermMonths", "sizeSqFt", "capacity", "availableFrom", "status", "features", "description", "room"];

const words = (header) => clean(header).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const compact = (header) => words(header).replace(/ /g, "");

// headers -> { room: 0, pricePerMonth: 1, ..., description: -1 } (-1 = not found).
// Every header is used for at most one field.
export function autoMatchColumns(headers) {
  const mapping = Object.fromEntries(FIELDS.map((field) => [field.key, -1]));
  const used = new Set();
  const take = (key, index) => {
    mapping[key] = index;
    used.add(index);
  };

  for (const field of FIELDS) {
    const aliases = new Set(field.aliases.map((alias) => alias.replace(/ /g, "")));
    const index = headers.findIndex((header, i) => !used.has(i) && aliases.has(compact(header)));
    if (index >= 0) take(field.key, index);
  }
  for (const key of LOOSE_ORDER) {
    if (mapping[key] >= 0) continue;
    const field = FIELDS.find((f) => f.key === key);
    const index = headers.findIndex((header, i) => !used.has(i) && field.loose.some((phrase) => ` ${words(header)} `.includes(` ${phrase} `)));
    if (index >= 0) take(key, index);
  }
  return mapping;
}

// What still has to be chosen before the file can be checked.
export function mappingProblems(mapping, vatAll) {
  const problems = [];
  if (!(mapping.room >= 0)) problems.push("Choose the column with each room's name or number.");
  if (!(mapping.pricePerMonth >= 0)) problems.push("Choose the column with the price per month.");
  if (!(mapping.vatStatus >= 0) && !vatAll) problems.push("Say whether the prices include VAT, exclude VAT or have no VAT.");
  return problems;
}

// ---- Cell cleaners -------------------------------------------------------
// Each returns the cleaned value, undefined for an empty cell, or null when the
// cell has something in it that cannot be read.

const EMPTYISH = new Set(["", "-", "--", "n/a", "na", "tbc", "tba", "none", "nil", "null", "?"]);

// "£1,200", "1200.00", "1,200 pcm", "450 sq ft (42 m2)" -> a number. Two
// numbers in a cell ("4-6", "1,200 + 50") are ambiguous, so unreadable.
export function cleanNumber(value) {
  const text = clean(value).replace(/\([^)]*\)/g, " ");
  if (EMPTYISH.has(text.toLowerCase())) return undefined;
  const tokens = text.match(/-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|-?\.\d+/g) || [];
  return tokens.length === 1 ? Number(tokens[0].replace(/,/g, "")) : null;
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function isoDate(year, month, day) {
  const y = year < 100 ? 2000 + year : year;
  const date = new Date(Date.UTC(y, month - 1, day));
  return date.getUTCFullYear() === y && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date.toISOString().slice(0, 10)
    : null;
}

// The first date written in the text, as YYYY-MM-DD, or null. Understands
// 2027-03-01, 01/03/2027 (day first, UK; month first only when that is the sole
// valid reading), 1 March 2027, 1st Mar 27 and March 1, 2027.
export function findDate(value) {
  const text = clean(value).toLowerCase();
  let m = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) return isoDate(+m[1], +m[2], +m[3]);
  m = text.match(/\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})\b/);
  if (m) return isoDate(+m[3], +m[2], +m[1]) || isoDate(+m[3], +m[1], +m[2]);
  const monthName = (name) => MONTHS.indexOf(name.slice(0, 3)) + 1;
  m = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?[\s./-]+(?:of\s+)?([a-z]{3,9})\.?,?[\s./-]+(\d{4}|\d{2})\b/);
  if (m && monthName(m[2]) > 0) return isoDate(+m[3], monthName(m[2]), +m[1]);
  m = text.match(/\b([a-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/);
  if (m && monthName(m[1]) > 0) return isoDate(+m[3], monthName(m[1]), +m[2]);
  return null;
}

export function cleanDate(value) {
  const text = clean(value);
  if (EMPTYISH.has(text.toLowerCase())) return undefined;
  return findDate(text);
}

const LET_WORDS = /^(let|let agreed|let out|occupied|taken|leased|rented|reserved|under offer|unavailable|not available|full|sold|tenanted)$/;
const AVAILABLE_WORDS = /^(available|available now|available immediately|vacant|vacant now|now|immediately|immediate|empty|free|ready|ready now|to let|currently available)$/;
const FROM_ONLY = /^(available|vacant|ready)? ?(from|on)$/;

// A status cell -> { status: "available" | "let" } or, when it holds a date,
// { status: "available_from", availableFrom }.
export function cleanStatus(value) {
  const text = clean(value).toLowerCase().replace(/[^a-z0-9/.\- ]+/g, " ").replace(/\s+/g, " ").trim();
  if (!text || FROM_ONLY.test(text)) return undefined;
  if (LET_WORDS.test(text)) return { status: "let" };
  if (AVAILABLE_WORDS.test(text)) return { status: "available" };
  const date = findDate(text);
  return date ? { status: "available_from", availableFrom: date } : null;
}

// "Excl. VAT", "+VAT", "ex vat" -> excludes; "Inc VAT", "inclusive" -> includes;
// "No VAT", "exempt", "0%" -> none.
export function cleanVat(value) {
  const text = clean(value).toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  if (/(\bno vat\b|\bnone\b|\bnil\b|\bexempt\b|\bzero\b|^0%?$|\bvat free\b|\bnot applicable\b|^n ?\/? ?a$)/.test(text)) return "none";
  if (/(\bex\b|\bexc|\bplus\b|^\+|\+ ?vat|\bnet\b|\bbefore vat\b)/.test(text)) return "excludes";
  if (/(\binc|\bgross\b|\bwith vat\b)/.test(text)) return "includes";
  return null;
}

export const splitFeatures = (value) => [...new Set(clean(value).split(/[,;\n]/).map((item) => item.trim()).filter(Boolean))];

// ---- Rows ----------------------------------------------------------------

const todayIso = () => new Date().toISOString().slice(0, 10);

// The table + the chosen columns -> [{ payload, sourceRow }] for the import
// endpoint. vatAll ("excludes" | "includes" | "none") applies to every row
// when no VAT column is chosen. Rows with nothing in the chosen columns are
// ignored. An unreadable cell goes through as its raw text, for the server to
// reject with a message.
export function buildRows(table, mapping, { vatAll = "", today = todayIso() } = {}) {
  const rows = [];
  for (const { cells, sourceRow } of table.rows) {
    const cell = (key) => (mapping[key] >= 0 ? clean(cells[mapping[key]]) : "");
    if (FIELDS.every(({ key }) => cell(key) === "")) continue;

    const payload = {};
    const put = (key, value) => {
      if (value !== undefined && value !== "") payload[key] = value;
    };
    const numberOrRaw = (key) => {
      const n = cleanNumber(cell(key));
      return n === null ? cell(key) : n;
    };

    put("room", cell("room"));
    put("pricePerMonth", numberOrRaw("pricePerMonth"));
    if (mapping.vatStatus >= 0) {
      const vat = cleanVat(cell("vatStatus"));
      put("vatStatus", vat === null ? cell("vatStatus") : vat);
    } else {
      put("vatStatus", vatAll);
    }
    put("minTermMonths", numberOrRaw("minTermMonths"));
    put("sizeSqFt", numberOrRaw("sizeSqFt"));
    put("capacity", numberOrRaw("capacity"));
    const features = splitFeatures(cell("features"));
    if (features.length) payload.features = features;
    put("description", cell("description"));

    const status = cleanStatus(cell("status"));
    const date = cleanDate(cell("availableFrom"));
    if (status === null) {
      payload.status = cell("status"); // the server names the allowed values
    } else if (status?.status === "let") {
      payload.status = "let";
    } else {
      const from = status?.availableFrom || (typeof date === "string" ? date : undefined);
      if (from && from > today) {
        payload.status = "available_from";
        payload.availableFrom = from;
      } else if (from || status) {
        payload.status = "available";
      }
      if (date === null && !from) {
        payload.status = "available_from";
        payload.availableFrom = cell("availableFrom");
      }
    }
    rows.push({ payload, sourceRow });
  }
  return rows;
}

// ---- Template ------------------------------------------------------------

export const TEMPLATE_ROWS = [
  ["Room", "Price per month", "VAT", "Minimum term (months)", "Size (sq ft)", "Capacity", "Features", "Status", "Available from", "Description"],
  ["Suite 101", "£1,200", "Excl. VAT", "6", "450", "6", "Meeting room, Kitchenette", "Available", "", "Corner suite with natural light"],
  ["Suite 102", "£950", "Incl. VAT", "12", "320", "4", "Air conditioning, Lift access", "Available from", "2027-03-01", "Quiet room at the back"],
];
