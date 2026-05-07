import React, { useEffect, useState } from "react";
import { useContent } from "../context/ContentContext";
import { ChevronRight, Download, Mail, Terminal } from "lucide-react";
import BinaryStream from "./BinaryStream";

const TYPED_LINES = [
  "[    0.000000] Linux portfolio 6.5.0-embedded #1 SMP PREEMPT_RT",
  "[    0.042118] CPU: ARMv8 Cortex-A72 @ 168MHz, FPU=yes",
  "[    0.134221] systemd[1]: Mounted /dev/portfolio on /",
  "[    0.289557] systemd[1]: Started main.service \u2014 OK",
  "user@portfolio:~$ cat /etc/motd",
];

export default function Hero() {
  const { profile } = useContent();
  const [typed, setTyped] = useState([]);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    let line = 0, ch = 0;
    const t = setInterval(() => {
      if (line >= TYPED_LINES.length) { clearInterval(t); return; }
      const full = TYPED_LINES[line];
      ch++;
      setCurrent(full.slice(0, ch));
      if (ch >= full.length) {
        setTyped((prev) => [...prev, full]);
        setCurrent("");
        line++; ch = 0;
      }
    }, 22);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="core" className="relative grid-bg">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 lg:pt-20 pb-10">
        {/* top address bar */}
        <div className="flex items-center justify-between mono text-[10px] text-[var(--text-muted)] mb-5">
          <span>// SYSTEM_ARCHITECTURE.DIAGRAM</span>
          <span>ADDR 0x0000_0000 — MAIN_CORE</span>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: CPU block */}
          <div className="lg:col-span-7">
            <div className="block relative p-6 lg:p-10">
              <span className="pin left" style={{ top: "30%" }} />
              <span className="pin left" style={{ top: "55%" }} />
              <span className="pin left" style={{ top: "75%" }} />
              <span className="pin right" style={{ top: "30%" }} />
              <span className="pin right" style={{ top: "55%" }} />
              <span className="pin right" style={{ top: "75%" }} />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="block-title-dot" />
                  <span className="mono text-[11px] tracking-[0.18em] text-[var(--text-dim)]">
                    MAIN_CORE // {profile.clockSpeed}
                  </span>
                </div>
                <span className="chip">
                  <span className="led" style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }} />
                  {profile.availability}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                {profile.name}
              </h1>
              <p className="mono text-[13px] tracking-[0.1em] text-[var(--accent)] mt-3">
                &gt; {profile.role.toUpperCase()}
              </p>
              <p className="text-[var(--text-dim)] text-lg mt-5 max-w-xl leading-relaxed">
                {profile.tagline}. I work at the intersection of hardware and code — shipping firmware that is tight, predictable and field-ready.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="#projects" className="btn primary">
                  VIEW_PROJECTS <ChevronRight className="w-3.5 h-3.5" />
                </a>
                <a href={profile.resumeUrl} className="btn">
                  <Download className="w-3.5 h-3.5" /> RESUME.PDF
                </a>
                <a href={`mailto:${profile.email}`} className="btn">
                  <Mail className="w-3.5 h-3.5" /> CONTACT
                </a>
              </div>
            </div>
          </div>

          {/* Right: Boot terminal */}
          <div className="lg:col-span-5">
            <div className="block h-full flex flex-col">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-[var(--accent-2)]" />
                  <span>tty0 // boot.log</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ef5a6f]" />
                  <span className="w-2 h-2 rounded-full bg-[#f5b544]" />
                  <span className="w-2 h-2 rounded-full bg-[#7ad07d]" />
                </div>
              </div>
              <div className="p-5 mono text-[12.5px] leading-7 text-[var(--text-dim)] flex-1">
                {typed.map((l, i) => {
                  const isKernel = l.startsWith("[");
                  const isPrompt = l.startsWith("user@");
                  return (
                    <div key={i} className={isPrompt ? "text-[var(--accent)]" : ""}>
                      {isKernel ? (
                        <>
                          <span className="text-[var(--text-muted)]">{l.slice(0, l.indexOf("]") + 1)}</span>
                          <span className="text-[var(--ok)]">{l.slice(l.indexOf("]") + 1)}</span>
                        </>
                      ) : (
                        l
                      )}
                    </div>
                  );
                })}
                {current && (
                  <div>
                    <span>{current}</span>
                    <span className="inline-block w-2 h-4 bg-[var(--accent)] align-middle ml-0.5 animate-pulse" />
                  </div>
                )}
                <div className="mt-4 text-[var(--text-muted)]">
                  # {profile.location}
                </div>
                <div className="text-[var(--text-muted)]">
                  # mail: {profile.email}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* binary bus out of hero */}
        <div className="mt-10">
          <BinaryStream label="DATA_BUS_0 → ABOUT" />
        </div>
      </div>
    </section>
  );
}
