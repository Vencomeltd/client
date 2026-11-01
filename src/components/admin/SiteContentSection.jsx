import { useCallback, useEffect, useRef, useState } from "react";
import RichText from "../RichText";
import { SITE_CONTENT_BLOCKS, SITE_CONTENT_GROUPS } from "../../content/siteContent";

// Admin -> Site content (build spec section 8). Every editable block on the
// site, grouped by page: edit, preview, publish (live without a redeploy),
// reset to the default, and restore earlier versions. Server:
// routes/siteContent.js; defaults: src/content/siteContent.js.
const api = (path = "", options = {}) =>
  fetch(`${import.meta.env.VITE_API_URL}/admin/site-content${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("vencome_token")}` },
  });

const personName = (user) => user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "admin";
const when = (date) => (date ? new Date(date).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "");

function BlockEditor({ block, saved, onChanged, onToast }) {
  const live = saved?.value ?? block.default;
  const [draft, setDraft] = useState(live);
  const [busy, setBusy] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => setDraft(live), [live]);

  const tooLong = draft.length > block.max;
  const changed = draft !== live;

  const wrapSelection = (before, after) => {
    const el = inputRef.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = draft.slice(start, end) || "text";
    setDraft(draft.slice(0, start) + before + selected + after + draft.slice(end));
  };

  const addLink = () => {
    const url = window.prompt("Link address (https://…, mailto:… or a site path like /search)");
    if (url && /^(https?:\/\/|mailto:|\/)/.test(url.trim())) wrapSelection("[", `](${url.trim()})`);
  };

  const run = async (request, message) => {
    setBusy(true);
    try {
      const res = await request();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      onToast(message);
      onChanged();
    } catch (err) {
      onToast(err.message);
    } finally {
      setBusy(false);
    }
  };

  const publish = () => run(() => api(`/${block.key}`, { method: "PUT", body: JSON.stringify({ value: draft }) }), "Published — live on the site now");
  const reset = () => {
    if (!window.confirm(`Put "${block.label}" back to the default wording? The current version stays in the history.`)) return;
    run(() => api(`/${block.key}`, { method: "DELETE" }), "Back to the default wording");
  };
  const restore = (version) => {
    if (!window.confirm(`Restore the version from ${when(version.at)}? The current version stays in the history.`)) return;
    run(() => api(`/${block.key}/restore`, { method: "POST", body: JSON.stringify({ historyId: version._id }) }), "Version restored");
  };

  const field = { width: "100%", padding: "10px 12px", border: `1.5px solid ${tooLong ? "#DC2626" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" };
  const smallBtn = { padding: "4px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14px] font-bold text-[#0A1628]">
            {block.label}
            {block.seo && <span className="ml-2 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-semibold text-[#305CDE]">SEO</span>}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">{block.key}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${saved?.value != null ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#F3F4F6] text-[#6B7280]"}`}>
          {saved?.value != null ? `Edited · ${personName(saved.updatedBy)}, ${when(saved.updatedAt)}` : "Default wording"}
        </span>
      </div>

      {block.rich && (
        <div className="mb-2 flex gap-2">
          <button type="button" style={smallBtn} onClick={() => wrapSelection("**", "**")}>Bold</button>
          <button type="button" style={smallBtn} onClick={addLink}>Link</button>
          <span className="self-center text-[11px] text-[#9CA3AF]">Blank line = new paragraph</span>
        </div>
      )}
      <textarea ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)} rows={block.max > 300 ? 8 : block.max > 100 ? 3 : 1} style={field} />
      <p className={`mt-1 text-right text-[12px] ${tooLong ? "font-semibold text-[#DC2626]" : "text-[#9CA3AF]"}`}>
        {draft.length} / {block.max}
      </p>

      {changed && (
        <div className="mt-2 rounded-xl bg-[#F8F6F0] p-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">Preview</p>
          <div className="text-[14px] leading-6 text-[#0A1628]">
            {block.rich ? <RichText value={draft} paragraphStyle={{ margin: "0 0 10px" }} linkStyle={{ color: "#305CDE" }} /> : draft}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={publish}
          disabled={busy || !changed || tooLong || !draft.trim()}
          className="h-9 rounded-lg bg-[#0A1628] px-4 text-[13px] font-semibold text-white disabled:opacity-40"
        >
          Publish
        </button>
        {changed && (
          <button type="button" onClick={() => setDraft(live)} className="h-9 rounded-lg border border-[#E5E7EB] px-4 text-[13px] font-semibold text-[#111827]">
            Discard changes
          </button>
        )}
        {saved?.value != null && (
          <button type="button" onClick={reset} disabled={busy} className="h-9 rounded-lg border border-[#FCA5A5] px-4 text-[13px] font-semibold text-[#DC2626]">
            Reset to default
          </button>
        )}
        {saved?.history?.length > 0 && (
          <button type="button" onClick={() => setShowHistory((v) => !v)} className="h-9 px-2 text-[13px] font-semibold text-[#305CDE]">
            {showHistory ? "Hide history" : `History (${saved.history.length})`}
          </button>
        )}
      </div>

      {showHistory && (
        <div className="mt-3 divide-y divide-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
          {saved.history.map((version) => (
            <div key={version._id} className="flex flex-col gap-2 p-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[12px] text-[#6B7280]">
                  {when(version.at)}
                  {version.by ? ` · ${personName(version.by)}` : ""}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-[13px] text-[#374151]">{version.value ?? `(default) ${block.default}`}</p>
              </div>
              <button type="button" onClick={() => restore(version)} disabled={busy} className="shrink-0 text-[13px] font-semibold text-[#305CDE]">
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteContentSection({ onToast }) {
  const [group, setGroup] = useState(SITE_CONTENT_GROUPS[0]);
  const [saved, setSaved] = useState({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api();
      if (res.ok) {
        const { blocks } = await res.json();
        setSaved(Object.fromEntries((blocks || []).map((b) => [b.key, b])));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-[20px] font-extrabold text-[#0A1628]">Site content</h2>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          Edit the text on the site. Published changes go live straight away — no redeploy. City intros and category descriptions stay in
          their own editors.
        </p>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {SITE_CONTENT_GROUPS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setGroup(name)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${group === name ? "bg-[#0A1628] text-white" : "border border-[#E5E7EB] bg-white text-[#111827]"}`}
          >
            {name}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="py-8 text-center text-[14px] text-[#6B7280]">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {SITE_CONTENT_BLOCKS.filter((block) => block.group === group).map((block) => (
            <BlockEditor key={block.key} block={block} saved={saved[block.key]} onChanged={load} onToast={onToast} />
          ))}
        </div>
      )}
    </>
  );
}
