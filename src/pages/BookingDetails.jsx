// import { useEffect, useState, useCallback } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { apiFetch } from "../utils/api";
// import VencomeLoader from "../components/Loader";

// const STATUS_CONFIG = {
//   confirmed: {
//     label: "Confirmed",
//     classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
//     dot: "bg-emerald-500",
//   },
//   pending: {
//     label: "Pending",
//     classes: "bg-amber-50 text-amber-700 border border-amber-200",
//     dot: "bg-amber-400",
//   },
//   cancelled: {
//     label: "Cancelled",
//     classes: "bg-red-50 text-red-600 border border-red-200",
//     dot: "bg-red-500",
//   },
// };

// function ConfirmModal({
//   title,
//   message,
//   confirmLabel,
//   confirmClass,
//   onConfirm,
//   onCancel,
//   loading,
// }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
//         <div className="text-4xl text-center mb-4">
//           {confirmClass?.includes("red") ? "Warning" : "Confirm"}
//         </div>
//         <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">
//           {title}
//         </h3>
//         <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
//           {message}
//         </p>
//         <div className="flex gap-3">
//           <button
//             onClick={onCancel}
//             disabled={loading}
//             className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
//           >
//             Go Back
//           </button>
//           <button
//             onClick={onConfirm}
//             disabled={loading}
//             className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${confirmClass}`}
//           >
//             {loading ? "Processing…" : confirmLabel}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function InfoRow({ label, value }) {
//   return (
//     <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
//       <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
//         {label}
//       </span>
//       <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
//     </div>
//   );
// }

// export default function BookingDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [booking, setBooking] = useState(null);
//   const [property, setProperty] = useState(null);
//   const [guest, setGuest] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [modal, setModal] = useState(null);
//   const [actionLoading, setActionLoading] = useState(false);
//   const [toast, setToast] = useState(null);

//   useEffect(() => {
//     const fetchBooking = async () => {
//       try {
//         const data = await apiFetch({
//           endpoint: `/bookings/${id}`,
//           method: "GET",
//           cacheable: true,
//         });
//         if (data.status === 401) {
//           navigate("/login");
//           return;
//         }
//         setBooking(data);

//         // Both property and guest are raw ObjectId strings — fetch in parallel
//         const propertyId =
//           typeof data.property === "object" ? data.property._id : data.property;
//         const guestId =
//           typeof data.guest === "object" ? data.guest._id : data.guest;

//         const [propertyData, guestData] = await Promise.allSettled([
//           propertyId
//             ? apiFetch({
//                 endpoint: `/properties/${propertyId}`,
//                 method: "GET",
//                 cacheable: true,
//               })
//             : null,
//           guestId
//             ? apiFetch({
//                 endpoint: `/profile/${guestId}`,
//                 method: "GET",
//                 cacheable: true,
//               })
//             : null,
//         ]);

//         if (propertyData.status === "fulfilled" && propertyData.value)
//           setProperty(propertyData.value.property);
//         if (guestData.status === "fulfilled" && guestData.value)
//           setGuest(guestData.value);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBooking();
//   }, [id]);

//   const showToast = (message, type = "success") => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   const handleAccept = useCallback(async () => {
//     setActionLoading(true);
//     try {
//       await apiFetch({
//         endpoint: `/bookings/${id}/status`,
//         method: "PUT",
//         body: { status: "confirmed" },
//       });
//       setBooking((prev) => ({ ...prev, status: "confirmed" }));
//       setModal(null);
//       showToast("Booking confirmed successfully.");
//     } catch {
//       showToast("Failed to confirm booking.", "error");
//     } finally {
//       setActionLoading(false);
//     }
//   }, [id]);

//   const handleCancel = useCallback(async () => {
//     setActionLoading(true);
//     try {
//       await apiFetch({ endpoint: `/bookings/${id}/cancel`, method: "DELETE" });
//       setBooking((prev) => ({ ...prev, status: "cancelled" }));
//       setModal(null);
//       showToast("Booking cancelled.");
//     } catch {
//       showToast("Failed to cancel booking.", "error");
//     } finally {
//       setActionLoading(false);
//     }
//   }, [id]);

//   if (loading) return <VencomeLoader />;
//   if (!booking)
//     return <div className="p-8 text-slate-400">Booking not found.</div>;

//   const { checkIn, checkOut, totalPrice, status, guests } = booking;
//   const nights =
//     booking.totalNights ??
//     Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
//   const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
//   const canAccept = status === "pending";
//   const canCancel = status !== "cancelled";
//   const initials = `${guest?.firstName?.[0] || ""}${
//     guest?.lastName?.[0] || ""
//   }`;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Toast */}
//       {toast && (
//         <div
//           className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${
//             toast.type === "error" ? "bg-red-600" : "bg-slate-900"
//           }`}
//         >
//           <span>{toast.type === "error" ? "Error" : "Success"}</span>
//           {toast.message}
//         </div>
//       )}

//       {/* Modals */}
//       {modal === "accept" && (
//         <ConfirmModal
//           title="Confirm this booking?"
//           message="The guest will be notified and the booking status will update to Confirmed."
//           confirmLabel="Yes, Confirm"
//           confirmClass="bg-emerald-600 hover:bg-emerald-700"
//           onConfirm={handleAccept}
//           onCancel={() => setModal(null)}
//           loading={actionLoading}
//         />
//       )}
//       {modal === "cancel" && (
//         <ConfirmModal
//           title="Cancel this booking?"
//           message="This may trigger a refund based on your cancellation policy. This cannot be undone."
//           confirmLabel="Yes, Cancel"
//           confirmClass="bg-red-600 hover:bg-red-700"
//           onConfirm={handleCancel}
//           onCancel={() => setModal(null)}
//           loading={actionLoading}
//         />
//       )}

//       {/* Dark header */}
//       <div className="bg-primary px-6 pt-6 pb-10 lg:px-10">
//         <button
//           onClick={() => navigate(-1)}
//           className="text-slate-200 hover:text-slate-400 text-sm font-medium mb-6 flex items-center gap-1.5 transition cursor-pointer"
//         >
//           ← Back
//         </button>
//         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-5xl">
//           <div>
//             <p className="text-[11px] font-bold tracking-widest text-slate-200 uppercase mb-1.5">
//               Booking #{id?.slice(-6).toUpperCase()}
//             </p>
//             <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
//               {property?.name || "Property Booking"}
//             </h1>
//             <p className="text-slate-200 text-sm mt-1">
//               {property?.address ||
//                 property?.location?.address ||
//                 "Address on file"}
//             </p>
//           </div>
//           <div
//             className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase self-start shrink-0 ${statusCfg.classes}`}
//           >
//             <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
//             {statusCfg.label}
//           </div>
//         </div>
//       </div>

//       {/* Body */}
//       <div className="max-w-5xl mx-auto px-4 lg:px-8 -mt-4 pb-6">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
//           {/* Left — spans 2 cols */}
//           <div className="lg:col-span-2 flex flex-col gap-5">
//             {/* Property card */}
//             {property && (
//               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
//                 {property.images?.[0] && (
//                   <img
//                     src={property.images[0]}
//                     alt={property.name}
//                     className="w-full h-44 object-cover"
//                   />
//                 )}
//                 <div className="p-6">
//                   <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
//                     Property
//                   </p>
//                   <p className="font-semibold text-slate-900 text-sm">
//                     {property.name}
//                   </p>
//                   <p className="text-slate-400 text-xs mt-1">
//                     {property.address ||
//                       property.location?.address ||
//                       property.location?.city ||
//                       "—"}
//                   </p>
//                   <div className="border-t border-slate-100 mt-4 pt-1">
//                     {property.category && (
//                       <InfoRow
//                         label="Category"
//                         value={property.category?.name ?? property.category}
//                       />
//                     )}
//                     {property.subcategory && (
//                       <InfoRow
//                         label="Type"
//                         value={
//                           property.subcategory?.name ?? property.subcategory
//                         }
//                       />
//                     )}
//                     {property.pricePerNight && (
//                       <InfoRow
//                         label="Price / night"
//                         value={`€${property.pricePerNight}`}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Guest card */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
//                 Guest
//               </p>
//               <div className="flex items-center gap-4 mb-5">
//                 <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
//                   {initials || "?"}
//                 </div>
//                 <div>
//                   <p className="font-semibold text-slate-900 text-sm">
//                     {guest?.firstName} {guest?.lastName}
//                   </p>
//                   <p className="text-slate-400 text-xs mt-0.5">
//                     {guest?.email}
//                   </p>
//                 </div>
//               </div>
//               <div className="border-t border-slate-100 pt-1">
//                 <InfoRow label="Phone" value={guest?.phoneNumber} />
//                 <InfoRow label="Guests" value={guests} />
//               </div>
//             </div>

//             {/* Stay card */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
//                 Stay Details
//               </p>
//               <div className="grid grid-cols-2 gap-3 mb-5">
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
//                     Check-in
//                   </p>
//                   <p className="text-sm font-semibold text-slate-800">
//                     {new Date(checkIn).toLocaleDateString("en-GB", {
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </p>
//                 </div>
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
//                     Check-out
//                   </p>
//                   <p className="text-sm font-semibold text-slate-800">
//                     {new Date(checkOut).toLocaleDateString("en-GB", {
//                       day: "numeric",
//                       month: "short",
//                       year: "numeric",
//                     })}
//                   </p>
//                 </div>
//               </div>
//               <div className="border-t border-slate-100 pt-1">
//                 <InfoRow
//                   label="Duration"
//                   value={`${nights} night${nights !== 1 ? "s" : ""}`}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="flex flex-col gap-5">
//             {/* Payment */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
//                 Payment
//               </p>
//               <p className="text-4xl font-bold text-slate-900 leading-none tracking-tight">
//                 €{totalPrice?.toLocaleString()}
//               </p>
//               <p className="text-slate-400 text-xs font-medium mt-2">
//                 Total charged
//               </p>
//               {nights > 0 && (
//                 <p className="text-slate-300 text-xs mt-1">
//                   ≈ €{Math.round(totalPrice / nights)} / night
//                 </p>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
//               <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
//                 Actions
//               </p>
//               <div className="flex flex-col gap-3">
//                 {canAccept && (
//                   <button
//                     onClick={() => setModal("accept")}
//                     className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold transition cursor-pointer"
//                   >
//                     Accept Booking
//                   </button>
//                 )}
//                 {canCancel && (
//                   <button
//                     onClick={() => setModal("cancel")}
//                     className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 active:scale-95 text-red-600 text-sm font-semibold transition cursor-pointer"
//                   >
//                     ✕ Cancel Booking
//                   </button>
//                 )}
//                 <button
//                   onClick={() =>
//                     navigate(`/messages?guest=${guest?._id}&booking=${id}`)
//                   }
//                   className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-semibold transition cursor-pointer"
//                 >
//                   ✉ Message Guest
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/api";
import VencomeLoader from "../components/Loader";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeft,
  Check,
  CheckCircle2,
  FileText,
  FolderOpen,
  MessageSquare,
  Printer,
  X,
} from "lucide-react";

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmed",
    classes: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-50 text-red-600 border border-red-200",
    dot: "bg-red-500",
  },
};

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
        <div className="mb-4 flex justify-center">
          {confirmClass?.includes("red") ? (
            <AlertTriangle size={36} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={36} className="text-emerald-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-500 text-center leading-relaxed mb-8">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
          >
            Go Back
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${confirmClass}`}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function LeaseSignModal({
  onClose,
  loading,
  isHost,
  bookingId,
  leaseUrl,
  leaseSignedAt,
  onLeaseSign,
  onLeaseUpload,
}) {
  const [signed, setSigned] = useState(false);
  const [printingOrDownloading, setPrintingOrDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [leaseFile, setLeaseFile] = useState(null);

  const handleDownloadLease = useCallback(async () => {
    if (!leaseUrl) {
      console.error("No lease URL available");
      return;
    }
    setPrintingOrDownloading(true);
    try {
      const response = await fetch(leaseUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "lease-agreement.pdf";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download lease:", err);
    } finally {
      setPrintingOrDownloading(false);
    }
  }, [leaseUrl]);

  const handlePrintLease = useCallback(() => {
    window.print();
  }, []);

  const handleFileUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLeaseFile(file);
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("leaseFile", file);
        formData.append("bookingId", bookingId);

        const response = await fetch("/api/bookings/upload-lease", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload lease");
        }

        const data = await response.json();
        if (onLeaseUpload) {
          onLeaseUpload(data.leaseUrl);
        }
      } catch (err) {
        console.error("Failed to upload lease:", err);
        setLeaseFile(null);
      } finally {
        setUploading(false);
      }
    },
    [bookingId, onLeaseUpload]
  );

  const handleSignConfirm = useCallback(async () => {
    if (!signed) return;
    if (onLeaseSign) {
      await onLeaseSign();
    }
    setSigned(false);
  }, [signed, onLeaseSign]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 max-h-[80vh] overflow-y-auto">
        <div className="mb-4 flex justify-center">
          <FileText size={36} className="text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 text-center mb-2">
          Lease Agreement
        </h3>

        {/* HOST VIEW - Upload Lease */}
        {isHost && (
          <>
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
              Upload the lease agreement file for this booking. Guests will be
              able to review, print, and e-sign it.
            </p>

            {leaseFile ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-semibold text-emerald-700 mb-1">
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    File Uploaded
                  </span>
                </p>
                <p className="text-xs text-emerald-600">{leaseFile.name}</p>
              </div>
            ) : (
              <label className="block mb-6">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-slate-400 hover:bg-slate-50 transition cursor-pointer">
                  <div className="mb-2 flex justify-center text-slate-500">
                    <FolderOpen size={28} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Click to upload lease file
                  </p>
                  <p className="text-xs text-slate-500">PDF, DOC, or DOCX</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                </div>
              </label>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={loading || uploading}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={onClose}
                disabled={!leaseFile || loading || uploading}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${
                  leaseFile && !uploading
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
              >
                {uploading ? "Uploading…" : "Done"}
              </button>
            </div>
          </>
        )}

        {/* GUEST VIEW - Review & Sign Lease */}
        {!isHost && (
          <>
            <p className="text-sm text-slate-500 text-center leading-relaxed mb-6">
              Please review the lease agreement. You can download, print, or
              sign electronically.
            </p>

            {!leaseUrl ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-amber-700 mb-1">
                    <span className="inline-flex items-center gap-2">
                      <AlertTriangle size={16} />
                      Pending Host Action
                    </span>
                  </p>
                  <p className="text-xs text-amber-600">
                    The host has not uploaded a lease agreement yet.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex items-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {/* Lease Preview/Content Area */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto text-xs text-slate-600">
                  <p className="font-semibold mb-2">LEASE AGREEMENT</p>
                  <p className="mb-2">
                    This Lease Agreement ("Agreement") is entered into between
                    the Property Owner ("Host") and the Guest.
                  </p>
                  <p className="mb-2">
                    <strong>Terms:</strong> The Guest agrees to occupy the
                    property during the specified dates and comply with all
                    house rules.
                  </p>
                  <p className="mb-2">
                    <strong>Payment:</strong> The Guest agrees to pay the total
                    amount as specified in the booking.
                  </p>
                  <p>
                    By signing below, both parties agree to the terms and
                    conditions outlined in this agreement.
                  </p>
                </div>

                {/* Download and Print Buttons - Always visible */}
                <div className="flex flex-col gap-3 mb-6">
                  <button
                    onClick={handleDownloadLease}
                    disabled={printingOrDownloading || loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowDownToLine size={16} />
                    Download PDF
                  </button>
                  <button
                    onClick={handlePrintLease}
                    disabled={printingOrDownloading || loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-700 text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                  >
                    <Printer size={16} />
                    Print
                  </button>
                </div>

                {/* E-Signature Section - Only show if NOT already signed */}
                {!leaseSignedAt ? (
                  <>
                    {/* E-Signature Checkbox */}
                    <div className="mb-6 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="sign-agreement"
                        checked={signed}
                        onChange={(e) => setSigned(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 accent-emerald-600 cursor-pointer"
                      />
                      <label
                        htmlFor="sign-agreement"
                        className="text-sm text-slate-700 cursor-pointer"
                      >
                        I have read and agree to the terms of this Lease
                        Agreement
                      </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSignConfirm}
                        disabled={!signed || loading}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition disabled:opacity-50 cursor-pointer ${
                          signed
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : "bg-slate-300 cursor-not-allowed"
                        }`}
                      >
                        {loading ? "Processing…" : "E-Sign & Confirm"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-emerald-700 mb-1">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        Agreement Signed
                      </span>
                    </p>
                    <p className="text-xs text-emerald-600">
                      You can still download or print the agreement above.
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full mt-3 py-2.5 rounded-xl border border-emerald-300 hover:bg-emerald-100 text-emerald-700 text-sm font-semibold transition cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm text-slate-800 font-medium">{value || "—"}</span>
    </div>
  );
}

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [property, setProperty] = useState(null);
  const [guest, setGuest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [leaseUrl, setLeaseUrl] = useState(null);
  const [leaseSignedAt, setLeaseSignedAt] = useState(null);

  // Determine if current user is the host
  // const isHost = currentUser && property && currentUser._id === property.hostId;
  const isHost = false;
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Fetch current user first
        const userData = await apiFetch({
          endpoint: "/auth/me", // Adjust endpoint based on your API
          method: "GET",
          cacheable: true,
        });
        if (userData.status === 401) {
          navigate("/login");
          return;
        }
        setCurrentUser(userData.user || userData);

        // Fetch booking details
        const data = await apiFetch({
          endpoint: `/bookings/${id}`,
          method: "GET",
          cacheable: true,
        });
        if (data.status === 401) {
          navigate("/login");
          return;
        }
        setBooking(data);
        setLeaseUrl(data.leaseUrl || null);
        setLeaseSignedAt(data.leaseSignedAt || null);

        // Both property and guest are raw ObjectId strings — fetch in parallel
        const propertyId =
          typeof data.property === "object" ? data.property._id : data.property;
        const guestId =
          typeof data.guest === "object" ? data.guest._id : data.guest;

        const [propertyData, guestData] = await Promise.allSettled([
          propertyId
            ? apiFetch({
                endpoint: `/properties/${propertyId}`,
                method: "GET",
                cacheable: true,
              })
            : null,
          guestId
            ? apiFetch({
                endpoint: `/profile/${guestId}`,
                method: "GET",
                cacheable: true,
              })
            : null,
        ]);

        if (propertyData.status === "fulfilled" && propertyData.value)
          setProperty(propertyData.value.property);
        if (guestData.status === "fulfilled" && guestData.value)
          setGuest(guestData.value);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleAccept = useCallback(async () => {
    setActionLoading(true);
    try {
      await apiFetch({
        endpoint: `/bookings/${id}/status`,
        method: "PUT",
        body: { status: "confirmed" },
      });
      setBooking((prev) => ({ ...prev, status: "confirmed" }));
      setModal(null);
      showToast("Booking confirmed successfully.");
    } catch {
      showToast("Failed to confirm booking.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  const handleCancel = useCallback(async () => {
    setActionLoading(true);
    try {
      await apiFetch({ endpoint: `/bookings/${id}/cancel`, method: "DELETE" });
      setBooking((prev) => ({ ...prev, status: "cancelled" }));
      setModal(null);
      showToast("Booking cancelled.");
    } catch {
      showToast("Failed to cancel booking.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  const handleLeaseSign = useCallback(async () => {
    setActionLoading(true);
    try {
      await apiFetch({
        endpoint: `/bookings/${id}/sign-lease`,
        method: "PUT",
        body: { leaseSignedAt: new Date().toISOString() },
      });
      setLeaseSignedAt(new Date().toISOString());
      setModal(null);
      showToast("Lease agreement signed successfully.");
    } catch {
      showToast("Failed to sign lease agreement.", "error");
    } finally {
      setActionLoading(false);
    }
  }, [id]);

  const handleLeaseUpload = useCallback((uploadedLeaseUrl) => {
    setLeaseUrl(uploadedLeaseUrl);
    showToast("Lease agreement uploaded successfully.");
  }, []);

  if (loading) return <VencomeLoader />;
  if (!booking)
    return <div className="p-8 text-slate-400">Booking not found.</div>;

  const { checkIn, checkOut, totalPrice, status, guests } = booking;
  const nights =
    booking.totalNights ??
    Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const canAccept = status === "pending" && isHost;
  const canCancel = status !== "cancelled" && isHost;
  const initials = `${guest?.firstName?.[0] || ""}${
    guest?.lastName?.[0] || ""
  }`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-medium ${
            toast.type === "error" ? "bg-red-600" : "bg-slate-900"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Modals */}
      {modal === "accept" && (
        <ConfirmModal
          title="Confirm this booking?"
          message="The guest will be notified and the booking status will update to Confirmed."
          confirmLabel="Yes, Confirm"
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
          onConfirm={handleAccept}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "cancel" && (
        <ConfirmModal
          title="Cancel this booking?"
          message="This may trigger a refund based on your cancellation policy. This cannot be undone."
          confirmLabel="Yes, Cancel"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleCancel}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "lease" && (
        <LeaseSignModal
          onClose={() => setModal(null)}
          loading={actionLoading}
          isHost={isHost}
          bookingId={id}
          leaseUrl={leaseUrl}
          leaseSignedAt={leaseSignedAt}
          onLeaseSign={handleLeaseSign}
          onLeaseUpload={handleLeaseUpload}
        />
      )}

      {/* Dark header */}
      <div className="bg-primary px-6 pt-6 pb-10 lg:px-10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-200 hover:text-slate-400 text-sm font-medium mb-6 flex items-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 max-w-5xl">
          <div>
            <p className="text-[11px] font-bold tracking-widest text-slate-200 uppercase mb-1.5">
              Booking #{id?.slice(-6).toUpperCase()}
            </p>
            <h1 className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              {property?.name || "Property Booking"}
            </h1>
            <p className="text-slate-200 text-sm mt-1">
              {property?.address ||
                property?.location?.address ||
                "Address on file"}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase self-start shrink-0 ${statusCfg.classes}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 -mt-4 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Left — spans 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Property card */}
            {property && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {property.images?.[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-44 object-cover"
                  />
                )}
                <div className="p-6">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-3">
                    Property
                  </p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {property.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-1">
                    {property.address ||
                      property.location?.address ||
                      property.location?.city ||
                      "—"}
                  </p>
                  <div className="border-t border-slate-100 mt-4 pt-1">
                    {property.category && (
                      <InfoRow
                        label="Category"
                        value={property.category?.name ?? property.category}
                      />
                    )}
                    {property.subcategory && (
                      <InfoRow
                        label="Type"
                        value={
                          property.subcategory?.name ?? property.subcategory
                        }
                      />
                    )}
                    {property.pricePerNight && (
                      <InfoRow
                        label="Price / night"
                        value={`€${property.pricePerNight}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Guest/Host card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                {isHost ? "Guest" : "Host"}
              </p>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {isHost ? initials || "?" : property?.hostInitials || "?"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">
                    {isHost
                      ? `${guest?.firstName} ${guest?.lastName}`
                      : property.host.firstName +
                          " " +
                          property.host.lastName || "Property Host"}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {isHost ? guest?.email : property?.host.email || ""}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                {/* <InfoRow
                  label={isHost ? "Phone" : "Contact"}
                  value={
                    isHost
                      ? guest?.phoneNumber
                      : property?.hostPhoneNumber || "—"
                  }
                /> */}
                {isHost && <InfoRow label="Guests" value={guests} />}
              </div>
            </div>

            {/* Stay card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Stay Details
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-in
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(checkIn).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-out
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(checkOut).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <InfoRow
                  label="Duration"
                  value={`${nights} night${nights !== 1 ? "s" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            {/* Payment */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Payment
              </p>
              <p className="text-4xl font-bold text-slate-900 leading-none tracking-tight">
                €{totalPrice?.toLocaleString()}
              </p>
              <p className="text-slate-400 text-xs font-medium mt-2">
                Total charged
              </p>
              {nights > 0 && (
                <p className="text-slate-300 text-xs mt-1">
                  ≈ €{Math.round(totalPrice / nights)} / night
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-5">
                Actions
              </p>
              <div className="flex flex-col gap-3">
                {/* Host-only actions */}
                {isHost && (
                  <>
                    {canAccept && (
                      <button
                        onClick={() => setModal("accept")}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold transition cursor-pointer"
                      >
                        <Check size={16} />
                        Accept Booking
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setModal("cancel")}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 active:scale-95 text-red-600 text-sm font-semibold transition cursor-pointer"
                      >
                        <X size={16} />
                        Cancel Booking
                      </button>
                    )}
                    <button
                      onClick={() =>
                        navigate(`/messages?guest=${guest?._id}&booking=${id}`)
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-semibold transition cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      Message Guest
                    </button>
                  </>
                )}

                {/* Guest-only actions */}
                {!isHost && (
                  <>
                    <button
                      onClick={() =>
                        navigate(
                          `/messages?host=${property?.hostId}&booking=${id}`
                        )
                      }
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-sm font-semibold transition cursor-pointer"
                    >
                      <MessageSquare size={16} />
                      Message Host
                    </button>
                    <button
                      onClick={() => setModal("lease")}
                      disabled={leaseSignedAt}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                        leaseSignedAt
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-blue-200 hover:bg-blue-50 active:scale-95 text-blue-600"
                      }`}
                    >
                      {leaseSignedAt ? (
                        <>
                          <CheckCircle2 size={16} />
                          Lease Signed
                        </>
                      ) : (
                        <>
                          <FileText size={16} />
                          Lease Agreement
                        </>
                      )}
                    </button>
                    {canCancel && (
                      <button
                        onClick={() => setModal("cancel")}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 active:scale-95 text-red-600 text-sm font-semibold transition cursor-pointer"
                      >
                        <X size={16} />
                        Cancel Booking
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
