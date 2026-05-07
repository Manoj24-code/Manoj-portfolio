import React from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { Clock } from "lucide-react";

export default function Experience() {
  const { experience } = useContent();
  return (
    <section id="experience" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x40 — TIMELINE_BUFFER
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Execution <span className="text-[var(--accent-2)]">pipeline</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mono text-[11px] text-[var(--text-dim)]">
            <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> $ systemctl list-units --type=work
          </div>
        </div>

        <div className="block">
          <div className="block-header">
            <div className="flex items-center gap-2">
              <span className="block-title-dot" />
              <span>TIMELINE.STREAM</span>
            </div>
            <span>DEPTH {experience.length}</span>
          </div>

          <div className="relative p-6 lg:p-8">
            {/* vertical rail */}
            <div className="absolute left-[34px] lg:left-[42px] top-6 bottom-6 w-px bg-[var(--line-strong)]" />

            <div className="space-y-8">
              {experience.map((e) => (
                <div key={e.id} className="flex gap-5 lg:gap-7 relative">
                  {/* node */}
                  <div className="shrink-0 relative z-10">
                    <div className="w-5 h-5 rounded-sm border border-[var(--accent)] bg-[var(--bg-card)] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mono text-[10.5px] tracking-[0.14em] text-[var(--text-muted)] mb-1">
                      <span>{e.id}</span>
                      <span>•</span>
                      <span>{e.period}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{e.role}</h3>
                    <div className="mono text-[12px] text-[var(--accent)] mt-0.5">@ {e.org}</div>
                    <ul className="mt-3 space-y-1.5">
                      {e.bullets.map((b, i) => (
                        <li key={i} className="text-[var(--text-dim)] text-[14px] leading-relaxed flex gap-2">
                          <span className="mono text-[var(--accent-2)] shrink-0">›</span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <BinaryStream label="DATA_BUS_4 → EDUCATION" speed="fast" />
        </div>
      </div>
    </section>
  );
}
