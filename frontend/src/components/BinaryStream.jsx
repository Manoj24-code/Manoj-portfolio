import React from "react";

// Continuously scrolling binary data stream used as a connector between blocks
export default function BinaryStream({ direction = "ltr", speed = "normal", label }) {
  // Build a long string of 0/1 with occasional hex bytes
  const bits = React.useMemo(() => {
    const chunks = [];
    for (let i = 0; i < 220; i++) {
      const r = Math.random();
      if (r < 0.08) chunks.push("0x" + Math.floor(Math.random() * 256).toString(16).padStart(2, "0").toUpperCase());
      else chunks.push(Math.random() > 0.5 ? "1" : "0");
    }
    return chunks.join(" ");
  }, []);

  const trackClass = [
    "bin-track",
    direction === "rtl" ? "reverse" : "",
    speed === "fast" ? "fast" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="relative" aria-hidden="true">
      {label && (
        <div className="mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase mb-1 px-1">
          {label}
        </div>
      )}
      <div className="bin-stream">
        <div className={trackClass}>
          {bits}
          {"  "}
          {bits}
        </div>
      </div>
      <div className="signal-line"><span className="signal-dot" /></div>
    </div>
  );
}
