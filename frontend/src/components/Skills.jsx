import React, { useState } from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { Zap } from "lucide-react";

export default function Skills() {
  const { skills } = useContent();
  const [active, setActive] = useState(0);
  const current = skills[active] || skills[0];
  if (!current) return null;

  return (
    <section id="skills" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x20 — PERIPHERAL_BANK
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Skill <span className="text-[var(--accent-2)]">peripherals</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mono text-[11px] text-[var(--text-dim)]">
            <Zap className="w-3.5 h-3.5 text-[var(--accent)]" /> {skills.length} BANKS CONNECTED
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Bank selector */}
          <div className="lg:col-span-4">
            <div className="block">
              <div className="block-header">
                <span>SELECT_BANK</span>
                <span>CS ↓</span>
              </div>
              <div>
                {skills.map((s, i) => (
                  <button
                    key={s.group}
                    onClick={() => setActive(i)}
                    className={`w-full text-left px-5 py-4 border-b border-[var(--line)] last:border-b-0 transition-colors flex items-center justify-between mono text-[12px] tracking-[0.12em] ${
                      active === i
                        ? "bg-[rgba(245,181,68,0.06)] text-[var(--accent)]"
                        : "text-[var(--text-dim)] hover:bg-[rgba(255,255,255,0.02)] hover:text-[var(--text)]"
                    }`}
                  >
                    <span>
                      <span className="text-[var(--text-muted)] mr-2">0x{(0x20 + i).toString(16).toUpperCase()}</span>
                      {s.group}
                    </span>
                    <span>{String(s.items.length).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skill bars */}
          <div className="lg:col-span-8">
            <div className="block">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <span className="block-title-dot" />
                  <span>{current.group} // read()</span>
                </div>
                <span>8-bit</span>
              </div>
              <div className="p-6 lg:p-8 space-y-5">
                {current.items.map((item) => (
                  <SkillBar key={item.name} name={item.name} level={item.level} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <BinaryStream speed="fast" label="DATA_BUS_2 → PROJECTS" />
        </div>
      </div>
    </section>
  );
}

function SkillBar({ name, level }) {
  // Map level to 8-bit byte visualisation
  const filled = Math.round((level / 100) * 16);
  const cells = Array.from({ length: 16 }, (_, i) => i < filled);
  return (
    <div>
      <div className="flex items-center justify-between mono text-[12px] mb-2">
        <span className="text-[var(--text)]">{name}</span>
        <span className="text-[var(--text-muted)]">{level}%</span>
      </div>
      <div className="flex gap-[3px]">
        {cells.map((on, i) => (
          <div
            key={i}
            className="h-2.5 flex-1 rounded-[1px]"
            style={{
              background: on
                ? (i < 8 ? "var(--accent)" : "var(--accent-2)")
                : "var(--line)",
              boxShadow: on ? "0 0 6px rgba(245,181,68,0.25)" : "none",
              opacity: on ? 1 : 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}
