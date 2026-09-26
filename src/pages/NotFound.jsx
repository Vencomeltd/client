import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Drifting dot grid
    const COLS = 18;
    const ROWS = 12;
    const dots = Array.from({ length: COLS * ROWS }, (_, i) => ({
      x: (i % COLS) / (COLS - 1),
      y: Math.floor(i / COLS) / (ROWS - 1),
      phase: Math.random() * Math.PI * 2,
      speed: 0.003 + Math.random() * 0.004,
      amp: 0.008 + Math.random() * 0.012,
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 1;

      dots.forEach((dot) => {
        const px =
          dot.x * w + Math.sin(t * dot.speed + dot.phase) * dot.amp * w;
        const py =
          dot.y * h + Math.cos(t * dot.speed * 0.7 + dot.phase) * dot.amp * h;
        const dist = Math.hypot(px - w / 2, py - h / 2);
        const maxDist = Math.hypot(w / 2, h / 2);
        const alpha = 0.04 + (1 - dist / maxDist) * 0.1;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26,26,26,${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;600;700;900&family=Barlow+Condensed:wght@700;900&display=swap');

        .nf-root {
          font-family: 'Barlow', sans-serif;
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .nf-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .nf-content {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 48px 32px;
          max-width: 560px;
          animation: nf-fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes nf-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nf-code {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: clamp(120px, 22vw, 200px);
          font-weight: 900;
          line-height: 1;
          color: #305CDE;
          letter-spacing: -0.04em;
          margin: 0;
          position: relative;
          display: inline-block;
          animation: nf-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
        }

        .nf-code::after {
          content: '404';
          position: absolute;
          inset: 0;
          color: transparent;
          -webkit-text-stroke: 1px #d1d5db;
          transform: translate(3px, 3px);
          z-index: -1;
        }

        .nf-divider {
          width: 40px;
          height: 3px;
          background: #305CDE;
          margin: 20px auto 24px;
          animation: nf-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
        }

        .nf-title {
          font-size: 22px;
          font-weight: 700;
          color: #305CDE;
          margin: 0 0 12px;
          letter-spacing: -0.01em;
          animation: nf-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }

        .nf-sub {
          font-size: 15px;
          font-weight: 400;
          color: #6b7280;
          margin: 0 0 36px;
          line-height: 1.6;
          animation: nf-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
        }

        .nf-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          animation: nf-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
        }

        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #305CDE;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 12px 24px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .nf-btn-primary:hover {
          background: #374151;
          transform: translateY(-1px);
        }
        .nf-btn-primary:active { transform: translateY(0); }

        .nf-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #305CDE;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          padding: 12px 24px;
          font-family: 'Barlow', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.01em;
          cursor: pointer;
          transition: border-color 0.15s ease, transform 0.15s ease;
        }
        .nf-btn-ghost:hover {
          border-color: #305CDE;
          transform: translateY(-1px);
        }
        .nf-btn-ghost:active { transform: translateY(0); }
      `}</style>

      <div className="nf-root">
        <canvas ref={canvasRef} className="nf-canvas" />
        <div className="nf-content">
          <p className="nf-code">404</p>
          <div className="nf-divider" />
          <h1 className="nf-title">Page not found</h1>
          <p className="nf-sub">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="nf-actions">
            <button className="nf-btn-primary" onClick={() => navigate("/")}>
              ← Go home
            </button>
            <button className="nf-btn-ghost" onClick={() => navigate(-1)}>
              Go back
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
