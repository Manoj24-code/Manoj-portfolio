import React from "react";
import { useContent } from "../context/ContentContext";
import BinaryStream from "./BinaryStream";
import { GraduationCap, BookOpen } from "lucide-react";

export default function Education() {
  const { education } = useContent();
  return (
    <section id="education" className="relative">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-14 lg:py-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-muted)] mb-2">
              // 0x50 &mdash; ROM_EDU
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Academic <span className="text-[var(--accent)]">ROM</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 mono text-[11px] text-[var(--text-dim)]">
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-2)]" /> $ cat /etc/education.conf
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {education.map((e) => (
            <div key={e.id} className="block">
              <div className="block-header">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-[var(--accent)]" />
                  <span>{e.id} // degree()</span>
                </div>
                <span>{e.period}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[var(--text)] leading-snug">
                  {e.degree}
                </h3>
                <div className="mono text-[12px] text-[var(--accent-2)] mt-1">
                  @ {e.school}
                </div>
                <div className="mono text-[11px] text-[var(--text-muted)] mt-2">
                  grade: <span className="text-[var(--text-dim)]">{e.grade}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {e.notes.map((n, i) => (
                    <li key={i} className="text-[var(--text-dim)] text-[13.5px] leading-relaxed flex gap-2">
                      <span className="mono text-[var(--accent)] shrink-0">›</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <BinaryStream direction="rtl" label="DATA_BUS_5 → CERTIFICATIONS" />
        </div>
      </div>
    </section>
  );
}
