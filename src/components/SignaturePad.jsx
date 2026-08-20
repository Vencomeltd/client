import { useRef, useState, useEffect, useCallback } from "react";

// No cursive Google Font is loaded app-wide (see root.jsx), so a typed
// signature falls back to the standard web-safe cursive stack instead of
// adding a new font just for this one input.
const CURSIVE_FONT = "'Brush Script MT', 'Segoe Script', 'Lucida Handwriting', cursive";

// Canvas-based drawn signature, with a "type your name instead" fallback.
// Reports its value via onChange(value), matching the direct-value callback
// convention already used by ExtraInput/YesNoToggle in this folder (rather
// than a raw DOM event), as { type: "drawn" | "typed", dataUrl, typedName }.
const SignaturePad = ({ onChange }) => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [mode, setMode] = useState("drawn");
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState("");

  const emitChange = useCallback(
    (value) => {
      if (onChange) onChange(value);
    },
    [onChange]
  );

  // (Re)initialize the canvas at device pixel ratio for crisp lines on a
  // blank white background whenever the drawing pad is mounted.
  useEffect(() => {
    if (mode !== "drawn") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.strokeStyle = "#0A1628";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [mode]);

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  // Pointer events cover mouse, touch, and pen through one API, so no
  // separate touch handlers are needed for touch support.
  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPoint(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasDrawn) setHasDrawn(true);
  };

  const finishStroke = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    emitChange({
      type: "drawn",
      dataUrl: canvasRef.current.toDataURL("image/png"),
      typedName: null,
    });
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    emitChange({ type: "drawn", dataUrl: null, typedName: null });
  };

  const handleTypedNameChange = (event) => {
    const value = event.target.value;
    setTypedName(value);
    emitChange({ type: "typed", dataUrl: null, typedName: value });
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setHasDrawn(false);
    setTypedName("");
    emitChange({ type: nextMode, dataUrl: null, typedName: null });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-700">
          {mode === "drawn" ? "Draw your signature" : "Type your name"}
        </span>
        <button
          type="button"
          onClick={() => switchMode(mode === "drawn" ? "typed" : "drawn")}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          {mode === "drawn" ? "Type your name instead" : "Draw your signature instead"}
        </button>
      </div>

      {mode === "drawn" ? (
        <>
          <canvas
            ref={canvasRef}
            className="w-full h-32 rounded-xl border border-slate-300 bg-white touch-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishStroke}
            onPointerLeave={finishStroke}
          />
          <button
            type="button"
            onClick={handleClear}
            disabled={!hasDrawn}
            className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-40 cursor-pointer"
          >
            Clear
          </button>
        </>
      ) : (
        <input
          type="text"
          value={typedName}
          onChange={handleTypedNameChange}
          placeholder="Your full name"
          maxLength={100}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-2xl outline-none focus:border-slate-400"
          style={{ fontFamily: CURSIVE_FONT }}
        />
      )}
    </div>
  );
};

export default SignaturePad;
