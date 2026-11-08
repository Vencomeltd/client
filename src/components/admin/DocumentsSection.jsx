import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileText, Folder, FolderPlus, Search, Upload } from "lucide-react";

// Admin -> Documents (build spec section 9.1): one place for every project
// document. Folders, drag-and-drop upload (50 MB per file), rename, move,
// delete with confirm, download a file (signed link) or a folder as a zip,
// search by name. Server: routes/adminDocuments.js.
const API = () => `${import.meta.env.VITE_API_URL}/admin/documents`;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("vencome_token")}` });

async function call(path, options = {}) {
  const json = options.body && !(options.body instanceof FormData);
  const res = await fetch(`${API()}${path}`, { ...options, headers: { ...authHeaders(), ...(json && { "Content-Type": "application/json" }) } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

const formatSize = (bytes) => (bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const personName = (user) => (user ? user.displayName || [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email : "Automatic");
const MAX_BYTES = 50 * 1024 * 1024;

export default function DocumentsSection({ onToast }) {
  const [folder, setFolder] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState({ folders: [], documents: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : `?folder=${encodeURIComponent(folder)}`;
      setData(await call(params));
    } catch (err) {
      onToast(err.message);
    } finally {
      setLoading(false);
    }
  }, [folder, query, onToast]);

  useEffect(() => {
    const timer = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, query]);

  const act = async (fn, message) => {
    try {
      await fn();
      if (message) onToast(message);
      load();
    } catch (err) {
      onToast(err.message);
    }
  };

  const uploadFiles = async (files) => {
    const list = [...files];
    if (!list.length) return;
    const tooBig = list.filter((f) => f.size > MAX_BYTES);
    if (tooBig.length) return onToast(`${tooBig.map((f) => f.name).join(", ")} ${tooBig.length === 1 ? "is" : "are"} over 50 MB`);
    setUploading(true);
    const form = new FormData();
    form.append("folder", folder);
    list.forEach((file) => form.append("files", file));
    await act(() => call("/upload", { method: "POST", body: form }), `Uploaded ${list.length} file${list.length === 1 ? "" : "s"}`);
    setUploading(false);
  };

  const newFolder = () => {
    const name = window.prompt("Folder name");
    if (name?.trim()) act(() => call("/folders", { method: "POST", body: JSON.stringify({ path: folder ? `${folder}/${name}` : name }) }), "Folder created");
  };

  const renameFolder = (path) => {
    const to = window.prompt("New folder name or path (e.g. Contracts/2026)", path);
    if (to?.trim() && to.trim() !== path) act(() => call("/folders", { method: "PATCH", body: JSON.stringify({ from: path, to }) }), "Folder moved");
  };

  const deleteFolder = (path) => {
    if (!window.confirm(`Delete the folder "${path}" and every file in it? This can't be undone.`)) return;
    act(() => call(`/folders?path=${encodeURIComponent(path)}&confirm=true`, { method: "DELETE" }), "Folder deleted");
  };

  const downloadBlob = async (url, name) => {
    try {
      const res = await fetch(url, { headers: authHeaders() });
      if (!res.ok) throw new Error("Download failed");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(await res.blob());
      link.download = name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      onToast(err.message);
    }
  };

  const downloadFile = async (doc) => {
    try {
      const { url } = await call(`/${doc._id}/download`);
      window.location.href = url;
    } catch (err) {
      onToast(err.message);
    }
  };

  const renameFile = (doc) => {
    const name = window.prompt("New name", doc.name);
    if (name?.trim() && name.trim() !== doc.name) act(() => call(`/${doc._id}`, { method: "PATCH", body: JSON.stringify({ name: name.trim() }) }), "Renamed");
  };

  const moveFile = (doc) => {
    const to = window.prompt("Move to folder (leave empty for the top level)", doc.folder);
    if (to !== null && to.trim() !== doc.folder) act(() => call(`/${doc._id}`, { method: "PATCH", body: JSON.stringify({ folder: to }) }), "Moved");
  };

  const deleteFile = (doc) => {
    if (!window.confirm(`Delete "${doc.name}"? This can't be undone.`)) return;
    act(() => call(`/${doc._id}?confirm=true`, { method: "DELETE" }), "Deleted");
  };

  const crumbs = folder ? folder.split("/") : [];
  const linkBtn = "text-[12px] font-semibold text-[#305CDE] hover:underline";

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-[20px] font-extrabold text-[#0A1628]">Documents</h2>
          <p className="mt-1 text-[13px] text-[#6B7280]">Every project document in one place. Files are private and download through short-lived links.</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by file name"
            className="h-10 w-[260px] rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[#0A1628]"
          />
        </div>
      </div>

      {!query && (
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px]">
          <button type="button" onClick={() => setFolder("")} className={folder ? linkBtn : "font-semibold text-[#0A1628]"}>
            All documents
          </button>
          {crumbs.map((name, i) => {
            const path = crumbs.slice(0, i + 1).join("/");
            return (
              <span key={path} className="flex items-center gap-2">
                <span className="text-[#9CA3AF]">/</span>
                <button type="button" onClick={() => setFolder(path)} className={path === folder ? "font-semibold text-[#0A1628]" : linkBtn}>
                  {name}
                </button>
              </span>
            );
          })}
          <span className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={newFolder} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold">
              <FolderPlus size={14} /> New folder
            </button>
            <button
              type="button"
              onClick={() => downloadBlob(`${API()}/folders/zip?path=${encodeURIComponent(folder)}`, `${folder.split("/").pop() || "Documents"}.zip`)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-semibold"
            >
              <Download size={14} /> Download {folder ? "folder" : "all"} as zip
            </button>
          </span>
        </div>
      )}

      {!query && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInput.current?.click()}
          className={`mb-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center text-[13px] ${
            dragging ? "border-[#305CDE] bg-[#EEF2FF]" : "border-[#D1D5DB] bg-[#FAFAFA]"
          }`}
        >
          <Upload size={20} className="mb-2 text-[#305CDE]" />
          <p className="font-semibold text-[#0A1628]">{uploading ? "Uploading…" : `Drop files here to upload to ${folder || "the top level"}`}</p>
          <p className="text-[#6B7280]">or click to choose · up to 50 MB each</p>
          <input ref={fileInput} type="file" multiple hidden onChange={(e) => uploadFiles(e.target.files)} />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        {loading ? (
          <p className="px-4 py-10 text-center text-[14px] text-[#6B7280]">Loading…</p>
        ) : data.folders.length === 0 && data.documents.length === 0 ? (
          <p className="px-4 py-10 text-center text-[14px] text-[#6B7280]">{query ? "No files match" : "This folder is empty"}</p>
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {data.folders.map((path) => (
              <div key={path} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button type="button" onClick={() => setFolder(path)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-[14px] font-semibold text-[#0A1628]">
                  <Folder size={18} className="shrink-0 text-[#305CDE]" /> {path.split("/").pop()}
                </button>
                <button type="button" onClick={() => renameFolder(path)} className={linkBtn}>Rename / move</button>
                <button type="button" onClick={() => deleteFolder(path)} className="text-[12px] font-semibold text-[#DC2626] hover:underline">Delete</button>
              </div>
            ))}
            {data.documents.map((doc) => (
              <div key={doc._id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <FileText size={18} className="shrink-0 text-[#6B7280]" />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[#0A1628]">{doc.name}</p>
                    <p className="text-[12px] text-[#6B7280]">
                      {query && doc.folder ? `${doc.folder} · ` : ""}
                      {formatSize(doc.size)} · {personName(doc.uploadedBy)} ·{" "}
                      {new Date(doc.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => downloadFile(doc)} className={linkBtn}>Download</button>
                <button type="button" onClick={() => renameFile(doc)} className={linkBtn}>Rename</button>
                <button type="button" onClick={() => moveFile(doc)} className={linkBtn}>Move</button>
                <button type="button" onClick={() => deleteFile(doc)} className="text-[12px] font-semibold text-[#DC2626] hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
