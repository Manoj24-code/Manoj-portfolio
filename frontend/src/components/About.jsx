import React from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { MemoryStick, MapPin } from "lucide-react";

export default function About() {
  const { about, profile } = useContent();
  return (
    <section id="about" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="block">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <span className="block-title-dot cyan" />
                  <span>MODULE // SYS_MEMORY — about()</span>
                </div>
                <span>0x10</span>
              </div>
              <div className="p-6 lg:p-8">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
                  Reading <span className="text-[var(--accent)]">/about.me</span>
                </h2>
                <p className="text-[var(--text-dim)] text-[15.5px] leading-[1.8] max-w-2xl">
                  {about.bio}
                </p>

                <div className="flex flex-wrap gap-2 mt-6">
                  {about.interests.map((i) => (
                    <span key={i} className="chip">{i}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="block">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>REGISTERS</span>
                </div>
                <span>R/O</span>
              </div>
              <div className="grid grid-cols-2">
                {about.stats.map((s, i) => (
                  <div
                    key={s.label}
                    className={`p-5 ${i % 2 === 0 ? "border-r" : ""} ${
                      i < 2 ? "border-b" : ""
                    } border-[var(--line)]`}
                  >
                    <div className="mono text-[10px] tracking-[0.15em] text-[var(--text-muted)]">
                      {s.label}
                    </div>
                    <div className="mono text-3xl text-[var(--text)] mt-1">{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="block p-5">
              <div className="flex items-center gap-2 mono text-[11px] tracking-[0.15em] text-[var(--text-dim)] mb-3">
                <MapPin className="w-3.5 h-3.5 text-[var(--accent-2)]" /> LOCATION
              </div>
              <div className="mono text-[14px] text-[var(--text)]">{profile.location}</div>
              <div className="mono text-[11px] text-[var(--text-muted)] mt-1">
                timezone: local • remote: ok
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <BinaryStream direction="rtl" label="DATA_BUS_1 → SKILLS" />
        </div>
      </div>
    </section>
  );
}
