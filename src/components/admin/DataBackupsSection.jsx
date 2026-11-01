import { useCallback, useEffect, useState } from "react";
import { Database, Download, RotateCcw } from "lucide-react";

// Admin -> Data and backups (build spec section 9.2): download a full export
// or CSVs, see the weekly backups (kept in Documents/Backups), check the
// mirror databases, and restore from an export -- always a dry run first,
// then a typed confirmation. Server: routes/adminData.js (full admins only).
const API = () => `${import.meta.env.VITE_API_URL}/admin/data`;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("vencome_token")}` });
const CSVS = [
  ["users.csv", "Users"],
  ["listings.csv", "Listings"],
  ["bookings.csv", "Bookings"],
  ["payments.csv", "Payments"],
  ["messages.csv", "Messages"],
];
const when = (d) => (d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—");
const today = () => new Date().toISOString().slice(0, 10);

const card = "rounded-2xl border border-[#E5E7EB] bg-white p-5";
const button = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold text-[#111827] disabled:opacity-50";

export default function DataBackupsSection({ onToast }) {
  const [busy, setBusy] = useState("");
  const [backups, setBackups] = useState([]);
  const [mirrors, setMirrors] = useState(null);
  const [plan, setPlan] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const loadBackups = useCallback(async () => {
    const res = await fetch(`${API()}/backups`, { headers: authHeaders() });
    if (res.ok) setBackups((await res.json()).backups || []);
  }, []);

  useEffect(() => {
    loadBackups();
    fetch(`${API()}/mirrors`, { headers: authHeaders() })
      .then((res) => (res.ok ? res.json() : null))
      .then(setMirrors)
      .catch(() => setMirrors(null));
  }, [loadBackups]);

  const download = async (path, fileName) => {
    setBusy(fileName);
    try {
      const res = await fetch(`${API()}${path}`, { headers: authHeaders() });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Download failed");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(await res.blob());
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy("");
    }
  };

  const downloadBackup = async (doc) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/documents/${doc._id}/download`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (res.ok) window.location.href = data.url;
    else onToast(data.error || "Download failed");
  };

  const runBackup = async () => {
    setBusy("backup");
    const res = await fetch(`${API()}/backups/run`, { method: "POST", headers: authHeaders() });
    setBusy("");
    onToast(res.ok ? "Backup saved to Documents/Backups" : "Backup failed");
    loadBackups();
  };

  const dryRun = async (file) => {
    if (!file) return;
    setBusy("dry-run");
    setPlan(null);
    setConfirmText("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API()}/restore/dry-run`, { method: "POST", headers: authHeaders(), body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't read the export");
      setPlan(data);
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy("");
    }
  };

  const applyRestore = async () => {
    setBusy("apply");
    try {
      const res = await fetch(`${API()}/restore/apply`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ token: plan.token, confirm: "true" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Restore failed");
      const totals = Object.values(data.result).reduce((t, r) => ({ added: t.added + r.added, changed: t.changed + r.changed }), { added: 0, changed: 0 });
      onToast(`Restored: ${totals.added} added, ${totals.changed} updated`);
      setPlan(null);
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy("");
      setConfirmText("");
    }
  };

  const changes = plan ? Object.entries(plan.summary).filter(([, s]) => s.add || s.change || s.skipped) : [];

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Data and backups</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">Exports never include password hashes, tokens or one-time codes.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={card}>
          <h3 className="mb-1 text-[15px] font-bold text-[#0A1628]">Export</h3>
          <p className="mb-4 text-[13px] text-[#6B7280]">Everything as a zip (JSON per collection, plus CSVs), or one CSV.</p>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => download("/export", `vencome-export-${today()}.zip`)}
            className="mb-3 inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0A1628] px-3 text-[13px] font-semibold text-white disabled:opacity-50"
          >
            <Download size={14} /> {busy.endsWith(".zip") ? "Preparing…" : "Download full export (zip)"}
          </button>
          <div className="flex flex-wrap gap-2">
            {CSVS.map(([file, label]) => (
              <button key={file} type="button" disabled={!!busy} onClick={() => download(`/csv/${file}`, file.replace(".csv", `-${today()}.csv`))} className={button}>
                {label} CSV
              </button>
            ))}
          </div>
        </div>

        <div className={card}>
          <h3 className="mb-1 text-[15px] font-bold text-[#0A1628]">Mirror databases</h3>
          <p className="mb-4 text-[13px] text-[#6B7280]">The two backup databases the platform copies to every 24 hours.</p>
          {!mirrors?.configured ? (
            <p className="text-[13px] text-[#B45309]">Not connected yet — the mirrors' read-only connection details need adding to the server (BACKUP_MIRROR_URIS).</p>
          ) : (
            mirrors.mirrors.map((m) => (
              <p key={m.name} className="flex items-center gap-2 text-[13px]">
                <Database size={14} className="text-[#305CDE]" />
                <strong>{m.name}:</strong> {m.ok ? `newest data ${when(m.latestData)}` : <span className="text-[#DC2626]">unreachable ({m.error})</span>}
              </p>
            ))
          )}
        </div>

        <div className={card}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[#0A1628]">Weekly backups</h3>
            <button type="button" disabled={!!busy} onClick={runBackup} className={button}>
              {busy === "backup" ? "Saving…" : "Back up now"}
            </button>
          </div>
          <p className="mb-3 text-[13px] text-[#6B7280]">Every Sunday at 03:00, saved to Documents/Backups. The last 8 are kept.</p>
          {backups.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">No backups yet.</p>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {backups.map((b) => (
                <div key={b._id} className="flex items-center justify-between py-2 text-[13px]">
                  <span>
                    {b.name} · {(b.size / 1048576).toFixed(1)} MB
                  </span>
                  <button type="button" onClick={() => downloadBackup(b)} className="font-semibold text-[#305CDE]">Download</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={card}>
          <h3 className="mb-1 text-[15px] font-bold text-[#0A1628]">Restore from an export</h3>
          <p className="mb-3 text-[13px] text-[#6B7280]">
            Shows exactly what would change first. It adds missing records and updates changed ones — it never deletes anything, and never
            touches passwords or tokens.
          </p>
          <label className={`${button} cursor-pointer`}>
            <RotateCcw size={14} /> {busy === "dry-run" ? "Checking…" : "Choose an export zip (dry run)"}
            <input type="file" accept=".zip" hidden disabled={!!busy} onChange={(e) => dryRun(e.target.files?.[0])} />
          </label>

          {plan && (
            <div className="mt-4 rounded-xl bg-[#F8F6F0] p-4 text-[13px]">
              <p className="mb-2 font-semibold text-[#0A1628]">Dry run — export from {when(plan.exportCreatedAt)}</p>
              {changes.length === 0 ? (
                <p>Nothing to change — the database already matches this export.</p>
              ) : (
                <table className="mb-3 w-full">
                  <thead>
                    <tr className="text-left text-[11px] uppercase text-[#6B7280]">
                      <th className="py-1">Collection</th>
                      <th>Add</th>
                      <th>Update</th>
                      <th>Fields changed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changes.map(([name, s]) => (
                      <tr key={name} className="border-t border-[#E5E7EB] align-top">
                        <td className="py-1 font-semibold">{name}</td>
                        <td>{s.add}</td>
                        <td>{s.change}</td>
                        <td className="text-[#6B7280]">{s.note || (s.changedFields || []).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {changes.some(([, s]) => s.add || s.change) && (
                <>
                  <p className="mb-2 text-[#B45309]">Type RESTORE to apply these changes to the live database.</p>
                  <div className="flex gap-2">
                    <input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="h-9 rounded-lg border border-[#E5E7EB] px-3"
                      placeholder="RESTORE"
                    />
                    <button
                      type="button"
                      disabled={confirmText !== "RESTORE" || !!busy}
                      onClick={applyRestore}
                      className="h-9 rounded-lg bg-[#DC2626] px-4 font-semibold text-white disabled:opacity-40"
                    >
                      {busy === "apply" ? "Restoring…" : "Apply restore"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
